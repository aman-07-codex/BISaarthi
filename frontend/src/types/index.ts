export type RelevanceLevel = 'highly_relevant' | 'relevant' | 'possibly_relevant';
export type StandardStatus = 'active' | 'superseded' | 'withdrawn' | 'under_revision' | 'unknown';
export type TestApplicability = 'mandatory' | 'voluntary' | 'unknown';

export interface SourceRef {
  source_id: string;
  title: string;
  reference_url: string;
  reliability_tier: 'primary' | 'secondary';
  source_type?: 'bis_standard' | 'bis_scheme' | 'gov_portal' | 'qco_order' | 'other';
  retrieved_at?: string;
}

export interface StandardCardData {
  is_number: string;
  title: string;
  relevance?: RelevanceLevel;
  status: StandardStatus;
  why_applicable?: string;
  reason_selected?: string | null;
  primary_use_case?: string | null;
  source_refs?: SourceRef[];
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
  response_mode?: 'rag' | 'metadata_fallback' | 'insufficient_context';
  grounding_status?: GroundingStatus;
  grounded?: boolean;
  citations?: CitationReference[];
  standard_cards?: StandardCardData[];
  source_refs?: SourceRef[];
  uncertainty_notice?: string;
  execution_metadata?: Record<string, unknown>;
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
  comparison_summary?: string | null;
  relevance_hint?: string | null;
}

export interface SuggestedComparisonPair {
  id: string;
  title: string;
  tag: string;
  description: string;
  standard1_is: string;
  standard2_is: string;
}

// ============================================================================
// Phase 7A / 7B Backend FastAPI Integration Types
// ============================================================================

export interface StandardListItem {
  standard_id?: number | null;
  standard_enc_id?: string | null;
  is_number: string;
  title: string;
  category: string;
  department?: string | null;
  committee?: string | null;
  type?: string | null;
  status?: string | null;
  document_available: boolean;
  reason_selected?: string | null;
  primary_use_case?: string | null;
}

export interface StandardSearchResponse {
  items: StandardListItem[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface StandardDetailsResponse {
  standard_id?: number | null;
  standard_enc_id?: string | null;
  is_number: string;
  title: string;
  category: string;
  department?: string | null;
  committee?: string | null;
  type?: string | null;
  status?: string | null;
  publication_date?: string | null;
  formatted_date?: string | null;
  bis_url?: string | null;
  document_available: boolean;
  selection_confidence?: string | null;
  reason_selected?: string | null;
  primary_use_case?: string | null;
  related_selected_standards?: string[];
}

export interface CompareStandardsRequest {
  standard_a: string;
  standard_b: string;
}

export interface ComparisonFieldMatch {
  same: boolean;
  a?: string | null;
  b?: string | null;
}

export interface CompareStandardsResponse {
  standard_a: StandardDetailsResponse;
  standard_b: StandardDetailsResponse;
  comparison: Record<string, ComparisonFieldMatch>;
  document_technical_comparison_available: boolean;
  message: string;
  comparison_summary?: string | null;
  relevance_hint?: string | null;
}

export interface CitationReference {
  citation_id: string;
  is_number: string;
  title?: string | null;
  section?: string | null;
  clause?: string | null;
  source_pages?: number[];
  chunk_id: string;
  source_chunk_path?: string | null;
  source_pdf_sha256?: string | null;
  formatted_citation: string;
}

export type GroundingStatus = 'grounded' | 'partially_grounded' | 'unsupported' | 'insufficient_context';

export interface ChatRequest {
  message: string;
  language?: 'en' | 'hi';
  top_k?: number;
  category?: string | null;
  is_number?: string | null;
  clause?: string | null;
  chunk_type?: string | null;
  score_threshold?: number | null;
}

export interface ChatResponse {
  answer: string;
  language: 'en' | 'hi';
  grounding_status: GroundingStatus;
  grounded: boolean;
  citations?: CitationReference[];
  retrieved_chunk_ids?: string[];
  warnings?: string[];
  execution_metadata?: Record<string, unknown>;
}

export interface OfficialDetailSection {
  section_name: string;
  section_title: string;
  data_status: 'verified' | 'unavailable' | 'failed';
  item_count: number;
  items: Record<string, unknown>[];
  summary_text?: string | null;
  source_endpoint?: string | null;
  retrieved_at?: string | null;
}

export interface OfficialStandardDetailDocument {
  source: string;
  source_type: string;
  standard_id?: number | null;
  standard_enc_id?: string | null;
  is_number: string;
  title: string;
  category: string;
  official_bis_url: string;
  retrieved_at: string;
  verification_status: string;
  sections: Record<string, OfficialDetailSection>;
}
