import type { WatchEventAnalyticsSnapshot } from "@/lib/watch-events";

type WatchEventAnalyticsHistoryProps = {
  history: WatchEventAnalyticsSnapshot[];
};

export function WatchEventAnalyticsHistory({ history }: WatchEventAnalyticsHistoryProps) {
  if (!history.length) {
    return (
      <div className="sv-surface-soft rounded-[1.1rem] px-4 py-4 text-sm text-muted-foreground">
        Analytics history will appear once the room starts collecting live attendance and message snapshots.
      </div>
    );
  }

  const maxAudience = Math.max(...history.map((point) => point.humanCount + point.agentCount), 1);
  const maxMessages = Math.max(...history.map((point) => point.totalMessageCount), 1);

  return (
    <div className="grid gap-3">
      {history.map((point) => {
        const audienceWidth = Math.max(8, Math.round(((point.humanCount + point.agentCount) / maxAudience) * 100));
        const messageWidth = Math.max(8, Math.round((point.totalMessageCount / maxMessages) * 100));

        return (
          <article key={point.id} className="sv-surface-soft rounded-[1rem] px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
                {new Date(point.capturedAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
              <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <span>{point.humanCount} humans</span>
                <span>/</span>
                <span>{point.agentCount} agents</span>
                <span>/</span>
                <span>{point.totalMessageCount} messages</span>
              </div>
            </div>
            <div className="mt-3 grid gap-3">
              <div>
                <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  <span>Audience load</span>
                  <span>{point.humanCount + point.agentCount}</span>
                </div>
                <div className="mt-2 h-2.5 rounded-full bg-foreground/8">
                  <div
                    className="h-2.5 rounded-full"
                    style={{
                      width: `${audienceWidth}%`,
                      background: "linear-gradient(90deg, color-mix(in oklab, var(--color-accent) 50%, transparent), var(--color-accent))",
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  <span>Message velocity</span>
                  <span>{point.totalMessageCount}</span>
                </div>
                <div className="mt-2 h-2.5 rounded-full bg-foreground/8">
                  <div
                    className="h-2.5 rounded-full"
                    style={{
                      width: `${messageWidth}%`,
                      background: "linear-gradient(90deg, color-mix(in oklab, var(--color-accent) 30%, transparent), color-mix(in oklab, var(--color-accent) 85%, transparent))",
                    }}
                  />
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
