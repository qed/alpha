import type { PipelineStage } from "@/lib/constants/pipeline";
import type { GeographyStatus } from "@/lib/constants/geographies";

export interface DbGeography {
  id: string;
  slug: string;
  name: string;
  region: string | null;
  country: string;
  status: GeographyStatus;
  enrollment_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface DbProfile {
  id: string;
  clerk_user_id: string;
  email: string;
  full_name: string;
  role: "admin" | "champion";
  geography_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbProspect {
  id: string;
  geography_id: string;
  parent_first: string;
  parent_last: string;
  parent_email: string | null;
  parent_phone: string | null;
  spouse_name: string | null;
  source: string | null;
  status: PipelineStage;
  follow_up_date: string | null;
  first_responded_at: string | null;
  consent_given: boolean;
  consent_at: string | null;
  heat_score: number;
  concerns: string[];
  engagement_signals: string[];
  last_touch_at: string;
  neighborhood: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbChild {
  id: string;
  prospect_id: string;
  geography_id: string;
  first_name: string;
  grade: string | null;
  age: number | null;
  gender: string | null;
  created_at: string;
}

export interface DbNote {
  id: string;
  prospect_id: string;
  geography_id: string;
  author_id: string;
  body: string;
  created_at: string;
}

export interface DbStatusHistory {
  id: string;
  prospect_id: string;
  geography_id: string;
  old_status: PipelineStage;
  new_status: PipelineStage;
  changed_by: string;
  changed_at: string;
}

export interface DbLibraryItem {
  id: string;
  type: "faq" | "quote" | "talking" | "data";
  title: string;
  body: string;
  concern: string | null;
  helpfulness_score: number;
  send_count: number;
  geography_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbLibrarySend {
  id: string;
  library_item_id: string;
  prospect_id: string;
  champion_id: string;
  geography_id: string;
  channel: string;
  sent_at: string;
}

export type AuditAction =
  | "drill-down"
  | "status-change"
  | "prospect-create"
  | "prospect-delete"
  | "note-add"
  | "champion-create"
  | "champion-deactivate"
  | "champion-reassign"
  | "geography-select"
  | "geography-create"
  | "signal-toggle"
  | "concern-update"
  | "heat-override"
  | "library-send";

export interface DbAuditLog {
  id: string;
  actor_id: string;
  action: AuditAction;
  geography_id: string | null;
  prospect_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}
