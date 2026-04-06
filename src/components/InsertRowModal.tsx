"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Save } from "lucide-react";
import { ColumnInfo } from "@/types";
import { fetchTableSchema, insertRow } from "@/lib/supabase";

interface InsertRowModalProps {
  tableName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InsertRowModal({
  tableName,
  onClose,
  onSuccess,
}: InsertRowModalProps) {
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingSchema, setLoadingSchema] = useState(true);

  useEffect(() => {
    fetchTableSchema(tableName)
      .then((schema) => {
        setColumns(schema.columns);
        const defaults: Record<string, string> = {};
        schema.columns.forEach((col) => {
          if (col.defaultValue) {
            defaults[col.name] = "";
          }
        });
        setValues(defaults);
      })
      .catch(() => {})
      .finally(() => setLoadingSchema(false));
  }, [tableName]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const row: Record<string, unknown> = {};
    for (const col of columns) {
      const val = values[col.name];
      if (val === undefined || val === "") {
        // Skip columns with defaults or nullable columns
        if (col.defaultValue || col.nullable) continue;
        // If not nullable and no default, still skip and let DB error
        continue;
      }
      // Parse value based on type
      const t = col.type.toLowerCase();
      if (t.includes("int") || t.includes("numeric") || t.includes("float") || t.includes("double") || t.includes("decimal")) {
        row[col.name] = Number(val);
      } else if (t.includes("bool")) {
        row[col.name] = val.toLowerCase() === "true" || val === "1";
      } else if (val === "null") {
        row[col.name] = null;
      } else if (t.includes("json")) {
        try {
          row[col.name] = JSON.parse(val);
        } catch {
          row[col.name] = val;
        }
      } else {
        row[col.name] = val;
      }
    }

    const result = await insertRow(tableName, row);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      onSuccess();
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Plus size={16} className="text-teal-500" />
            <h3 className="text-sm font-semibold text-zinc-200">
              Insert Row into {tableName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-muted hover:text-zinc-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        {loadingSchema ? (
          <div className="p-8 text-center text-muted text-sm">Loading schema...</div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {columns.map((col) => (
                <div key={col.name}>
                  <label className="flex items-center gap-2 text-xs font-medium text-muted mb-1">
                    <span>{col.name}</span>
                    <span className="text-zinc-500 font-mono">({col.type})</span>
                    {col.isPrimary && (
                      <span className="text-teal-400 text-[10px]">PK</span>
                    )}
                    {!col.nullable && !col.defaultValue && (
                      <span className="text-red-400 text-[10px]">required</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={values[col.name] || ""}
                    onChange={(e) =>
                      setValues({ ...values, [col.name]: e.target.value })
                    }
                    placeholder={
                      col.defaultValue
                        ? `Default: ${col.defaultValue}`
                        : col.nullable
                        ? "NULL"
                        : "Required"
                    }
                    className="w-full bg-oled border border-border rounded px-3 py-2 text-sm text-zinc-200 placeholder:text-muted/50 focus:border-teal-600 transition-colors font-mono"
                  />
                </div>
              ))}
            </div>

            {error && (
              <div className="mx-4 mb-2 bg-red-500/10 border border-red-500/20 rounded px-3 py-2 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-sm text-muted hover:text-zinc-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded transition-colors"
              >
                <Save size={14} />
                {loading ? "Inserting..." : "Insert Row"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
