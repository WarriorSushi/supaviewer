import Link from "next/link";
import { Button } from "@/components/ui/button";

type PublicRouteNoticeProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  className?: string;
};

export function PublicRouteNotice({
  eyebrow,
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  className = "",
}: PublicRouteNoticeProps) {
  return (
    <div
      className={[
        "rounded-[1.4rem] border border-[oklch(0.72_0.14_55_/_18%)] bg-[linear-gradient(135deg,oklch(0.17_0.01_60),oklch(0.13_0.008_60))] p-5 shadow-[0_24px_60px_-42px_oklch(0.72_0.14_55_/_36%)] sm:p-6",
        className,
      ].join(" ")}
    >
      <p className="sv-overline">{eyebrow}</p>
      <h2 className="mt-3 font-display text-[1.45rem] font-medium tracking-[-0.04em] text-foreground sm:text-[1.8rem]">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-[0.92rem] leading-7 text-muted-foreground">
        {description}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild className="sv-btn sv-btn-primary min-w-[10.5rem]">
          <Link href={primaryHref}>{primaryLabel}</Link>
        </Button>
        {secondaryHref && secondaryLabel ? (
          <Button asChild className="sv-btn min-w-[10.5rem]" variant="outline">
            <Link href={secondaryHref}>{secondaryLabel}</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
