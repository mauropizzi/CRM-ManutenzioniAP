"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-sheet"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useSidebar } from "@/context/sidebar-context"

// --- Sheet Components (from ui/sheet.tsx, adapted for sidebar) ---
const Sheet = SheetPrimitive.Root
const SheetTrigger = SheetPrimitive.Trigger
const SheetClose = SheetPrimitive.Close

const sheetVariants = cva(
  "fixed inset-0 z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom: "border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
        right: "border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
      },
    },
    defaultVariants: {
      side: "left",
    },
  }
)

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "left", className, children, ...props }, ref) => (
  <SheetPrimitive.Portal>
    <SheetPrimitive.Overlay
      className="fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
      {children}
      <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPrimitive.Portal>
))
SheetContent.displayName = SheetPrimitive.Content.displayName

// --- Sidebar Specific Components ---

interface SidebarProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Sidebar({ children, open, onOpenChange }: SidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r bg-background dark:bg-gray-950 p-4">
        <ScrollArea className="h-full">
          {children}
        </ScrollArea>
      </aside>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-64 p-0">
          <ScrollArea className="h-full">
            {children}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  )
}

export function SidebarHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between h-16 px-4 border-b lg:px-6">
      {children}
    </div>
  )
}

export function SidebarBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 overflow-y-auto py-4">
      {children}
    </div>
  )
}

export function SidebarGroup({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 px-4 lg:px-6">
      {title && <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{title}</h3>}
      <nav className="grid items-start gap-2">
        {children}
      </nav>
    </div>
  )
}

interface SidebarMenuItemProps {
  children: React.ReactNode;
  isActive?: boolean;
}

export function SidebarMenuItem({ children, isActive }: SidebarMenuItemProps) {
  return (
    <div className={cn(
      "flex items-center rounded-lg px-3 py-2 text-gray-900 dark:text-gray-50 transition-all hover:bg-gray-100 dark:hover:bg-gray-800",
      isActive && "bg-gray-100 dark:bg-gray-800"
    )}>
      {children}
    </div>
  )
}

interface SidebarMenuButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
  tooltip?: string;
  asChild?: boolean;
}

export function SidebarMenuButton({ tooltip, children, asChild, ...props }: SidebarMenuButtonProps) {
  const { closeSidebar } = useSidebar();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (props.onClick) {
      props.onClick(e);
    }
    closeSidebar(); // Close sidebar on click
  };

  const buttonContent = asChild ? (
    React.cloneElement(children as React.ReactElement, { onClick: handleClick })
  ) : (
    <Button
      variant="ghost"
      className="w-full justify-start p-0 h-auto text-base font-normal"
      onClick={handleClick}
      {...props}
    >
      {children}
    </Button>
  );

  return tooltip ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {buttonContent}
        </TooltipTrigger>
        <TooltipContent side="right">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    buttonContent
  );
}

export function SidebarTrigger() {
  const { openSidebar } = useSidebar();
  return (
    <Button variant="ghost" size="icon" className="lg:hidden" onClick={openSidebar}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  );
}