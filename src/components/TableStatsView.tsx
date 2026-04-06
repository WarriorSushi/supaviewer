"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Hash,
  HardDrive,
  Columns3,
  RefreshCw,
  Type,
  ToggleLeft,
  Calendar,
  Braces,
} from "lucide-react";
import { TableStats } from "@/types";
import { fetchTableStats } from "@/lib/supabase";

interface TableStatsViewProps {
  tableName: string;
}

function getTypeColor(type: string): string {
  const t = type.toLowerCase();
  if (t.includes("int") || t.includes("numeric")) return "text-blue-400";
  if (t.includes("bool")) return "text-yellow-400";
  if (t.includes("timestamp") || t.includes("date")) return "text-purple-400";
  if (t.includes("json")) return "text-orange-400";
  if (t.includes("text") || t.includes("char")) return "text-green-400";
  if (t.includes("uuid")) return "text-pink-400";
  return "text-zinc-400";
}

function getTypeIcon(type: string) {
  const t = type.toLowerCase();
  if (t.includes("int") || t.includes("numeric")) return <Hash size={14} />;
  if (t.includes("bool")) return <ToggleLeft size={14} />;
  if (t.includes("timestamp") || t.includes("date")) return <Calendar size={14} />;
  if (t.includes("json")) return <Braces size={14} />;
  return <Type size={14} />;
}

export default function TableStatsView({ tableName }: TableStatsViewProps) {
  const [stats, setStats] = useState<TableStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchTableStats(tableName)
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tableName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw size={24} className="animate-spin text-muted" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full text-muted text-sm">
        Failed to load stats
      </div>
    );
  }

  // Count column types
  const typeCounts: Record<string, number> = {};
  stats.columns.forEach((c) => {
    const baseType = c.type.split(" ")[0].toLowerCase();
    typeCounts[baseType] = (typeCounts[baseType] || 0) + 1;
  });

  const nullableCount = stats.columns.filter((c) => c.nullable).length;
  const requiredCount = stats.columns.length - nullableCount;

  return (
    <div className="p-6 overflow-auto h-full">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <BarChart3 size={20} className="text-teal-500" />
            {tableName} Statistics
          </h2>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted text-xs font-medium mb-2">
              <Hash size={14} />
              Total Rows
            </div>
            <div className="text-2xl font-bold text-zinc-100">
              {stats.rowCount.toLocaleString()}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted text-xs font-medium mb-2">
              <Columns3 size={14} />
              Columns
            </div>
            <div className="text-2xl font-bold text-zinc-100">
              {stats.columnCount}
            </div>
            <div className="text-xs text-muted mt-1">
              {requiredCount} required, {nullableCount} nullable
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted text-xs font-medium mb-2">
              <HardDrive size={14} />
              Estimated Size
            </div>
            <div className="text-2xl font-bold text-zinc-100">
              {stats.estimatedSize}
            </div>
          </div>
        </div>

        {/* Column Types Distribution */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-medium text-zinc-300">Column Type Distribution</h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {Object.entries(typeCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => (
                  <div key={type} className="flex items-center gap-3">
                    <div className={`flex-shrink-0 ${getTypeColor(type)}`}>
                      {getTypeIcon(type)}
                    </div>
                    <span className="text-sm text-zinc-300 font-mono w-32 truncate">
                      {type}
                    </span>
                    <div className="flex-1 bg-oled rounded-full h-2">
                      <div
                        className="bg-teal-500/60 h-2 rounded-full transition-all"
                        style={{
                          width: `${(count / stats.columnCount) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted w-8 text-right">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Column Details Table */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-medium text-zinc-300">Column Details</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-2 text-xs font-medium text-muted">Column</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted">Type</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted">Nullable</th>
              </tr>
            </thead>
            <tbody>
              {stats.columns.map((col) => (
                <tr
                  key={col.name}
                  className="border-b border-border/50 hover:bg-surface-hover/50 transition-colors"
                >
                  <td className="px-4 py-2 text-sm text-zinc-200 font-mono">{col.name}</td>
                  <td className={`px-4 py-2 text-sm font-mono ${getTypeColor(col.type)}`}>
                    {col.type}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        col.nullable
                          ? "bg-yellow-500/10 text-yellow-400"
                          : "bg-green-500/10 text-green-400"
                      }`}
                    >
                      {col.nullable ? "YES" : "NO"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
