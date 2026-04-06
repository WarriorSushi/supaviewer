import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  ConnectionConfig,
  TableInfo,
  TableSchema,
  ColumnInfo,
  ForeignKey,
  QueryResult,
  TableStats,
} from "@/types";

const CONNECTIONS_KEY = "supaviewer_connections";
const HISTORY_KEY = "supaviewer_query_history";

let activeClient: SupabaseClient | null = null;

export function getClient(): SupabaseClient | null {
  return activeClient;
}

export function connectToSupabase(url: string, anonKey: string): SupabaseClient {
  activeClient = createClient(url, anonKey);
  return activeClient;
}

export function disconnect() {
  activeClient = null;
}

export function getSavedConnections(): ConnectionConfig[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(CONNECTIONS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveConnection(conn: ConnectionConfig) {
  const connections = getSavedConnections().filter((c) => c.id !== conn.id);
  connections.unshift(conn);
  localStorage.setItem(CONNECTIONS_KEY, JSON.stringify(connections.slice(0, 20)));
}

export function removeConnection(id: string) {
  const connections = getSavedConnections().filter((c) => c.id !== id);
  localStorage.setItem(CONNECTIONS_KEY, JSON.stringify(connections));
}

export async function fetchTables(): Promise<TableInfo[]> {
  const client = getClient();
  if (!client) throw new Error("Not connected");

  const { data, error } = await client.rpc("", {}).maybeSingle();
  // Use raw SQL via rpc or direct query
  const result = await executeQuery(`
    SELECT 
      t.table_name as name,
      t.table_schema as schema,
      COALESCE(s.n_live_tup, 0)::int as row_count
    FROM information_schema.tables t
    LEFT JOIN pg_stat_user_tables s ON s.relname = t.table_name
    WHERE t.table_schema = 'public' 
      AND t.table_type = 'BASE TABLE'
    ORDER BY t.table_name
  `);

  if (result.error || !result.data) return [];
  return result.data.map((r: Record<string, unknown>) => ({
    name: r.name as string,
    schema: r.schema as string,
    rowCount: Number(r.row_count) || 0,
  }));
}

export async function fetchTableSchema(tableName: string): Promise<TableSchema> {
  const columnsResult = await executeQuery(`
    SELECT 
      c.column_name as name,
      c.data_type as type,
      c.is_nullable = 'YES' as nullable,
      c.column_default as default_value,
      c.character_maximum_length as max_length,
      COALESCE(
        (SELECT true FROM information_schema.table_constraints tc
         JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
         WHERE tc.table_name = '${tableName}' AND kcu.column_name = c.column_name 
         AND tc.constraint_type = 'PRIMARY KEY' LIMIT 1), false
      ) as is_primary,
      COALESCE(
        (SELECT true FROM information_schema.table_constraints tc
         JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
         WHERE tc.table_name = '${tableName}' AND kcu.column_name = c.column_name 
         AND tc.constraint_type = 'UNIQUE' LIMIT 1), false
      ) as is_unique
    FROM information_schema.columns c
    WHERE c.table_name = '${tableName}' AND c.table_schema = 'public'
    ORDER BY c.ordinal_position
  `);

  const fkResult = await executeQuery(`
    SELECT
      tc.constraint_name,
      kcu.column_name,
      ccu.table_name AS foreign_table,
      ccu.column_name AS foreign_column
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
    WHERE tc.table_name = '${tableName}' AND tc.constraint_type = 'FOREIGN KEY'
  `);

  const columns: ColumnInfo[] = (columnsResult.data || []).map((r: Record<string, unknown>) => ({
    name: r.name as string,
    type: r.type as string,
    nullable: Boolean(r.nullable),
    defaultValue: r.default_value as string | null,
    isPrimary: Boolean(r.is_primary),
    isUnique: Boolean(r.is_unique),
    maxLength: r.max_length ? Number(r.max_length) : null,
  }));

  const foreignKeys: ForeignKey[] = (fkResult.data || []).map((r: Record<string, unknown>) => ({
    constraintName: r.constraint_name as string,
    columnName: r.column_name as string,
    foreignTable: r.foreign_table as string,
    foreignColumn: r.foreign_column as string,
  }));

  return { tableName, columns, foreignKeys, indexes: [] };
}

export async function fetchTableData(
  tableName: string,
  page: number = 0,
  pageSize: number = 50,
  sortColumn?: string,
  sortDir?: string,
  filters?: { column: string; operator: string; value: string }[]
): Promise<{ data: Record<string, unknown>[]; count: number }> {
  const client = getClient();
  if (!client) throw new Error("Not connected");

  let query = client.from(tableName).select("*", { count: "exact" });

  if (filters && filters.length > 0) {
    for (const f of filters) {
      switch (f.operator) {
        case "eq": query = query.eq(f.column, f.value); break;
        case "neq": query = query.neq(f.column, f.value); break;
        case "gt": query = query.gt(f.column, f.value); break;
        case "gte": query = query.gte(f.column, f.value); break;
        case "lt": query = query.lt(f.column, f.value); break;
        case "lte": query = query.lte(f.column, f.value); break;
        case "like": query = query.like(f.column, `%${f.value}%`); break;
        case "ilike": query = query.ilike(f.column, `%${f.value}%`); break;
        case "is": query = query.is(f.column, f.value === "null" ? null : f.value); break;
      }
    }
  }

  if (sortColumn && sortDir) {
    query = query.order(sortColumn, { ascending: sortDir === "asc" });
  }

  query = query.range(page * pageSize, (page + 1) * pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return { data: data || [], count: count || 0 };
}

export async function executeQuery(sql: string): Promise<QueryResult> {
  const client = getClient();
  if (!client) throw new Error("Not connected");

  const start = performance.now();

  // Use the Supabase REST API to execute raw SQL via rpc
  // We need to call the pg_query or use .rpc approach
  // Since Supabase doesn't have a built-in raw SQL endpoint via JS client,
  // we'll use the REST API directly
  const url = (client as unknown as { supabaseUrl: string }).supabaseUrl || "";
  const key = (client as unknown as { supabaseKey: string }).supabaseKey || "";

  try {
    const response = await fetch(`${url}/rest/v1/rpc/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });

    // Fallback: use the /pg endpoint or direct SQL
    // Supabase supports SQL via the pg_meta or direct fetch
    const pgResponse = await fetch(`${url}/pg/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ query: sql }),
    });

    if (!pgResponse.ok) {
      // Try alternative endpoint
      const altResponse = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
          apikey: key,
          Authorization: `Bearer ${key}`,
          Prefer: "return=representation",
        },
        body: JSON.stringify({ query: sql }),
      });

      if (!altResponse.ok) {
        // Final fallback: parse SQL to use Supabase client methods
        const duration = performance.now() - start;
        return await executeSqlViaClient(sql, duration);
      }

      const altData = await altResponse.json();
      const duration = performance.now() - start;
      return {
        data: Array.isArray(altData) ? altData : [altData],
        error: null,
        rowCount: Array.isArray(altData) ? altData.length : 1,
        duration,
      };
    }

    const pgData = await pgResponse.json();
    const duration = performance.now() - start;
    const rows = pgData.rows || pgData || [];
    return {
      data: Array.isArray(rows) ? rows : [rows],
      error: null,
      rowCount: Array.isArray(rows) ? rows.length : 1,
      duration,
    };
  } catch (err) {
    const duration = performance.now() - start;
    return await executeSqlViaClient(sql, duration);
  }
}

