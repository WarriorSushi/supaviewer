"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface SpinnerProps {
  size?: number;
  className?: string;
}

export function Spinner({ size = 20, className = "" }: SpinnerProps) {
  return (
    <Loader2
      size={size}
      className={`animate-spin text-muted ${className}`}
    />
  );
}

interface LoadingOverlayProps {
  message?: string;
}

export default function LoadingOverlay({ message = "Loading..." }: LoadingOverlayProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <Spinner size={28} className="text-teal-500" />
      <span className="text-sm text-muted">{message}</span>
    </div>
  );
}
