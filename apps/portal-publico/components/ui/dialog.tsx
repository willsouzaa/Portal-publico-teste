"use client";

import React, { ReactNode, useEffect, useRef } from "react";

type DialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export function Dialog({ open = false, onOpenChange, children, className = "", ...rest }: DialogProps) {
  const lastActive = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      lastActive.current = document.activeElement as HTMLElement | null;
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      lastActive.current?.focus?.();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open) onOpenChange?.(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div aria-hidden={!open} {...rest} className={`fixed inset-0 z-50 flex items-center justify-center ${className}`}>
      {/* backdrop */}
      <div aria-hidden="true" className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => onOpenChange?.(false)} />

      {/* container do diálogo */}
      <div role="dialog" aria-modal="true" className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-auto p-6" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

type SimpleProps<T extends HTMLElement> = {
  children?: ReactNode;
  className?: string;
} & React.HTMLAttributes<T>;

export function DialogContent({ children, className = "", ...rest }: SimpleProps<HTMLDivElement>) {
  return (
    <div className={className} {...rest}>
      {children}
    </div>
  );
}

export function DialogHeader({ children, ...rest }: SimpleProps<HTMLDivElement>) {
  return <div {...rest}>{children}</div>;
}

export function DialogTitle({ children, className = "", ...rest }: SimpleProps<HTMLHeadingElement>) {
  return (
    <h3 className={className} {...rest}>
      {children}
    </h3>
  );
}

export function DialogDescription({ children, ...rest }: SimpleProps<HTMLParagraphElement>) {
  return <p {...rest}>{children}</p>;
}