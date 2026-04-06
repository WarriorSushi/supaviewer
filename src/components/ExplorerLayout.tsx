"use client";

import React, { useState } from "react";
import { Database, Menu, X } from "lucide-react";
import { ConnectionConfig, ViewMode } from "@/types";
import Sidebar from "./Sidebar";
import DataGrid from "./DataGrid";
import SqlEditor from "./SqlEditor";
import SchemaViewer from "./SchemaViewer";
import TableStatsView from "./TableStatsView";
import InsertRowModal from "./InsertRowModal";
import EmptyState from "./EmptyState";

interface ExplorerLayoutProps {
  connection: ConnectionConfig;
  onDisconnect: () => void;
}

export default function ExplorerLayout({
  connection,
  onDisconnect,
}: ExplorerLayoutProps) {
  const [activeTable, setActiveTable] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewMode>("data");
  const [showInsertModal, setShowInsertModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  function handleSelectTable(table: string) {
    setActiveTable(table);
    if (activeView === "sql") setActiveView("data");
    setMobileSidebar(false);
  }

  function handleViewChange(view: ViewMode) {
    setActiveView(view);
  }

  function renderMainContent() {
    if (activeView === "sql") {
      return <SqlEditor />;
    }

    if (!activeTable) {
      return <EmptyState activeView={activeView} />;
    }

    switch (activeView) {
      case "data":
        return (
          <DataGrid
            key={`${activeTable}-${refreshKey}`}
            tableName={activeTable}
            onInsertRow={() => setShowInsertModal(true)}
          />
        );
      case "schema":
        return <SchemaViewer key={activeTable} tableName={activeTable} />;
      case "stats":
        return <TableStatsView key={activeTable} tableName={activeTable} />;
      default:
        return <EmptyState activeView={activeView} />;
    }
  }

  return (
    <div className="h-screen flex flex-col bg-oled">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-2 bg-surface border-b border-border">
        <button
          onClick={() => setMobileSidebar(!mobileSidebar)}
          className="p-1.5 text-muted hover:text-zinc-300"
        >
          {mobileSidebar ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="flex items-center gap-2">
          <Database size={16} className="text-teal-500" />
          <span className="text-sm font-medium text-zinc-200">SupaViewer</span>
        </div>
        <div className="w-8" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Desktop */}
        <div className="hidden md:block">
          <Sidebar
            activeTable={activeTable}
            activeView={activeView}
            onSelectTable={handleSelectTable}
            onViewChange={handleViewChange}
            onDisconnect={onDisconnect}
            connectionName={connection.name}
          />
        </div>

        {/* Sidebar - Mobile Overlay */}
        {mobileSidebar && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileSidebar(false)}
            />
            <div className="relative z-10">
              <Sidebar
                activeTable={activeTable}
                activeView={activeView}
                onSelectTable={handleSelectTable}
                onViewChange={handleViewChange}
                onDisconnect={onDisconnect}
                connectionName={connection.name}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">{renderMainContent()}</div>
      </div>

      {/* Insert Row Modal */}
      {showInsertModal && activeTable && (
        <InsertRowModal
          tableName={activeTable}
          onClose={() => setShowInsertModal(false)}
          onSuccess={() => {
            setShowInsertModal(false);
            setRefreshKey((k) => k + 1);
          }}
        />
      )}
    </div>
  );
}
