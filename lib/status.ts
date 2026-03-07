import { createSupabaseServerClient } from "@/lib/supabase/server";

export type FounderBadge = {
  slug: string;
  name: string;
  description: string;
  serialStart: number;
  serialEnd: number | null;
};

export type Trophy = {
  slug: string;
  name: string;
  description: string;
  targetType: "film" | "creator";
  assignmentType: "manual" | "signal";
  highlightLabel: string | null;
  note: string | null;
  startsAt: string | null;
  endsAt: string | null;
};

type FounderBadgeRow = {
  slug: string;
  name: string;
  description: string;
  serial_start: number;
  serial_end: number | null;
};

type TrophyDefinitionRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  target_type: "film" | "creator";
  assignment_type: "manual" | "signal";
  highlight_label: string | null;
};

type TrophyAssignmentRow = {
  film_id: string | null;
  creator_id: string | null;
  note: string | null;
  starts_at: string;
  ends_at: string | null;
  trophy_definitions:
    | TrophyDefinitionRow
    | TrophyDefinitionRow[]
    | null;
};

type SignalTrophyRow = {
  trophy_slug: string;
  film_id: string | null;
  creator_id: string | null;
  note: string | null;
  starts_at: string | null;
};

type CreatorStatusSummary = {
  founderBadge: FounderBadge | null;
  earliestSerial: number | null;
  notableSerials: number[];
  trophies: Trophy[];
};

function firstRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function mapFounderBadge(row: FounderBadgeRow): FounderBadge {
  return {
    slug: row.slug,
    name: row.name,
    description: row.description,
    serialStart: row.serial_start,
    serialEnd: row.serial_end,
  };
}

function mapTrophy(
  definition: TrophyDefinitionRow,
  assignment: Pick<TrophyAssignmentRow, "note" | "starts_at" | "ends_at"> | Pick<SignalTrophyRow, "note" | "starts_at">,
): Trophy {
  return {
    slug: definition.slug,
    name: definition.name,
    description: definition.description,
    targetType: definition.target_type,
    assignmentType: definition.assignment_type,
    highlightLabel: definition.highlight_label,
    note: assignment.note ?? null,
    startsAt: assignment.starts_at ?? null,
    endsAt: "ends_at" in assignment ? assignment.ends_at ?? null : null,
  };
}

export async function getFounderBadges() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("founder_badges")
    .select("slug, name, description, serial_start, serial_end")
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to load founder badges: ${error.message}`);
  }

  return (data ?? []).map((row) => mapFounderBadge(row as FounderBadgeRow));
}

export function resolveFounderBadge(
  serial: number | null | undefined,
  founderBadges: FounderBadge[],
) {
  if (!serial) {
    return null;
  }

  return (
    founderBadges.find((badge) => {
      if (serial < badge.serialStart) {
        return false;
      }

      if (badge.serialEnd && serial > badge.serialEnd) {
        return false;
      }

      return true;
    }) ?? null
  );
}

async function getTrophyDefinitions() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("trophy_definitions")
    .select("id, slug, name, description, target_type, assignment_type, highlight_label")
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to load trophy definitions: ${error.message}`);
  }

  return (data ?? []) as TrophyDefinitionRow[];
}

async function getManualTrophyAssignments() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("trophy_assignments")
    .select(
      "film_id, creator_id, note, starts_at, ends_at, trophy_definitions (id, slug, name, description, target_type, assignment_type, highlight_label)",
    );

  if (error) {
    throw new Error(`Failed to load trophy assignments: ${error.message}`);
  }

  const now = Date.now();

  return ((data ?? []) as TrophyAssignmentRow[]).filter((assignment) => {
    if (!assignment.ends_at) {
      return true;
    }

    return new Date(assignment.ends_at).getTime() >= now;
  });
}

async function getSignalTrophyAssignments() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_live_signal_trophies");

  if (error) {
    throw new Error(`Failed to load live signal trophies: ${error.message}`);
  }

  return (data ?? []) as SignalTrophyRow[];
}

