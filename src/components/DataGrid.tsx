"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  RefreshCw,
  Filter,
  X,
  Edit3,
  Trash2,
  Check,
  ChevronsLeft,
  ChevronsRight,
  Eye,
} from "lucide-react";
import { ColumnInfo, FilterConfig, SortConfig } from "@/types";
import RowDetailModal from "./RowDetailModal";
import ConfirmDialog from "./ConfirmDialog";
import {
  fetchTableData,
  fetchTableSchema,
  exportToCSV,
  exportToJSON,
  deleteRow,
  updateRow,
} from "@/lib/supabase";

interface DataGridProps {
  tableName: string;
  onInsertRow: () => void;
}

export default function DataGrid({ tableName, onInsertRow }: DataGridProps) {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(50);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortConfig>({ column: "", direction: null });
  const [filters, setFilters] = useState<FilterConfig[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [editingCell, setEditingCell] = useState<{
    row: number;
    col: string;
  } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showExport, setShowExport] = useState(false);
  const [primaryKey, setPrimaryKey] = useState<string>("id");
  const [detailRow, setDetailRow] = useState<Record<string, unknown> | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Record<string, unknown> | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const schema = await fetchTableSchema(tableName);
      setColumns(schema.columns);
      const pk = schema.columns.find((c) => c.isPrimary);
      if (pk) setPrimaryKey(pk.name);

      const activeFilters = filters.filter((f) => f.column && f.value);
      const result = await fetchTableData(
        tableName,
        page,
        pageSize,
        sort.column || undefined,
        sort.direction || undefined,
        activeFilters.length > 0 ? activeFilters : undefined
      );
      setData(result.data);
      setTotalCount(result.count);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [tableName, page, pageSize, sort, filters]);

  useEffect(() => {
    setPage(0);
    setSort({ column: "", direction: null });
    setFilters([]);
  }, [tableName]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleSort(col: string) {
    setSort((prev) => {
      if (prev.column === col) {
        if (prev.direction === "asc") return { column: col, direction: "desc" };
        if (prev.direction === "desc") return { column: "", direction: null };
        return { column: col, direction: "asc" };
      }
      return { column: col, direction: "asc" };
    });
  }

  function addFilter() {
    setFilters([...filters, { column: columns[0]?.name || "", operator: "eq", value: "" }]);
  }

  function removeFilter(idx: number) {
    setFilters(filters.filter((_, i) => i !== idx));
  }

  function updateFilter(idx: number, field: keyof FilterConfig, value: string) {
    const updated = [...filters];
    updated[idx] = { ...updated[idx], [field]: value };
    setFilters(updated);
  }

  async function handleDeleteRow(row: Record<string, unknown>) {
    const pkVal = row[primaryKey];
    if (pkVal === undefined) return;
    setConfirmDelete(row);
  }

  async function confirmDeleteRow() {
    if (!confirmDelete) return;
    const pkVal = confirmDelete[primaryKey];
    const { error } = await deleteRow(tableName, primaryKey, pkVal);
    if (!error) loadData();
    setConfirmDelete(null);
  }

  function startEdit(rowIdx: number, col: string) {
    setEditingCell({ row: rowIdx, col });
    setEditValue(String(data[rowIdx][col] ?? ""));
  }

  async function saveEdit() {
    if (!editingCell) return;
    const row = data[editingCell.row];
    const pkVal = row[primaryKey];
    if (pkVal === undefined) return;

    let parsedValue: unknown = editValue;
    if (editValue === "") parsedValue = null;
    else if (editValue === "true") parsedValue = true;
    else if (editValue === "false") parsedValue = false;
    else if (!isNaN(Number(editValue)) && editValue.trim() !== "") parsedValue = Number(editValue);

    const { error } = await updateRow(
      tableName,
      { [editingCell.col]: parsedValue },
      primaryKey,
      pkVal
    );
    if (!error) {
      loadData();
    }
    setEditingCell(null);
  }

  const totalPages = Math.ceil(totalCount / pageSize);
  const displayColumns = columns.length > 0 ? columns.map((c) => c.name) : (data.length > 0 ? Object.keys(data[0]) : []);

  function formatCellValue(val: unknown): string {
    if (val === null || val === undefined) return "NULL";
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
  }

  const cellCls = "px-3 py-2 text-sm border-r border-b border-border truncate";
  const headerCls = "px-3 py-2 text-xs font-medium text-muted uppercase tracking-wider border-r border-b border-border bg-surface sticky top-0 cursor-pointer select-none";

  const operators = [
    { value: "eq", label: "=" },
    { value: "neq", label: "!=" },
    { value: "gt", label: ">" },
    { value: "gte", label: ">=" },
    { value: "lt", label: "<" },
    { value: "lte", label: "<=" },
    { value: "like", label: "LIKE" },
    { value: "ilike", label: "ILIKE" },
    { value: "is", label: "IS" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-zinc-200">{tableName}</h2>
          <span className="text-xs text-muted px-2 py-0.5 bg-surface-active rounded">
            {totalCount.toLocaleString()} rows
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded transition-colors ${
              showFilters || filters.length > 0
                ? "bg-teal-500/10 text-teal-400"
                : "text-muted hover:text-zinc-300 hover:bg-surface-hover"
            }`}
          >
            <Filter size={14} />
            Filter
            {filters.length > 0 && (
              <span className="bg-teal-500 text-white text-[10px] px-1.5 rounded-full">
                {filters.length}
              </span>
            )}
          </button>
          <button
            onClick={onInsertRow}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-muted hover:text-zinc-300 hover:bg-surface-hover rounded transition-colors"
          >
            <Plus size={14} />
            Insert
          </button>
          <div className="relative">
            <button
              onClick={() => setShowExport(!showExport)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-muted hover:text-zinc-300 hover:bg-surface-hover rounded transition-colors"
            >
              <Download size={14} />
              Export
            </button>
            {showExport && (
              <div className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-lg shadow-xl z-20 py-1 min-w-[120px]">
                <button
                  onClick={() => { exportToCSV(data, tableName); setShowExport(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-surface-hover"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => { exportToJSON(data, tableName); setShowExport(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-surface-hover"
                >
                  Export JSON
                </button>
              </div>
            )}
          </div>
          <button
            onClick={loadData}
            className="p-1.5 text-muted hover:text-zinc-300 hover:bg-surface-hover rounded transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="px-4 py-2 border-b border-border bg-surface space-y-2">
          {filters.map((f, i) => (
            <div key={i} className="flex items-center gap-2">
              <select
                value={f.column}
                onChange={(e) => updateFilter(i, "column", e.target.value)}
                className="bg-oled border border-border rounded px-2 py-1 text-xs text-zinc-300 min-w-[120px]"
              >
                {displayColumns.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select
                value={f.operator}
                onChange={(e) => updateFilter(i, "operator", e.target.value)}
                className="bg-oled border border-border rounded px-2 py-1 text-xs text-zinc-300"
              >
                {operators.map((op) => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>
              <input
                type="text"
                value={f.value}
                onChange={(e) => updateFilter(i, "value", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadData()}
                placeholder="Value..."
                className="bg-oled border border-border rounded px-2 py-1 text-xs text-zinc-300 flex-1 placeholder:text-muted"
              />
              <button
                onClick={() => removeFilter(i)}
                className="p-1 text-muted hover:text-red-400"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <button
            onClick={addFilter}
            className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
          >
            + Add filter
          </button>
        </div>
      )}

      {/* Data Table */}
      <div className="flex-1 overflow-auto">
        {loading && data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <RefreshCw size={24} className="animate-spin text-muted" />
          </div>
        ) : displayColumns.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted text-sm">
            No data to display
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={`${headerCls} w-10 text-center`}>#</th>
                {displayColumns.map((col) => (
                  <th
                    key={col}
                    className={headerCls}
                    onClick={() => handleSort(col)}
                  >
                    <div className="flex items-center gap-1">
                      <span>{col}</span>
                      {sort.column === col && sort.direction === "asc" && (
                        <ArrowUp size={12} className="text-teal-400" />
                      )}
                      {sort.column === col && sort.direction === "desc" && (
                        <ArrowDown size={12} className="text-teal-400" />
                      )}
                    </div>
                  </th>
                ))}
                <th className={`${headerCls} w-20 text-center`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="hover:bg-surface-hover/50 transition-colors"
                >
                  <td className={`${cellCls} text-center text-muted text-xs`}>
                    {page * pageSize + rowIdx + 1}
                  </td>
                  {displayColumns.map((col) => (
                    <td
                      key={col}
                      className={`${cellCls} max-w-[300px] cursor-pointer`}
                      onDoubleClick={() => startEdit(rowIdx, col)}
                    >
                      {editingCell?.row === rowIdx && editingCell?.col === col ? (
                        <div className="flex items-center gap-1 -mx-1">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit();
                              if (e.key === "Escape") setEditingCell(null);
                            }}
                            autoFocus
                            className="bg-oled border border-teal-500 rounded px-1.5 py-0.5 text-sm text-zinc-200 flex-1 min-w-[80px]"
                          />
                          <button onClick={saveEdit} className="text-teal-400 hover:text-teal-300">
                            <Check size={14} />
                          </button>
                          <button onClick={() => setEditingCell(null)} className="text-muted hover:text-zinc-300">
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <span
                          className={
                            row[col] === null
                              ? "text-muted italic"
                              : typeof row[col] === "boolean"
                              ? row[col]
                                ? "text-green-400"
                                : "text-red-400"
                              : "text-zinc-300"
                          }
                        >
                          {formatCellValue(row[col])}
                        </span>
                      )}
                    </td>
                  ))}
                  <td className={`${cellCls} text-center`}>
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => setDetailRow(row)}
                        className="p-1 text-muted hover:text-teal-400 transition-colors"
                        title="View detail"
                      >
                        <Eye size={12} />
                      </button>
                      <button
                        onClick={() => startEdit(rowIdx, displayColumns[0])}
                        className="p-1 text-muted hover:text-teal-400 transition-colors"
                        title="Edit"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteRow(row)}
                        className="p-1 text-muted hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-surface text-xs text-muted">
        <div>
          Showing {data.length > 0 ? page * pageSize + 1 : 0}-
          {Math.min((page + 1) * pageSize, totalCount)} of {totalCount.toLocaleString()}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(0)}
            disabled={page === 0}
            className="p-1 hover:text-zinc-300 disabled:opacity-30 transition-colors"
          >
            <ChevronsLeft size={14} />
          </button>
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="p-1 hover:text-zinc-300 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="px-2 text-zinc-400">
            Page {page + 1} of {totalPages || 1}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="p-1 hover:text-zinc-300 disabled:opacity-30 transition-colors"
          >
            <ChevronRight size={14} />
          </button>
          <button
            onClick={() => setPage(totalPages - 1)}
            disabled={page >= totalPages - 1}
            className="p-1 hover:text-zinc-300 disabled:opacity-30 transition-colors"
          >
            <ChevronsRight size={14} />
          </button>
        </div>
      </div>

      {/* Row Detail Modal */}
      {detailRow && (
        <RowDetailModal
          row={detailRow}
          tableName={tableName}
          onClose={() => setDetailRow(null)}
        />
      )}

      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <ConfirmDialog
          title="Delete Row"
          message={`Are you sure you want to delete this row? This action cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
          onConfirm={confirmDeleteRow}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
