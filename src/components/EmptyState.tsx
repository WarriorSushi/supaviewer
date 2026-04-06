"use client";

import React from "react";
import { Database, Table, Code, BarChart3 } from "lucide-react";
import { ViewMode } from "@/types";

interface EmptyStateProps {
  activeView: ViewMode;
}

export default function EmptyState({ activeView }: EmptyStateProps) {
  const viewConfig = {
    data: {
      icon: <Table size={32} className="text-teal-500/50" />,
      title: "Select a Table",
      description: "Choose a table from the sidebar to view and edit its data",
    },
    schema: {
      icon: <Database size={32} className="text-teal-500/50" />,
      title: "Select a Table",
      description: "Choose a table from the sidebar to view its schema",
    },
    sql: {
      icon: <Code size={32} className="text-teal-500/50" />,
      title: "SQL Editor",
      description: "Write and execute SQL queries against your database",
    },
    stats: {
      icon: <BarChart3 size={32} className="text-teal-500/50" />,
      title: "Select a Table",
      description: "Choose a table from the sidebar to view statistics",
    },
  };

  const config = viewConfig[activeView];

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="flex justify-center mb-4">{config.icon}</div>
        <h3 className="text-lg font-medium text-zinc-300 mb-1">{config.title}</h3>
        <p className="text-sm text-muted">{config.description}</p>
      </div>
    </div>
  );
}
