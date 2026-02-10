"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

type Point = { x: number; y: number };

function getCanvasPoint(canvas: HTMLCanvasElement, clientX: number, clientY: number): Point {
  const rect = canvas.getBoundingClientRect();
  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };
}

function exportSignature(canvas: HTMLCanvasElement) {
  // Export with a capped resolution to keep payload small and saves reliable.
  const cssW = Math.max(1, canvas.clientWidth);
  const cssH = Math.max(1, canvas.clientHeight);

  // Reasonable upper bounds (works well on mobile, keeps base64 compact)
  const maxW = 700;
  const maxH = 220;

  const scale = Math.min(maxW / cssW, maxH / cssH, 1);
  const outW = Math.max(1, Math.round(cssW * scale));
  const outH = Math.max(1, Math.round(cssH * scale));

  const out = document.createElement("canvas");
  out.width = outW;
  out.height = outH;

  const ctx = out.getContext("2d");
  if (!ctx) return canvas.toDataURL("image/png");

  // White background improves compression + legibility in PDFs
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, outW, outH);

  // Draw the full backing-store of the source canvas into the output canvas.
  // Use canvas.width/height (the backing-store size) as source to avoid
  // incorrect scaling / cropping caused by mixing CSS and backing-store units.
  ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, outW, outH);

  // JPEG is significantly smaller and very stable across browsers
  return out.toDataURL("image/jpeg", 0.78);
}

export function SignaturePad({
  value,
  onChange,
  label,
  hint,
  disabled,
  className,
}: {
  value?: string;
  onChange: (dataUrl: string) => void;
  label: string;
  hint?: string;
  disabled?: boolean;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<Point | null>(null);

  const dpr = useMemo(() => (typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1), []);

  const resizeAndRedraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const cssWidth = parent.clientWidth;
    const cssHeight = canvas.style.height ? parseInt(canvas.style.height, 10) : canvas.clientHeight;

    // Resize backing store
    canvas.width = Math.max(1, Math.floor(cssWidth * dpr));
    canvas.height = Math.max(1, Math.floor(cssHeight * dpr));

    // Keep CSS size
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    // Redraw image if present
    const v = (value || "").trim();
    if (v) {
      const img = new Image();
      img.onload = () => {
        const padding = 10;
        const w = cssWidth - padding * 2;
        const h = cssHeight - padding * 2;
        // Fit inside
        const ratio = Math.min(w / img.width, h / img.height);
        const drawW = img.width * ratio;
        const drawH = img.height * ratio;
        const x = (cssWidth - drawW) / 2;
        const y = (cssHeight - drawH) / 2;
        ctx.drawImage(img, x, y, drawW, drawH);
      };
      img.src = v;
    }
  };

  useEffect(() => {
    resizeAndRedraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, dpr]);

  useEffect(() => {
    const onResize = () => resizeAndRedraw();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dpr]);

  const getCtx = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = disabled ? "rgba(100,116,139,0.6)" : "rgba(15,23,42,0.95)"; // slate-900-ish
    ctx.lineWidth = 2.2;
    return ctx;
  };

  const commit = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = exportSignature(canvas);
    onChange(dataUrl);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    onChange("");
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    lastPointRef.current = getCanvasPoint(canvas, e.clientX, e.clientY);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = getCtx();
    if (!ctx) return;

    const p = getCanvasPoint(canvas, e.clientX, e.clientY);
    const lp = lastPointRef.current;
    if (!lp) {
      lastPointRef.current = p;
      return;
    }

    ctx.beginPath();
    ctx.moveTo(lp.x, lp.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();

    lastPointRef.current = p;
  };

  const endStroke = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    lastPointRef.current = null;
    commit();
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{label}</div>
        <button
          type="button"
          onClick={clear}
          disabled={disabled}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold transition",
            disabled
              ? "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
              : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          )}
        >
          Pulisci
        </button>
      </div>

      <div
        className={cn(
          "rounded-2xl border border-dashed p-2",
          disabled
            ? "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/30"
            : "border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950/60"
        )}
      >
        <canvas
          ref={canvasRef}
          className={cn(
            "block w-full touch-none select-none rounded-xl",
            disabled ? "opacity-60" : "opacity-100"
          )}
          style={{ height: 160 }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endStroke}
          onPointerCancel={endStroke}
          onPointerLeave={endStroke}
          aria-label={label}
        />
      </div>

      {hint ? (
        <div className="text-xs text-slate-600 dark:text-slate-400">{hint}</div>
      ) : null}
    </div>
  );
}