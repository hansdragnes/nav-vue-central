import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Tone = "neutral" | "info" | "success" | "warning" | "error" | "alt";

const toneStyles: Record<Tone, string> = {
  neutral: "border-border bg-surface-muted text-foreground",
  info: "border-info/30 bg-info-surface text-[hsl(213_100%_24%)]",
  success: "border-success/30 bg-success-surface text-[hsl(145_63%_22%)]",
  warning: "border-warning/40 bg-warning-surface text-[hsl(28_80%_28%)]",
  error: "border-destructive/30 bg-destructive-surface text-[hsl(4_71%_30%)]",
  alt: "border-[hsl(280_40%_60%)]/30 bg-[hsl(280_60%_96%)] text-[hsl(280_50%_30%)]",
};

interface TagProps {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}

export const Tag = ({ tone = "neutral", children, className }: TagProps) => (
  <span className={cn("aksel-tag", toneStyles[tone], className)}>{children}</span>
);
