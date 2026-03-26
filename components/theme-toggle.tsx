"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted ? resolvedTheme !== "light" : true

  return (
    <button
      aria-label="Toggle color theme"
      className={cn(
        "inline-flex items-center justify-center rounded-lg border border-border/70 bg-card/80 p-2.5 backdrop-blur-md transition-colors duration-150 hover:bg-[var(--color-surface-strong)]",
        className
      )}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      type="button"
    >
      {isDark ? (
        <Moon className="size-4 text-[var(--color-accent)]" />
      ) : (
        <Sun className="size-4 text-[var(--color-accent)]" />
      )}
    </button>
  )
}

export function CompactThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted ? resolvedTheme !== "light" : true

  return (
    <button
      aria-label="Toggle color theme"
      className={cn(
        "inline-flex items-center justify-center rounded-lg p-1.5 transition-colors duration-150 hover:bg-[var(--color-surface-strong)]",
        className
      )}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      type="button"
    >
      {isDark ? (
        <Moon className="size-4 text-[var(--color-accent)]" />
      ) : (
        <Sun className="size-4 text-[var(--color-accent)]" />
      )}
    </button>
  )
}