async function executeSqlViaClient(
  sql: string,
  duration: number
): Promise<QueryResult> {
  const client = getClient();
  if (!client)
    return { data: null, error: "Not connected", rowCount: 0, duration };

  // Parse simple SELECT queries and use the client
  const selectMatch = sql.match(
        /^\s*SELECT\s+(.+?)\s+FROM\s+(?:public\.)?(\w+)(?:\s+(.*))?$/i
  );
  if (selectMatch) {
    const tableName = selectMatch[2];
    const rest = selectMatch[3] || "";

    let query = client.from(tableName).select("*");

    const limitMatch = rest.match(/LIMIT\s+(\d+)/i);
    if (limitMatch) {
      query = query.limit(parseInt(limitMatch[1]));
    }

    const orderMatch = rest.match(
      /ORDER\s+BY\s+(\w+)(?:\s+(ASC|DESC))?/i
    );
    if (orderMatch) {
      query = query.order(orderMatch[1], {
        ascending: (orderMatch[2] || "ASC").toUpperCase() === "ASC",
      });
    }

    const { data, error } = await query;
    return {
      data: data || [],
      error: error?.message || null,
      rowCount: data?.length || 0,
      duration,
    };
  }

  return {
    data: null,
    error:
      "Raw SQL execution requires a database function. Create a function named exec_sql or use the Supabase dashboard for DDL operations.",
    rowCount: 0,
    duration,
  };
}

