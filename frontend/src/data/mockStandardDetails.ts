import { StandardDetailsData } from '@/types';
import { MOCK_SOURCES } from './mockChatData';

export const MOCK_STANDARD_DETAILS: Record<string, StandardDetailsData> = {
  'IS 302 (Part 2/Sec 201)': {
    is_number: 'IS 302 (Part 2/Sec 201)',
    title: 'Safety of Household and Similar Electrical Appliances — Part 2: Particular Requirements: Section 201: Electric Immersion Water Heaters',
    status: 'active',
    relevance: 'highly_relevant',
    edition_info: 'Fourth Revision (Aligned with IEC 60335-2-73)',
    publication_date: '2021',
    last_verified_date: 'August 2026',
    product_category: 'Electrical Heating & Domestic Appliances',
    standard_type: 'Product Safety Specification (Part 2 Standard)',
    scheme_info: 'BIS Conformity Assessment Scheme-I (ISI Mark)',
    qco_status: 'mandatory',
    qco_order_name: 'Electrical Appliances (Quality Control) Order, 2023',
    why_applicable: 'Directly specifies safety, heating element protection, moisture barrier integrity, leakage current limits, and thermal dry-run prevention for electric immersion water heaters.',
    scope_description: 'This standard deals with the safety of portable electric immersion heaters for household and similar purposes, their rated voltage being not more than 250 V single-phase. It covers both fixed-element and portable immersion heating appliances intended for heating water in domestic vessels.',
    limitations: [
      'Does not apply to appliances intended exclusively for industrial liquid heating.',
      'Does not apply to storage water heaters (geysers) which are governed by IS 302 (Part 2/Sec 21).',
      'Does not apply to electrode-type immersion liquid heaters.',
    ],
    key_requirements: [
      {
        category: 'Electrical Safety',
        description: 'Protection against electric shock and high voltage insulation integrity.',
        points: [
          {
            title: 'High Voltage Breakdown',
            detail: 'Appliance must withstand high voltage test across live parts and outer sheath without dielectric breakdown.',
            requires_verification: true,
          },
          {
            title: 'Leakage Current Threshold',
            detail: 'Cold and operating leakage current must remain below statutory safety thresholds under maximum operating temperature.',
            requires_verification: true,
          },
          {
            title: 'Earthing Continuity',
            detail: 'Accessible metal parts must be permanently and reliably connected to the protective earthing terminal.',
          },
        ],
      },
      {
        category: 'Construction & Materials',
        description: 'Physical sheath robustness and dry-run safety mechanisms.',
        points: [
          {
            title: 'Heating Element Sheath',
            detail: 'Sheath must be copper, stainless steel, or approved corrosion-resistant alloy with suitable wall thickness.',
          },
          {
            title: 'Water Ingress Protection (IPX7)',
            detail: 'Heating head and handle must prevent moisture ingress during standard immersion and water spray testing.',
            requires_verification: true,
          },
          {
            title: 'Thermal Cut-out / Safety Thermal Fuse',
            detail: 'Must incorporate non-self-resetting thermal cut-out to prevent fire hazards during boil-dry conditions.',
          },
        ],
      },
      {
        category: 'Marking & Labelling',
        description: 'Mandatory on-product information and consumer warning labels.',
        points: [
          {
            title: 'Rated Voltage & Wattage',
            detail: 'Permanent marking showing rated voltage (230V/240V), wattage rating, and manufacturer identification.',
          },
          {
            title: 'Water Level Indicators',
            detail: 'Clear minimum and maximum liquid immersion markings permanently stamped or embossed on the sheath.',
          },
          {
            title: 'Standard Mark (ISI)',
            detail: 'Compulsory BIS ISI mark with License Number (CM/L-XXXXXXXXXX).',
          },
        ],
      },
      {
        category: 'Supply Connection',
        description: 'Flexible cord and plug requirements.',
        points: [
          {
            title: 'Molded 3-Pin Plug (IS 1293)',
            detail: 'Fitted supply cord must terminate in an ISI-certified 3-pin plug conforming to IS 1293.',
          },
          {
            title: 'Cord Anchorage & Strain Relief',
            detail: 'Cord anchorage must relieve conductors from strain, including twisting, when subjected to pull tests.',
          },
        ],
      },
    ],
    source_refs: [MOCK_SOURCES.bisIS302, MOCK_SOURCES.dpiitQco, MOCK_SOURCES.bisScheme1],
    related_standards_preview: [
      {
        is_number: 'IS 302 (Part 1): 2024',
        title: 'Safety of Household and Similar Electrical Appliances — General Requirements',
        relation_note: 'Base standard (read in conjunction)',
      },
      {
        is_number: 'IS 1293: 2019',
        title: 'Plugs and Socket-Outlets of Rated Voltage up to 250V',
        relation_note: 'Compulsory companion plug standard',
      },
      {
        is_number: 'IS 368: 2014',
        title: 'Electric Immersion Water Heaters — Performance Requirements',
        relation_note: 'Optional companion performance specification',
      },
    ],
  },

  'IS 302 (Part 1): 2024': {
    is_number: 'IS 302 (Part 1): 2024',
    title: 'Safety of Household and Similar Electrical Appliances — Part 1: General Requirements',
    status: 'active',
    relevance: 'highly_relevant',
    edition_info: 'Sixth Revision (Aligned with IEC 60335-1: 2020)',
    publication_date: '2024',
    last_verified_date: 'August 2026',
    product_category: 'General Electrical Safety',
    standard_type: 'Fundamental Safety Standard (Horizontal Standard)',
    scheme_info: 'BIS Conformity Assessment Scheme-I',
    qco_status: 'mandatory',
    qco_order_name: 'Electrical Appliances Quality Control Order',
    why_applicable: 'Mandatory base standard for all electrical household appliances, regulating general construction, electrical insulation, mechanical hazard protection, moisture resistance, and supply connections.',
    scope_description: 'Covers general safety requirements for electrical appliances for household and similar purposes, their rated voltage being not more than 250 V for single-phase appliances and 480 V for other appliances.',
    limitations: [
      'Must be read in conjunction with the appropriate Part 2 particular standard for specific product clauses.',
      'Does not apply to medical electrical equipment or industrial machinery.',
    ],
    key_requirements: [
      {
        category: 'General Electrical Safety',
        description: 'Foundational electric shock protection criteria.',
        points: [
          {
            title: 'Classification of Protection (Class I / Class II)',
            detail: 'Appliance must conform to Class I (earthed) or Class II (double insulated) construction rules.',
          },
          {
            title: 'Creepage & Clearance Distances',
            detail: 'Specific minimum physical air clearances and surface creepage distances between live parts and accessible enclosures.',
            requires_verification: true,
          },
        ],
      },
      {
        category: 'Fire & Thermal Resistance',
        description: 'Glow wire and flammability testing of non-metallic materials.',
        points: [
          {
            title: 'Glow-Wire Flammability Index (GWFI)',
            detail: 'Insulating materials supporting live connections must pass glow-wire test at designated test temperatures.',
            requires_verification: true,
          },
        ],
      },
    ],
    source_refs: [MOCK_SOURCES.bisIS302],
    related_standards_preview: [
      {
        is_number: 'IS 302 (Part 2/Sec 201)',
        title: 'Safety of Household and Similar Electrical Appliances — Immersion Heaters',
        relation_note: 'Product specific Part 2 standard',
      },
    ],
  },

  'IS 1293: 2019': {
    is_number: 'IS 1293: 2019',
    title: 'Plugs and Socket-Outlets of Rated Voltage up to and including 250 Volts and Rated Current up to and including 16 Amperes',
    status: 'active',
    relevance: 'relevant',
    edition_info: 'Fourth Revision',
    publication_date: '2019',
    last_verified_date: 'August 2026',
    product_category: 'Electrical Wiring Accessories',
    standard_type: 'Product Safety & Dimensional Standard',
    scheme_info: 'BIS Conformity Assessment Scheme-I (ISI Mark)',
    qco_status: 'mandatory',
    qco_order_name: 'Plugs and Socket-Outlets (Quality Control) Order',
    why_applicable: 'Mandatory standard governing the 3-pin molded plug and electrical pins attached to appliances operating at 230V in India.',
    scope_description: 'Applies to plugs and fixed or portable socket-outlets for a.c. only, with or without earthing contact, with a rated voltage above 50 V but not exceeding 250 V, and a rated current not exceeding 16 A, intended for household and similar purposes.',
    limitations: [
      'Applies only to Indian dimensional configurations (6A 3-pin, 16A 3-pin, and 2.5A Europlug profile).',
      'Industrial high-current plugs above 16A fall under separate standard series.',
    ],
    key_requirements: [
      {
        category: 'Dimensional & Gauge Compliance',
        description: 'Pin diameter, spacing, and insertion depth tolerances.',
        points: [
          {
            title: 'Gauge Verification',
            detail: 'Pins and contact dimensions must verify against standard GO and NOT-GO inspection gauges.',
            requires_verification: true,
          },
          {
            title: 'Insulated Pin Sleeves',
            detail: 'Live and neutral pins must have partial insulating sleeves to prevent finger contact during insertion.',
          },
        ],
      },
      {
        category: 'Mechanical & Temperature Rise',
        description: 'Endurance testing and terminal temperature thresholds.',
        points: [
          {
            title: 'Temperature Rise Under Load',
            detail: 'Terminal temperature rise must not exceed 45K when carrying rated continuous test current.',
            requires_verification: true,
          },
        ],
      },
    ],
    source_refs: [MOCK_SOURCES.bisIS302, MOCK_SOURCES.dpiitQco],
    related_standards_preview: [
      {
        is_number: 'IS 302 (Part 1): 2024',
        title: 'Safety of Household Electrical Appliances — General Requirements',
        relation_note: 'Parent appliance standard',
      },
    ],
  },
};

