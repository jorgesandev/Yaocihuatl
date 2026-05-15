import type { LucideIcon } from "lucide-react";

export type DemoRole = "protected" | "analyst" | "reviewer" | "observer";

export type RiskLevel = "low" | "medium" | "high" | "unknown";

export type EvidenceStatus =
  | "draft"
  | "sealed-local"
  | "ready"
  | "submitted"
  | "error";

export type PrivacyState =
  | "local-only"
  | "not-uploaded"
  | "encrypted"
  | "ready-to-send"
  | "submitted";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}
