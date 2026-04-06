"use client";

import React, { useState } from "react";
import { ConnectionConfig } from "@/types";
import { disconnect } from "@/lib/supabase";
import ConnectScreen from "@/components/ConnectScreen";
import ExplorerLayout from "@/components/ExplorerLayout";

export default function AppShell() {
  const [connection, setConnection] = useState<ConnectionConfig | null>(null);

  function handleDisconnect() {
    disconnect();
    setConnection(null);
  }

  if (!connection) {
    return <ConnectScreen onConnect={setConnection} />;
  }

  return (
    <ExplorerLayout connection={connection} onDisconnect={handleDisconnect} />
  );
}