/** Normalizes diverse user URL inputs and slugs into standard keys */
export function getStandardDetailsBySlug(slug: string): StandardDetailsData {
  const decoded = decodeURIComponent(slug).trim();

  // Exact match
  if (MOCK_STANDARD_DETAILS[decoded]) {
    return MOCK_STANDARD_DETAILS[decoded];
  }

  // Normalized search
  const normalized = decoded.toLowerCase().replace(/[^a-z0-9]/g, '');

  for (const [key, val] of Object.entries(MOCK_STANDARD_DETAILS)) {
    const keyNorm = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normalized.includes(keyNorm) || keyNorm.includes(normalized)) {
      return val;
    }
  }

  // Fallback realistic generic standard
  return {
    is_number: decoded.startsWith('IS') ? decoded : `IS ${decoded}`,
    title: 'Indian Standard Specification for Quality and Safety Verification',
    status: 'active',
    relevance: 'relevant',
    edition_info: 'Latest Current Edition',
    publication_date: '2022',
    last_verified_date: 'August 2026',
    product_category: 'Industrial & Consumer Product Standards',
    standard_type: 'Product Safety & Performance Standard',
    scheme_info: 'BIS Conformity Assessment Scheme-I (ISI Mark)',
    qco_status: 'mandatory',
    qco_order_name: 'Relevant Ministry Quality Control Order',
    why_applicable: 'Identified as a potentially applicable standard based on product category, materials, and safety requirements.',
    scope_description: 'Prescribes the statutory manufacturing benchmarks, essential construction criteria, electrical or mechanical tolerances, and testing procedures applicable to this class of product under the Bureau of Indian Standards Act.',
    limitations: [
      'Specific applicability depends on the rated operating voltage, mechanical capacity, and commercial application.',
      'Clause-level requirements must be confirmed directly from the official gazette text.',
    ],
    key_requirements: [
      {
        category: 'General Safety & Construction',
        description: 'Physical durability, material safety, and hazard prevention.',
        points: [
          {
            title: 'Material Integrity & Durability',
            detail: 'Materials used must withstand continuous operating stresses without degradation.',
          },
          {
            title: 'Statutory Safety Thresholds',
            detail: 'Must satisfy prescribed limits for operational safety and mechanical resilience.',
            requires_verification: true,
          },
        ],
      },
      {
        category: 'Marking & Conformity',
        description: 'Standard mark application and traceability.',
        points: [
          {
            title: 'BIS Standard Mark',
            detail: 'Must be marked with the standard ISI mark and License details.',
          },
        ],
      },
    ],
    source_refs: [MOCK_SOURCES.bisIS302, MOCK_SOURCES.dpiitQco],
    related_standards_preview: [
      {
        is_number: 'IS 302 (Part 1): 2024',
        title: 'Safety of Household Electrical Appliances',
        relation_note: 'General safety reference',
      },
    ],
  };
}
