export type RelevanceLevel = 'highly_relevant' | 'relevant' | 'possibly_relevant';
export type StandardStatus = 'active' | 'superseded' | 'withdrawn' | 'under_revision' | 'unknown';
export type TestApplicability = 'mandatory' | 'voluntary' | 'unknown';

export interface SourceRef {
  source_id: string;
  title: string;
  reference_url: string;
  reliability_tier: 'primary' | 'secondary';
  source_type?: 'bis_standard' | 'bis_scheme' | 'gov_portal' | 'other';
  retrieved_at?: string;
}

export interface StandardCardData {
  is_number: string;
  title: string;
  relevance?: RelevanceLevel;
  status: StandardStatus;
  why_applicable?: string;
  source_refs: SourceRef[];
  is_saved?: boolean;
}

export interface RecentConversation {
  id: string;
  title: string;
  updated_at: string;
  preview: string;
  message_count?: number;
  time_bucket?: 'today' | 'this_week' | 'older';
}

export interface SavedStandardShortcut {
  id: string;
  is_number: string;
  title: string;
  status: StandardStatus;
  saved_at: string;
}

export interface ChatMessageData {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  standard_cards?: StandardCardData[];
  source_refs?: SourceRef[];
  uncertainty_notice?: string;
  created_at: string;
}

export interface ChatConversationData {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: ChatMessageData[];
}

export interface StandardRequirementCategory {
  category: string;
  description: string;
  points: {
    title: string;
    detail: string;
    requires_verification?: boolean;
  }[];
}

export interface StandardDetailsData {
  is_number: string;
  title: string;
  status: StandardStatus;
  relevance?: RelevanceLevel;
  edition_info: string;
  publication_date: string;
  last_verified_date: string;
  product_category: string;
  standard_type: string;
  scheme_info: string;
  qco_status: 'mandatory' | 'voluntary' | 'unknown';
  qco_order_name?: string;
  why_applicable: string;
  scope_description: string;
  limitations: string[];
  key_requirements: StandardRequirementCategory[];
  source_refs: SourceRef[];
  related_standards_preview: {
    is_number: string;
    title: string;
    relation_note: string;
  }[];
}

export interface TestsCertificationData {
  is_number: string;
  title: string;
  status: StandardStatus;
  relevance?: RelevanceLevel;
  overview: {
    certification_relevance: string;
    scheme_name: string;
    scheme_code: string;
    mandate_status: 'mandatory' | 'voluntary' | 'unknown';
    qco_order_name?: string;
    product_category: string;
    testing_relevance: string;
    guidance_note: string;
  };
  testing_categories: {
    id: string;
    category: string;
    description: string;
    badge_label?: string;
    points: {
      title: string;
      detail: string;
      requires_verification?: boolean;
    }[];
  }[];
  workflow_steps: {
    step_number: number;
    title: string;
    description: string;
  }[];
  conformity_pathway_steps: {
    step_number: number;
    title: string;
    subtitle: string;
    description: string;
    key_actions: string[];
  }[];
  source_refs: SourceRef[];
}

export type LaboratoryType = 'bis_central' | 'bis_regional' | 'nabl_accredited' | 'commercial';

export interface LaboratoryItem {
  id: string;
  name: string;
  lab_type: LaboratoryType;
  type_label: string;
  city: string;
  state: string;
  testing_capability: string;
  applicable_standards: string[];
  accreditation_indicator: string;
  lead_time_guidance: string;
  facilities_overview: string[];
  is_example_listing: boolean;
}

export interface RecognizedLaboratoriesData {
  is_number: string;
  title: string;
  status: StandardStatus;
  relevance?: RelevanceLevel;
  product_category: string;
  laboratories: LaboratoryItem[];
  source_refs: SourceRef[];
}

export interface ComparisonRow {
  category: string;
  standard1_value: string;
  standard2_value: string;
  requires_verification?: boolean;
}

export interface KeyDifferenceItem {
  dimension: string;
  standard1_point: string;
  standard2_point: string;
  summary: string;
}

export interface StandardComparisonData {
  standard1: StandardDetailsData;
  standard2: StandardDetailsData;
  relationship_overview: string;
  relationship_type: string;
  rows: ComparisonRow[];
  key_differences: KeyDifferenceItem[];
}

export interface SuggestedComparisonPair {
  id: string;
  title: string;
  tag: string;
  description: string;
  standard1_is: string;
  standard2_is: string;
}


