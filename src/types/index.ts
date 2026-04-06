export interface ConnectionConfig {
  id: string;
  name: string;
  url: string;
  anonKey: string;
  createdAt: number;
}

export interface TableInfo {
  name: string;
  schema: string;
  rowCount: number;
}

export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue: string | null;
  isPrimary: boolean;
  isUnique: boolean;
  maxLength: number | null;
}

export interface ForeignKey {
  constraintName: string;
  columnName: string;
  foreignTable: string;
  foreignColumn: string;
}

export interface TableSchema {
  tableName: string;
  columns: ColumnInfo[];
  foreignKeys: ForeignKey[];
  indexes: { name: string; columns: string[]; isUnique: boolean }[];
}

export interface QueryResult {
  data: Record<string, unknown>[] | null;
  error: string | null;
  rowCount: number;
  duration: number;
}

export interface QueryHistoryItem {
  id: string;
  query: string;
  timestamp: number;
  duration: number;
  rowCount: number;
  error: string | null;
}

export interface TableStats {
  tableName: string;
  rowCount: number;
  columnCount: number;
  estimatedSize: string;
  columns: { name: string; type: string; nullable: boolean }[];
}

export type SortDirection = "asc" | "desc" | null;

export interface SortConfig {
  column: string;
  direction: SortDirection;
}

export interface FilterConfig {
  column: string;
  operator: string;
  value: string;
}

export type ViewMode = "data" | "schema" | "sql" | "stats";
