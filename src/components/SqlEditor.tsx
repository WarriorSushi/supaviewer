"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Clock,
  Trash2,
  Copy,
  CheckCircle,
  AlertCircle,
  Download,
  History,
  X,
} from "lucide-react";
import { QueryHistoryItem, QueryResult } from "@/types";
import {
  executeQuery,
  getQueryHistory,
  addToQueryHistory,
  exportToCSV,
  exportToJSON,
} from "@/lib/supabase";

export default function SqlEditor() {
  const [query, setQuery] = useState("SELECT * FROM ");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState<QueryHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setHistory(getQueryHistory());
  }, []);

  const runQuery = useCallback(async () => {
    if (!query.trim() || running) return;
    setRunning(true);
    setResult(null);

    const res = await executeQuery(query.trim());
    setResult(res);
    addToQueryHistory({
      query: query.trim(),
      duration: res.duration,
      rowCount: res.rowCount,
      error: res.error,
    });
    setHistory(getQueryHistory());
    setRunning(false);
  }, [query, running]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      runQuery();
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      setQuery(query.substring(0, start) + "  " + query.substring(end));
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  }

  function loadFromHistory(item: QueryHistoryItem) {
    setQuery(item.query);
    setShowHistory(false);
  }

  function copyResults() {
    if (!result?.data) return;
    navigator.clipboard.writeText(JSON.stringify(result.data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const cellCls = "px-3 py-2 text-sm border-r border-b border-border truncate";
  const headerCls = "px-3 py-2 text-xs font-medium text-muted uppercase tracking-wider border-r border-b border-border bg-surface sticky top-0 cursor-pointer select-none";

  const resultColumns = result?.data && result.data.length > 0
    ? Object.keys(result.data[0])
    : [];

  return (
    <div className="flex flex-col h-full">
      {/* Editor */}
      <div className="flex flex-col border-b border-border">
        <div className="flex items-center justify-between px-4 py-2 bg-surface border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-200">SQL Editor</span>
            <span className="text-xs text-muted">Ctrl+Enter to run</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded transition-colors ${
                showHistory
                  ? "bg-teal-500/10 text-teal-400"
                  : "text-muted hover:text-zinc-300 hover:bg-surface-hover"
              }`}
            >
              <History size={14} />
              History
            </button>
            <button
              onClick={runQuery}
              disabled={running || !query.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-teal-600 hover:bg-teal-500 disabled:bg-teal-800 disabled:opacity-50 text-white rounded transition-colors"
            >
              <Play size={14} />
              {running ? "Running..." : "Run"}
            </button>
          </div>
        </div>

        <div className="relative">
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-oled text-zinc-200 p-4 text-sm font-mono resize-none focus:outline-none sql-editor min-h-[160px]"
            placeholder="Write your SQL query here..."
            spellCheck={false}
          />
          {/* Line numbers overlay */}
          <div className="absolute left-0 top-0 px-2 py-4 text-right pointer-events-none select-none border-r border-border/50 min-w-[32px]">
            {query.split("\n").map((_, i) => (
              <div key={i} className="text-xs text-muted/50 leading-[21px]">
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* History Panel */}
      {showHistory && (
        <div className="border-b border-border bg-surface max-h-[200px] overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border sticky top-0 bg-surface">
            <span className="text-xs font-medium text-muted">Query History</span>
            <button onClick={() => setShowHistory(false)} className="text-muted hover:text-zinc-300">
              <X size={14} />
            </button>
          </div>
          {history.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted">No query history yet</div>
          ) : (
            history.map((item) => (
              <button
                key={item.id}
                onClick={() => loadFromHistory(item)}
                className="w-full text-left px-4 py-2 border-b border-border/50 hover:bg-surface-hover transition-colors group"
              >
                <div className="flex items-center gap-2 mb-1">
                  {item.error ? (
                    <AlertCircle size={12} className="text-red-400" />
                  ) : (
                    <CheckCircle size={12} className="text-green-400" />
                  )}
                  <span className="text-xs text-muted">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                  <span className="text-xs text-muted">
                    {item.duration.toFixed(0)}ms
                  </span>
                  {!item.error && (
                    <span className="text-xs text-muted">
                      {item.rowCount} rows
                    </span>
                  )}
                </div>
                <div className="text-xs text-zinc-400 font-mono truncate">
                  {item.query}
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Results */}
      <div className="flex-1 overflow-auto">
        {result === null && !running ? (
          <div className="flex items-center justify-center h-full text-muted text-sm">
            Run a query to see results
          </div>
        ) : running ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-2 text-muted">
              <Clock size={16} className="animate-pulse" />
              <span className="text-sm">Executing query...</span>
            </div>
          </div>
        ) : result?.error ? (
          <div className="p-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle size={14} className="text-red-400" />
                <span className="text-sm font-medium text-red-400">Error</span>
              </div>
              <pre className="text-xs text-red-300 whitespace-pre-wrap font-mono">
                {result.error}
              </pre>
            </div>
          </div>
        ) : result?.data && result.data.length > 0 ? (
          <>
            <div className="flex items-center justify-between px-4 py-1.5 bg-surface border-b border-border">
              <div className="flex items-center gap-3 text-xs text-muted">
                <span>{result.rowCount} rows</span>
                <span>{result.duration.toFixed(1)}ms</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={copyResults}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-muted hover:text-zinc-300 transition-colors"
                >
                  {copied ? <CheckCircle size={12} className="text-green-400" /> : <Copy size={12} />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={() => exportToCSV(result.data!, "query_result")}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-muted hover:text-zinc-300 transition-colors"
                >
                  <Download size={12} />
                  CSV
                </button>
                <button
                  onClick={() => exportToJSON(result.data!, "query_result")}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-muted hover:text-zinc-300 transition-colors"
                >
                  <Download size={12} />
                  JSON
                </button>
              </div>
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {resultColumns.map((col) => (
                    <th key={col} className={headerCls}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.data.map((row, i) => (
                  <tr key={i} className="hover:bg-surface-hover/50 transition-colors">
                    {resultColumns.map((col) => (
                      <td key={col} className={`${cellCls} max-w-[300px]`}>
                        <span className={row[col] === null ? "text-muted italic" : "text-zinc-300"}>
                          {row[col] === null
                            ? "NULL"
                            : typeof row[col] === "object"
                            ? JSON.stringify(row[col])
                            : String(row[col])}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <CheckCircle size={24} className="text-green-400 mx-auto mb-2" />
              <div className="text-sm text-zinc-300">Query executed successfully</div>
              <div className="text-xs text-muted mt-1">
                {result?.duration.toFixed(1)}ms - No rows returned
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
