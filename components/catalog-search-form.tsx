"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CatalogSearchFormProps = {
  q?: string;
  sort?: string;
  compact?: boolean;
  showSort?: boolean;
};

export function CatalogSearchForm({
  q,
  sort = "featured",
  compact = false,
  showSort = true,
}: CatalogSearchFormProps) {
  const [selectedSort, setSelectedSort] = React.useState(sort);

  return (
    <form
      className={[
        "grid gap-3",
        compact
          ? showSort
            ? "sm:grid-cols-[minmax(0,1fr)_11rem_8.5rem]"
            : "sm:grid-cols-[minmax(0,1fr)_8.5rem]"
          : "lg:grid-cols-[minmax(0,1.9fr)_minmax(0,0.9fr)_10rem]",
      ].join(" ")}
    >
      <input name="page" type="hidden" value="1" />
      <label className="grid gap-2">
        <span className="sv-overline">Search</span>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-11 rounded-xl border-input/90 bg-background/70 pl-9 shadow-none dark:bg-input/20"
            defaultValue={q}
            name="q"
            placeholder="Title, creator, or #serial"
            type="search"
          />
        </div>
      </label>

      {showSort ? (
        <label className="grid gap-2">
          <span className="sv-overline">Sort</span>
          <input name="sort" type="hidden" value={selectedSort} />
          <Select onValueChange={setSelectedSort} value={selectedSort}>
            <SelectTrigger className="h-11 w-full rounded-xl border-input/90 bg-background/70 shadow-none dark:bg-input/20">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="recent">Recent</SelectItem>
              <SelectItem value="discussed">Discussed</SelectItem>
              <SelectItem value="runtime">Runtime</SelectItem>
            </SelectContent>
          </Select>
        </label>
      ) : null}

      <div className="flex items-end">
        <Button className="sv-btn sv-btn-primary h-11 w-full rounded-xl" type="submit">
          Search
        </Button>
      </div>
    </form>
  );
}
