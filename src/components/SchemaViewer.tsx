"use client";

import React, { useState, useEffect } from "react";
import {
  Key,
  Link,
  Hash,
  Type,
  ToggleLeft,
  Calendar,
  Braces,
  Columns3,
  ArrowRight,
} from "lucide-react";
import { TableSchema } from "@/types";
import { fetchTableSchema } from "@/lib/supabase";

interface SchemaViewerProps {
  tableName: string;
}

function getTypeIcon(type: string) {
  const t = type.toLowerCase();
  if (t.includes("int") || t.includes("numeric") || t.includes("decimal") || t.includes("float") || t.includes("double"))
    return <Hash size={14} className="text-blue-400" />;
  if (t.includes("bool"))
    return <ToggleLeft size={14} className="text-yellow-400" />;
  if (t.includes("timestamp") || t.includes("date") || t.includes("time"))
    return <Calendar size={14} className="text-purple-400" />;
  if (t.includes("json"))
    return <Braces size={14} className="text-orange-400" />;
  if (t.includes("text") || t.includes("char") || t.includes("varchar"))
    return <Type size={14} className="text-green-400" />;
  return <Columns3 size={14} className="text-muted" />;
}

function getTypeBadgeColor(type: string): string {
  const t = type.toLowerCase();
  if (t.includes("int") || t.includes("numeric") || t.includes("decimal"))
    return "bg-blue-500/10 text-blue-400 border-blue-500/20";
  if (t.includes("bool"))
    return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
  if (t.includes("timestamp") || t.includes("date"))
    return "bg-purple-500/10 text-purple-400 border-purple-500/20";
  if (t.includes("json"))
    return "bg-orange-500/10 text-orange-400 border-orange-500/20";
  if (t.includes("text") || t.includes("char"))
    return "bg-green-500/10 text-green-400 border-green-500/20";
  if (t.includes("uuid"))
    return "bg-pink-500/10 text-pink-400 border-pink-500/20";
  return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
}

export default function SchemaViewer({ tableName }: SchemaViewerProps) {
  const [schema, setSchema] = useState<TableSchema | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchTableSchema(tableName)
      .then(setSchema)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tableName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-muted">
        Loading schema...
      </div>
    );
  }

  if (!schema) {
    return (
      <div className="flex items-center justify-center h-full text-muted">
        Failed to load schema
      </div>
    );
  }

  return (
    <div className="p-6 overflow-auto h-full">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Table Header */}
        <div>
          <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <Columns3 size={20} className="text-teal-500" />
            {schema.tableName}
          </h2>
          <p className="text-sm text-muted mt-1">
            {schema.columns.length} columns
            {schema.foreignKeys.length > 0 && ` / ${schema.foreignKeys.length} foreign keys`}
          </p>
        </div>

        {/* Columns */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-medium text-zinc-300">Columns</h3>
          </div>
          <div className="divide-y divide-border">
            {schema.columns.map((col) => (
              <div
                key={col.name}
                className="px-4 py-3 flex items-center gap-3 hover:bg-surface-hover/50 transition-colors"
              >
                <div className="flex-shrink-0">{getTypeIcon(col.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-200">
                      {col.name}
                    </span>
                    {col.isPrimary && (
                      <span className="flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded">
                        <Key size={8} />
                        PK
                      </span>
                    )}
                    {col.isUnique && !col.isPrimary && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded">
                        UNIQUE
                      </span>
                    )}
                    {!col.nullable && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded">
                        NOT NULL
                      </span>
                    )}
                  </div>
                  {col.defaultValue && (
                    <div className="text-xs text-muted mt-0.5">
                      Default: <span className="text-zinc-400 font-mono">{col.defaultValue}</span>
                    </div>
                  )}
                </div>
                <span
                  className={`text-xs font-mono px-2 py-1 border rounded ${getTypeBadgeColor(col.type)}`}
                >
                  {col.type}
                  {col.maxLength && `(${col.maxLength})`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Foreign Keys */}
        {schema.foreignKeys.length > 0 && (
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Link size={14} className="text-teal-500" />
                Foreign Keys
              </h3>
            </div>
            <div className="divide-y divide-border">
              {schema.foreignKeys.map((fk) => (
                <div
                  key={fk.constraintName}
                  className="px-4 py-3 flex items-center gap-3 hover:bg-surface-hover/50 transition-colors"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-zinc-300 font-mono">{fk.columnName}</span>
                    <ArrowRight size={14} className="text-muted" />
                    <span className="text-teal-400 font-mono">
                      {fk.foreignTable}.{fk.foreignColumn}
                    </span>
                  </div>
                  <span className="text-xs text-muted ml-auto">{fk.constraintName}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
