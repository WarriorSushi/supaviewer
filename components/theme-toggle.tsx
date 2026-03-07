"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
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
    <label
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-3 py-2 text-xs uppercase tracking-[0.16em] text-muted-foreground backdrop-blur-md",
        className
      )}
    >
      <Sun className="size-3.5" />
      <Switch
        aria-label="Toggle color theme"
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
      />
      <Moon className="size-3.5" />
    </label>
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
    <Button
      aria-label="Toggle color theme"
      className={cn("rounded-xl", className)}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      size="icon"
      type="button"
      variant="outline"
    >
      {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
    </Button>
  )
}