export async function insertRow(
  tableName: string,
  row: Record<string, unknown>
): Promise<{ data: Record<string, unknown>[] | null; error: string | null }> {
  const client = getClient();
  if (!client) return { data: null, error: "Not connected" };

  const { data, error } = await client
    .from(tableName)
    .insert(row)
    .select();
  return { data, error: error?.message || null };
}

export async function updateRow(
  tableName: string,
  updates: Record<string, unknown>,
  pkColumn: string,
  pkValue: unknown
): Promise<{ data: Record<string, unknown>[] | null; error: string | null }> {
  const client = getClient();
  if (!client) return { data: null, error: "Not connected" };

  const { data, error } = await client
    .from(tableName)
    .update(updates)
    .eq(pkColumn, pkValue as string)
    .select();
  return { data, error: error?.message || null };
}

export async function deleteRow(
  tableName: string,
  pkColumn: string,
  pkValue: unknown
): Promise<{ error: string | null }> {
  const client = getClient();
  if (!client) return { error: "Not connected" };

  const { error } = await client
    .from(tableName)
    .delete()
    .eq(pkColumn, pkValue as string);
  return { error: error?.message || null };
}

export async function fetchTableStats(tableName: string): Promise<TableStats> {
  const schema = await fetchTableSchema(tableName);
  const countResult = await fetchTableData(tableName, 0, 1);

  const sizeResult = await executeQuery(
    `SELECT pg_size_pretty(pg_total_relation_size('"${tableName}"')) as size`
  );

  let estimatedSize = "Unknown";
  if (sizeResult.data && sizeResult.data[0]) {
    estimatedSize = sizeResult.data[0].size as string;
  } else {
    // Estimate based on row count
    const avgRowSize = schema.columns.length * 50; // rough estimate
    const totalBytes = countResult.count * avgRowSize;
    if (totalBytes < 1024) estimatedSize = `${totalBytes} B`;
    else if (totalBytes < 1024 * 1024) estimatedSize = `${(totalBytes / 1024).toFixed(1)} KB`;
    else estimatedSize = `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return {
    tableName,
    rowCount: countResult.count,
    columnCount: schema.columns.length,
    estimatedSize,
    columns: schema.columns.map((c) => ({
      name: c.name,
      type: c.type,
      nullable: c.nullable,
    })),
  };
}

export function getQueryHistory(): {
  id: string;
  query: string;
  timestamp: number;
  duration: number;
  rowCount: number;
  error: string | null;
}[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(HISTORY_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function addToQueryHistory(item: {
  query: string;
  duration: number;
  rowCount: number;
  error: string | null;
}) {
  const history = getQueryHistory();
  history.unshift({
    ...item,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 100)));
}

export function exportToCSV(
  data: Record<string, unknown>[],
  filename: string
) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((h) => {
          const val = row[h];
          const str = val === null ? "" : String(val);
          return str.includes(",") || str.includes('"') || str.includes("\n")
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        })
        .join(",")
    ),
  ].join("\n");

  downloadFile(csv, `${filename}.csv`, "text/csv");
}

export function exportToJSON(
  data: Record<string, unknown>[],
  filename: string
) {
  downloadFile(
    JSON.stringify(data, null, 2),
    `${filename}.json`,
    "application/json"
  );
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
