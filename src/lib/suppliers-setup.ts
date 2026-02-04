"use client";

export async function ensureSuppliersTable() {
  const res = await fetch(
    "https://nrdsgtuzpnamcovuzghb.supabase.co/functions/v1/setup-suppliers",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: "{}",
    }
  );

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.error || "Impossibile creare la tabella fornitori");
  }

  return res.json();
}