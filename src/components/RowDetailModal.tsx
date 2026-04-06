"use client";

import React, { useState, useEffect } from "react";
import { X, Eye, Copy, Check } from "lucide-react";

interface RowDetailModalProps {
  row: Record<string, unknown>;
  tableName: string;
  onClose: () => void;
}

export default function RowDetailModal({
  row,
  tableName,
  onClose,
}: RowDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const columns = Object.keys(row);

  function copyJson() {
    navigator.clipboard.writeText(JSON.stringify(row, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function formatValue(val: unknown): string {
    if (val === null || val === undefined) return "NULL";
    if (typeof val === "object") return JSON.stringify(val, null, 2);
    return String(val);
  }

  function getValueColor(val: unknown): string {
    if (val === null || val === undefined) return "text-muted italic";
    if (typeof val === "boolean") return val ? "text-green-400" : "text-red-400";
    if (typeof val === "number") return "text-blue-400";
    if (typeof val === "object") return "text-orange-400";
    return "text-zinc-200";
  }

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Eye size={16} className="text-teal-500" />
            <h3 className="text-sm font-semibold text-zinc-200">
              Row Detail - {tableName}
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={copyJson}
              className="flex items-center gap-1 px-2 py-1 text-xs text-muted hover:text-zinc-300 transition-colors"
              title="Copy as JSON"
            >
              {copied ? (
                <Check size={12} className="text-green-400" />
              ) : (
                <Copy size={12} />
              )}
              {copied ? "Copied" : "JSON"}
            </button>
            <button
              onClick={onClose}
              className="p-1 text-muted hover:text-zinc-300 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {columns.map((col) => (
            <div key={col} className="group">
              <div className="text-xs font-medium text-muted mb-1">{col}</div>
              <div
                className={`text-sm font-mono bg-oled border border-border rounded px-3 py-2 break-all whitespace-pre-wrap ${getValueColor(
                  row[col]
                )}`}
              >
                {formatValue(row[col])}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
