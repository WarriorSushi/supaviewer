"use client";

import React from "react";
import { AlertTriangle, X, Check } from "lucide-react";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-xl w-full max-w-sm">
        <div className="p-5">
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-full flex-shrink-0 ${
                variant === "danger"
                  ? "bg-red-500/10 text-red-400"
                  : "bg-teal-500/10 text-teal-400"
              }`}
            >
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-200 mb-1">
                {title}
              </h3>
              <p className="text-sm text-muted">{message}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border">
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted hover:text-zinc-300 transition-colors"
          >
            <X size={14} />
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-white rounded transition-colors ${
              variant === "danger"
                ? "bg-red-600 hover:bg-red-500"
                : "bg-teal-600 hover:bg-teal-500"
            }`}
          >
            <Check size={14} />
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
