"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Database,
  Table,
  Code,
  BarChart3,
  ChevronRight,
  RefreshCw,
  Search,
  LogOut,
  Hash,
} from "lucide-react";
import { TableInfo, ViewMode } from "@/types";
import { fetchTables } from "@/lib/supabase";

interface SidebarProps {
  activeTable: string | null;
  activeView: ViewMode;
  onSelectTable: (table: string) => void;
  onViewChange: (view: ViewMode) => void;
  onDisconnect: () => void;
  connectionName: string;
}

export default function Sidebar({
  activeTable,
  activeView,
  onSelectTable,
  onViewChange,
  onDisconnect,
  connectionName,
}: SidebarProps) {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  const loadTables = useCallback(async () => {
    setLoading(true);
    try {
      const t = await fetchTables();
      setTables(t);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  const filtered = tables.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const viewButtons: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
    { mode: "data", icon: <Table size={16} />, label: "Data" },
    { mode: "schema", icon: <Database size={16} />, label: "Schema" },
    { mode: "sql", icon: <Code size={16} />, label: "SQL" },
    { mode: "stats", icon: <BarChart3 size={16} />, label: "Stats" },
  ];

  if (collapsed) {
    return (
      <div className="w-12 bg-surface border-r border-border flex flex-col items-center py-3 gap-2">
        <button
          onClick={() => setCollapsed(false)}
          className="p-2 text-muted hover:text-teal-400 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
        {viewButtons.map((vb) => (
          <button
            key={vb.mode}
            onClick={() => onViewChange(vb.mode)}
            className={`p-2 rounded transition-colors ${
              activeView === vb.mode
                ? "text-teal-400 bg-surface-active"
                : "text-muted hover:text-zinc-300"
            }`}
            title={vb.label}
          >
            {vb.icon}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="w-64 bg-surface border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <Database size={16} className="text-teal-500 flex-shrink-0" />
            <span className="text-sm font-medium truncate">{connectionName}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={loadTables}
              className="p-1.5 text-muted hover:text-zinc-300 transition-colors rounded hover:bg-surface-hover"
              title="Refresh tables"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={onDisconnect}
              className="p-1.5 text-muted hover:text-red-400 transition-colors rounded hover:bg-surface-hover"
              title="Disconnect"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Filter tables..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-oled border border-border rounded px-3 py-1.5 pl-8 text-sm text-zinc-300 placeholder:text-muted focus:border-teal-600 transition-colors"
          />
        </div>
      </div>

      {/* View Modes */}
      <div className="flex border-b border-border">
        {viewButtons.map((vb) => (
          <button
            key={vb.mode}
            onClick={() => onViewChange(vb.mode)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors ${
              activeView === vb.mode
                ? "text-teal-400 border-b-2 border-teal-500 bg-surface-hover"
                : "text-muted hover:text-zinc-300 hover:bg-surface-hover"
            }`}
          >
            {vb.icon}
            <span className="hidden lg:inline">{vb.label}</span>
          </button>
        ))}
      </div>

      {/* Table List */}
      <div className="flex-1 overflow-y-auto py-1">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw size={20} className="animate-spin text-muted" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-muted text-sm">
            {search ? "No tables match filter" : "No tables found"}
          </div>
        ) : (
          filtered.map((table) => (
            <button
              key={table.name}
              onClick={() => onSelectTable(table.name)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors group ${
                activeTable === table.name
                  ? "bg-teal-500/10 text-teal-400 border-r-2 border-teal-500"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-surface-hover"
              }`}
            >
              <Table size={14} className="flex-shrink-0 opacity-50" />
              <span className="truncate flex-1 text-left">{table.name}</span>
              <span className="flex items-center gap-0.5 text-xs text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                <Hash size={10} />
                {table.rowCount}
              </span>
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <div className="text-xs text-muted">
          {tables.length} table{tables.length !== 1 ? "s" : ""} in public schema
        </div>
      </div>
    </div>
  );
}