export async function getFilmStatusMap(
  films: { id: string; serial_number: number }[],
) {
  const [founderBadges, trophyDefinitions, manualAssignments, signalAssignments] = await Promise.all([
    getFounderBadges(),
    getTrophyDefinitions(),
    getManualTrophyAssignments(),
    getSignalTrophyAssignments(),
  ]);

  const trophyDefinitionMap = new Map(trophyDefinitions.map((definition) => [definition.slug, definition]));
  const statusMap = new Map<string, { founderBadge: FounderBadge | null; trophies: Trophy[] }>();

  for (const film of films) {
    statusMap.set(film.id, {
      founderBadge: resolveFounderBadge(film.serial_number, founderBadges),
      trophies: [],
    });
  }

  for (const assignment of manualAssignments) {
    if (!assignment.film_id) {
      continue;
    }

    const definition = firstRelation(assignment.trophy_definitions);
    const entry = statusMap.get(assignment.film_id);

    if (!entry || !definition) {
      continue;
    }

    entry.trophies.push(mapTrophy(definition, assignment));
  }

  for (const assignment of signalAssignments) {
    if (!assignment.film_id) {
      continue;
    }

    const definition = trophyDefinitionMap.get(assignment.trophy_slug);
    const entry = statusMap.get(assignment.film_id);

    if (!entry || !definition) {
      continue;
    }

    entry.trophies.push(mapTrophy(definition, assignment));
  }

  for (const entry of statusMap.values()) {
    entry.trophies.sort((left, right) => {
      const leftDefinition = trophyDefinitionMap.get(left.slug);
      const rightDefinition = trophyDefinitionMap.get(right.slug);
      return trophyDefinitions.indexOf(leftDefinition!) - trophyDefinitions.indexOf(rightDefinition!);
    });
  }

  return statusMap;
}

export async function getCreatorStatusMap(
  creators: { id: string }[],
) {
  const creatorIds = creators.map((creator) => creator.id);
  const [founderBadges, trophyDefinitions, manualAssignments] = await Promise.all([
    getFounderBadges(),
    getTrophyDefinitions(),
    getManualTrophyAssignments(),
  ]);

  const statusMap = new Map<string, CreatorStatusSummary>();
  const supabase = await createSupabaseServerClient();

  if (!creatorIds.length) {
    return statusMap;
  }

  const { data: creatorFilms, error: creatorFilmsError } = await supabase
    .from("films")
    .select("id, creator_id, serial_number, visibility")
    .in("creator_id", creatorIds)
    .in("visibility", ["public", "limited", "hidden", "removed"])
    .order("serial_number", { ascending: true });

  if (creatorFilmsError) {
    throw new Error(`Failed to load creator serial history: ${creatorFilmsError.message}`);
  }

  for (const creatorId of creatorIds) {
    statusMap.set(creatorId, {
      founderBadge: null,
      earliestSerial: null,
      notableSerials: [],
      trophies: [],
    });
  }

  const serialsByCreator = new Map<string, number[]>();
  for (const row of creatorFilms ?? []) {
    const creatorId = row.creator_id as string;
    serialsByCreator.set(
      creatorId,
      [...(serialsByCreator.get(creatorId) ?? []), row.serial_number as number],
    );
  }

  for (const [creatorId, serials] of serialsByCreator.entries()) {
    const earliestSerial = serials[0] ?? null;
    const entry = statusMap.get(creatorId);

    if (!entry) {
      continue;
    }

    entry.earliestSerial = earliestSerial;
    entry.notableSerials = serials.slice(0, 3);
    entry.founderBadge = resolveFounderBadge(earliestSerial, founderBadges);
  }

  for (const assignment of manualAssignments) {
    if (!assignment.creator_id) {
      continue;
    }

    const definition = firstRelation(assignment.trophy_definitions);
    const entry = statusMap.get(assignment.creator_id);

    if (!entry || !definition) {
      continue;
    }

    entry.trophies.push(mapTrophy(definition, assignment));
  }

  for (const entry of statusMap.values()) {
    entry.trophies.sort((left, right) => {
      const leftDefinition = trophyDefinitions.find((definition) => definition.slug === left.slug);
      const rightDefinition = trophyDefinitions.find((definition) => definition.slug === right.slug);
      return trophyDefinitions.indexOf(leftDefinition!) - trophyDefinitions.indexOf(rightDefinition!);
    });
  }

  return statusMap;
}

export async function getManualTrophyDefinitionGroups() {
  const definitions = await getTrophyDefinitions();

  return {
    film: definitions.filter(
      (definition) => definition.target_type === "film" && definition.assignment_type === "manual",
    ),
    creator: definitions.filter(
      (definition) => definition.target_type === "creator" && definition.assignment_type === "manual",
    ),
  };
}
