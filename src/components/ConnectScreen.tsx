"use client";

import React, { useState, useEffect } from "react";
import {
  Database,
  Server,
  Key,
  Plug,
  Trash2,
  Clock,
  ArrowRight,
  Shield,
} from "lucide-react";
import { ConnectionConfig } from "@/types";
import {
  connectToSupabase,
  getSavedConnections,
  saveConnection,
  removeConnection,
  fetchTables,
} from "@/lib/supabase";

interface ConnectScreenProps {
  onConnect: (config: ConnectionConfig) => void;
}

export default function ConnectScreen({ onConnect }: ConnectScreenProps) {
  const [url, setUrl] = useState("");
  const [anonKey, setAnonKey] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<ConnectionConfig[]>([]);

  useEffect(() => {
    setSaved(getSavedConnections());
  }, []);

  async function handleConnect(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!url || !anonKey) {
      setError("URL and API key are required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const cleanUrl = url.replace(/\/+$/, "");
      connectToSupabase(cleanUrl, anonKey);
      // Test connection by fetching tables
      await fetchTables();
      const config: ConnectionConfig = {
        id: crypto.randomUUID(),
        name: name || new URL(cleanUrl).hostname.split(".")[0],
        url: cleanUrl,
        anonKey,
        createdAt: Date.now(),
      };
      saveConnection(config);
      onConnect(config);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to connect. Check your credentials."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSelectSaved(conn: ConnectionConfig) {
    setUrl(conn.url);
    setAnonKey(conn.anonKey);
    setName(conn.name);
  }

  function handleRemoveSaved(id: string) {
    removeConnection(id);
    setSaved(getSavedConnections());
  }

  function handleQuickConnect(conn: ConnectionConfig) {
    setUrl(conn.url);
    setAnonKey(conn.anonKey);
    setName(conn.name);
    // Auto connect
    connectToSupabase(conn.url, conn.anonKey);
    fetchTables()
      .then(() => onConnect(conn))
      .catch(() => setError("Connection failed. The saved credentials may be invalid."));
  }

  return (
    <div className="min-h-screen bg-oled flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 mb-4">
            <Database size={32} className="text-teal-500" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-100">SupaViewer</h1>
          <p className="text-sm text-muted mt-1">
            Connect to your Supabase database to explore
          </p>
        </div>

        {/* Connect Form */}
        <form onSubmit={handleConnect} className="bg-surface rounded-xl border border-border p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              Connection Name (optional)
            </label>
            <div className="relative">
              <Shield size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Project"
                className="w-full bg-oled border border-border rounded-lg px-3 py-2.5 pl-10 text-sm text-zinc-200 placeholder:text-muted focus:border-teal-600 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              Supabase URL
            </label>
            <div className="relative">
              <Server size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full bg-oled border border-border rounded-lg px-3 py-2.5 pl-10 text-sm text-zinc-200 placeholder:text-muted focus:border-teal-600 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              API Key (anon or service_role)
            </label>
            <div className="relative">
              <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIs..."
                className="w-full bg-oled border border-border rounded-lg px-3 py-2.5 pl-10 text-sm text-zinc-200 placeholder:text-muted focus:border-teal-600 transition-colors font-mono"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 disabled:bg-teal-800 disabled:opacity-50 text-white font-medium rounded-lg px-4 py-2.5 text-sm transition-colors"
          >
            {loading ? (
              <>
                <Plug size={16} className="animate-pulse" />
                Connecting...
              </>
            ) : (
              <>
                <Plug size={16} />
                Connect
              </>
            )}
          </button>
        </form>

        {/* Saved Connections */}
        {saved.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xs font-medium text-muted mb-3 flex items-center gap-1.5">
              <Clock size={12} />
              Recent Connections
            </h3>
            <div className="space-y-2">
              {saved.map((conn) => (
                <div
                  key={conn.id}
                  className="bg-surface border border-border rounded-lg px-4 py-3 flex items-center gap-3 group hover:border-teal-600/30 transition-colors"
                >
                  <Database size={16} className="text-teal-500/50 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-zinc-300 truncate">
                      {conn.name}
                    </div>
                    <div className="text-xs text-muted truncate">{conn.url}</div>
                  </div>
                  <button
                    onClick={() => handleRemoveSaved(conn.id)}
                    className="p-1.5 text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    title="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button
                    onClick={() => handleQuickConnect(conn)}
                    className="p-1.5 text-muted hover:text-teal-400 transition-colors"
                    title="Connect"
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
