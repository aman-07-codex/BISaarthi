import { StandardDetailsData, StandardComparisonData, SuggestedComparisonPair, ComparisonRow, KeyDifferenceItem } from '@/types';
import { getStandardDetailsBySlug, MOCK_STANDARD_DETAILS } from './mockStandardDetails';

export const SUGGESTED_SELECTABLE_STANDARDS: StandardDetailsData[] = [
  MOCK_STANDARD_DETAILS['IS 302 (Part 2/Sec 201)'],
  MOCK_STANDARD_DETAILS['IS 302 (Part 1): 2024'],
  MOCK_STANDARD_DETAILS['IS 1293: 2019'],
  {
    is_number: 'IS 368: 2014',
    title: 'Electric Immersion Water Heaters — Specification for Performance',
    status: 'active',
    relevance: 'possibly_relevant',
    edition_info: 'Fifth Revision',
    publication_date: '2014',
    last_verified_date: 'August 2026',
    product_category: 'Electrical Heating Appliances (Performance)',
    standard_type: 'Performance & Energy Efficiency Specification',
    scheme_info: 'Voluntary Scheme / Optional ISI Certification',
    qco_status: 'voluntary',
    qco_order_name: 'Voluntary Commercial Performance Standard',
    why_applicable: 'Evaluates heating efficiency, standing losses, heating-up duration, and sheath durability under continuous hot water exposure.',
    scope_description: 'Prescribes the performance requirements and methods of test for portable electric immersion water heaters intended for domestic use.',
    limitations: [
      'Focuses on operational energy performance and thermal efficiency rather than primary dielectric safety.',
      'Must be applied in conjunction with IS 302 (Part 2/Sec 201) for statutory life safety.',
    ],
    key_requirements: [
      {
        category: 'Performance Benchmarks',
        description: 'Thermal energy conversion and heating duration.',
        points: [
          {
            title: 'Thermal Efficiency Ratio',
            detail: 'Minimum energy transfer efficiency into standard water volume under calibrated ambient conditions.',
            requires_verification: true,
          },
        ],
      },
    ],
    source_refs: [MOCK_STANDARD_DETAILS['IS 302 (Part 2/Sec 201)'].source_refs[0]],
    related_standards_preview: [
      {
        is_number: 'IS 302 (Part 2/Sec 201)',
        title: 'Safety of Immersion Water Heaters',
        relation_note: 'Compulsory safety counterpart',
      },
    ],
  },
  {
    is_number: 'IS 16102 (Part 1): 2012',
    title: 'Self-Ballasted LED Lamps for General Lighting Services — Part 1: Safety Requirements',
    status: 'active',
    relevance: 'relevant',
    edition_info: 'First Edition (with Amendments 1 & 2)',
    publication_date: '2012',
    last_verified_date: 'August 2026',
    product_category: 'LED Lighting & Solid State Luminaires',
    standard_type: 'Compulsory Safety Specification (MeitY CRS)',
    scheme_info: 'BIS Compulsory Registration Scheme (CRS / Scheme-II)',
    qco_status: 'mandatory',
    qco_order_name: 'Electronics and Information Technology Goods (CRO)',
    why_applicable: 'Mandatory standard governing electrical shock protection, insulation resistance, and mechanical strength of lamp caps for self-ballasted LED lamps.',
    scope_description: 'Specifies the safety and interchangeability requirements, together with the test methods and conditions required to show compliance of LED lamps with integrated means for controlling.',
    limitations: [
      'Applies to self-ballasted LED bulbs up to 60W and 250V AC.',
      'Luminaires with separate external drivers fall under IS 10322 series.',
    ],
    key_requirements: [],
    source_refs: [MOCK_STANDARD_DETAILS['IS 302 (Part 2/Sec 201)'].source_refs[0]],
    related_standards_preview: [],
  },
  {
    is_number: 'IS 16046 (Part 2): 2018',
    title: 'Secondary Cells and Batteries Containing Alkaline or Other Non-Acid Electrolytes — Safety Requirements for Portable Sealed Secondary Cells (Lithium Systems)',
    status: 'active',
    relevance: 'relevant',
    edition_info: 'Second Revision (Aligned with IEC 62133-2)',
    publication_date: '2018',
    last_verified_date: 'August 2026',
    product_category: 'Portable Rechargeable Batteries & Energy Storage',
    standard_type: 'Safety Specification (MeitY CRS / Scheme-II)',
    scheme_info: 'BIS Compulsory Registration Scheme (CRS)',
    qco_status: 'mandatory',
    qco_order_name: 'Compulsory Registration Order (CRO), MeitY',
    why_applicable: 'Mandatory for lithium-ion battery cells and packs used in portable electronics, power banks, and portable appliances.',
    scope_description: 'Specifies requirements and tests for the safe operation of portable sealed secondary lithium cells and batteries that contain non-acid electrolyte, under intended use and reasonably foreseeable misuse.',
    limitations: [
      'Applies to portable applications; large-scale grid storage falls under distinct IS series.',
    ],
    key_requirements: [],
    source_refs: [MOCK_STANDARD_DETAILS['IS 302 (Part 2/Sec 201)'].source_refs[0]],
    related_standards_preview: [],
  },
];

export const SUGGESTED_COMPARISON_PAIRS: SuggestedComparisonPair[] = [
  {
    id: 'pair-heater-part2-part1',
    title: 'Immersion Heaters vs Base Appliance Safety',
    tag: 'Product-Specific vs Base Standard',
    description: 'Compare particular safety clauses for immersion heaters against the mandatory horizontal baseline safety standard.',
    standard1_is: 'IS 302 (Part 2/Sec 201)',
    standard2_is: 'IS 302 (Part 1): 2024',
  },
  {
    id: 'pair-plug-appliance',
    title: 'Molded 3-Pin Plugs vs Parent Appliance Standard',
    tag: 'Companion Standard Comparison',
    description: 'Understand how component-level plug-top specifications interact with parent household electrical appliance safety rules.',
    standard1_is: 'IS 1293: 2019',
    standard2_is: 'IS 302 (Part 1): 2024',
  },
  {
    id: 'pair-safety-performance',
    title: 'Electrical Safety vs Performance Benchmarks',
    tag: 'Safety vs Performance',
    description: 'Compare mandatory life-safety and shock prevention requirements against optional thermal heating efficiency criteria.',
    standard1_is: 'IS 302 (Part 2/Sec 201)',
    standard2_is: 'IS 368: 2014',
  },
];

/** Specific pairwise comparisons */
export const MOCK_PAIRWISE_COMPARISONS: Record<string, StandardComparisonData> = {
  'IS 302 (Part 2/Sec 201)_VS_IS 302 (Part 1): 2024': {
    standard1: MOCK_STANDARD_DETAILS['IS 302 (Part 2/Sec 201)'],
    standard2: MOCK_STANDARD_DETAILS['IS 302 (Part 1): 2024'],
    relationship_type: 'parent_child',
    relationship_overview: 'IS 302 (Part 2/Sec 201) is a particular product specification that modifies, supplements, or supersedes corresponding clauses of the base standard IS 302 (Part 1). For complete conformity assessment, both standards must be applied in conjunction.',
    rows: [
      {
        category: 'Standard Title',
        standard1_value: 'Safety of Household and Similar Electrical Appliances — Part 2: Section 201: Electric Immersion Water Heaters',
        standard2_value: 'Safety of Household and Similar Electrical Appliances — Part 1: General Requirements',
      },
      {
        category: 'Product Scope',
        standard1_value: 'Specifically covers portable electric immersion water heaters up to 250V single-phase intended for heating water in domestic vessels.',
        standard2_value: 'Broad scope covering all electrical appliances for household and similar purposes (up to 250V single-phase / 480V three-phase).',
      },
      {
        category: 'Primary Purpose',
        standard1_value: 'Prescribes particular mechanical sheath, boil-dry thermal protection, and water immersion safety criteria.',
        standard2_value: 'Establishes horizontal, foundational electrical shock, insulation, fire, and construction baseline rules.',
      },
      {
        category: 'Applicability',
        standard1_value: 'Directly applicable to electric immersion heater manufacturers and importers.',
        standard2_value: 'Parent standard applicable across all domestic electrical appliance categories.',
      },
      {
        category: 'Safety Focus',
        standard1_value: 'Thermal cut-out against dry-run fire hazard, IPX7 immersion head seal, sheath corrosion resistance.',
        standard2_value: 'Class I / Class II insulation classification, creepage and clearance distances, glow-wire fire resistance.',
        requires_verification: true,
      },
      {
        category: 'Testing Relevance',
        standard1_value: 'Continuous dry-boil test, immersion water tightness, handle temperature rise under liquid load.',
        standard2_value: 'High voltage breakdown, earth continuity resistance, general mechanical impact resistance.',
        requires_verification: true,
      },
      {
        category: 'Certification Relevance',
        standard1_value: 'Primary standard cited on BIS Scheme-I ISI Mark license scope for immersion heaters.',
        standard2_value: 'Mandatory co-requisite standard evaluated during factory audit and laboratory type testing.',
      },
      {
        category: 'Regulatory Context',
        standard1_value: 'Mandatory notification under Electrical Appliances (Quality Control) Order, 2023.',
        standard2_value: 'Mandatory baseline reference under Electrical Appliances (Quality Control) Order.',
      },
      {
        category: 'Related Standards',
        standard1_value: 'IS 302 (Part 1), IS 1293 (Plugs), IS 368 (Performance).',
        standard2_value: 'All IS 302 Part 2 particular standards, IS 1293, IEC 60335 series.',
      },
      {
        category: 'Revision / Edition',
        standard1_value: 'Fourth Revision (Aligned with IEC 60335-2-73)',
        standard2_value: 'Sixth Revision (2024, Aligned with IEC 60335-1: 2020)',
      },
    ],
    key_differences: [
      {
        dimension: 'Scope & Specificity',
        standard1_point: 'Highly specific to liquid heating elements, vessels, and sheath structures.',
        standard2_point: 'Broad horizontal baseline governing all electrical domestic apparatus.',
        summary: 'Standard 1 contains specialized rules for water contact; Standard 2 provides foundational electrical rules.',
      },
      {
        dimension: 'Hazard Focus',
        standard1_point: 'Dry-boil fire hazards, sheath liquid leakage, and IPX7 submersion risks.',
        standard2_point: 'General electrical shock, enclosure fire flammability, and mechanical pinching.',
        summary: 'Standard 1 adds liquid-specific hazard protections missing from general appliance rules.',
      },
      {
        dimension: 'Testing Setup',
        standard1_point: 'Requires water immersion tank, boiling endurance rig, and dry-run thermal test bench.',
        standard2_point: 'Standard high-voltage test transformer, insulation resistance tester, and glow-wire test apparatus.',
        summary: 'Both in-house test batteries are required for factory licensing under Scheme-I.',
      },
      {
        dimension: 'Certification Implementation',
        standard1_point: 'Cited as the primary product classification on the BIS license certificate.',
        standard2_point: 'Evaluated in tandem as the foundational baseline standard.',
        summary: 'Neither standard can be certified in isolation for electric immersion heaters.',
      },
    ],
  },

  'IS 1293: 2019_VS_IS 302 (Part 1): 2024': {
    standard1: MOCK_STANDARD_DETAILS['IS 1293: 2019'],
    standard2: MOCK_STANDARD_DETAILS['IS 302 (Part 1): 2024'],
    relationship_type: 'companion',
    relationship_overview: 'IS 1293 is a component-level safety standard governing the plug-and-socket connection interface, while IS 302 (Part 1) governs the complete finished appliance. Appliances terminating in a plug must use an IS 1293 compliant plug.',
    rows: [
      {
        category: 'Standard Title',
        standard1_value: 'Plugs and Socket-Outlets of Rated Voltage up to and including 250 Volts and Rated Current up to 16 Amperes',
        standard2_value: 'Safety of Household and Similar Electrical Appliances — Part 1: General Requirements',
      },
      {
        category: 'Product Scope',
        standard1_value: 'Covers 2-pin and 3-pin plugs, fixed socket-outlets, and portable multi-plug adaptors.',
        standard2_value: 'Covers complete household electrical appliances and their integral wiring systems.',
      },
      {
        category: 'Primary Purpose',
        standard1_value: 'Ensures dimensional interchangeability, pin mechanical strength, and finger-touch shock prevention.',
        standard2_value: 'Ensures overall appliance electrical insulation, thermal safety, and fire containment.',
      },
      {
        category: 'Applicability',
        standard1_value: 'Molded plug manufacturers, cable harness assemblers, and appliance OEMs.',
        standard2_value: 'Finished domestic appliance manufacturers and importers.',
      },
      {
        category: 'Safety Focus',
        standard1_value: 'Insulated pin sleeves, solid earthing contact mating before live contact, gauge insertion fit.',
        standard2_value: 'Class I / Class II protection, internal cord anchorage, temperature rise of enclosures.',
        requires_verification: true,
      },
      {
        category: 'Testing Relevance',
        standard1_value: 'GO/NO-GO dimensional gauge inspection, mechanical tumbling barrel test, terminal temperature rise.',
        standard2_value: 'Appliance high voltage withstand, creepage/clearance, power input tolerance.',
        requires_verification: true,
      },
      {
        category: 'Certification Relevance',
        standard1_value: 'Plugs must independently carry an ISI mark under Scheme-I.',
        standard2_value: 'Finished appliances undergo Scheme-I certification with verified plug sub-assembly.',
      },
      {
        category: 'Regulatory Context',
        standard1_value: 'Mandatory under Plugs and Socket-Outlets Quality Control Order.',
        standard2_value: 'Mandatory under Electrical Appliances Quality Control Order.',
      },
      {
        category: 'Related Standards',
        standard1_value: 'IS 302 (Part 1), IS 694 (PVC Cables), IEC 60884.',
        standard2_value: 'IS 1293, IS 302 Part 2 series, IS 694.',
      },
      {
        category: 'Revision / Edition',
        standard1_value: 'Fourth Revision (2019)',
        standard2_value: 'Sixth Revision (2024)',
      },
    ],
    key_differences: [
      {
        dimension: 'Product Hierarchy',
        standard1_point: 'Component / Wiring accessory standard.',
        standard2_point: 'Finished end-product appliance standard.',
        summary: 'IS 1293 applies to the plug termination; IS 302 (Part 1) applies to the entire device.',
      },
      {
        dimension: 'Dimensional Gauging',
        standard1_point: 'Strict mechanical gauge tolerances for pin diameter, pitch, and length.',
        standard2_point: 'Enclosure creepage and clearance distances rather than plug pin profile.',
        summary: 'Plug dimensions must conform strictly to Indian socket geometry.',
      },
      {
        dimension: 'Certification Requirement',
        standard1_point: 'Requires independent ISI mark on the plug molding.',
        standard2_point: 'Requires ISI mark on the complete appliance rating label.',
        summary: 'An appliance cannot achieve IS 302 certification if its fitted plug lacks IS 1293 compliance.',
      },
    ],
  },
};

/** Dynamic comparison data generator for any pair of standards */
export function getStandardComparisonData(slug1: string, slug2: string): StandardComparisonData {
  const std1 = getStandardDetailsBySlug(slug1);
  const std2 = getStandardDetailsBySlug(slug2);

  // Check predefined pairwise keys
  const keyA = `${std1.is_number}_VS_${std2.is_number}`;
  const keyB = `${std2.is_number}_VS_${std1.is_number}`;

  if (MOCK_PAIRWISE_COMPARISONS[keyA]) {
    return MOCK_PAIRWISE_COMPARISONS[keyA];
  }

  if (MOCK_PAIRWISE_COMPARISONS[keyB]) {
    const orig = MOCK_PAIRWISE_COMPARISONS[keyB];
    return {
      standard1: orig.standard2,
      standard2: orig.standard1,
      relationship_type: orig.relationship_type,
      relationship_overview: orig.relationship_overview,
      rows: orig.rows.map((r) => ({
        category: r.category,
        standard1_value: r.standard2_value,
        standard2_value: r.standard1_value,
        requires_verification: r.requires_verification,
      })),
      key_differences: orig.key_differences.map((k) => ({
        dimension: k.dimension,
        standard1_point: k.standard2_point,
        standard2_point: k.standard1_point,
        summary: k.summary,
      })),
    };
  }

  // Dynamic realistic fallback comparison
  const isParentChild =
    std1.is_number.includes('Part 2') || std2.is_number.includes('Part 2') ||
    (std1.is_number.includes('Part 1') && std2.is_number.includes('Part 2'));

  const relationshipOverview = isParentChild
    ? `These standards operate in a parent-particular relationship within the Indian Standards hierarchy. One standard prescribes foundational safety rules, while the other provides particular specifications tailored to specific product constructions.`
    : `These two standards govern distinct product categories or complementary aspects of manufacturing quality, safety, or performance. Compare their scope boundaries to determine which applies to your intended product line.`;

  return {
    standard1: std1,
    standard2: std2,
    relationship_type: isParentChild ? 'parent_child' : 'distinct_category',
    relationship_overview: relationshipOverview,
    rows: [
      {
        category: 'Standard Title',
        standard1_value: std1.title,
        standard2_value: std2.title,
      },
      {
        category: 'Product Scope',
        standard1_value: std1.scope_description || 'Prescribes statutory manufacturing and safety criteria for its designated product category.',
        standard2_value: std2.scope_description || 'Prescribes statutory manufacturing and safety criteria for its designated product category.',
      },
      {
        category: 'Primary Purpose',
        standard1_value: std1.standard_type || 'Safety & Compliance Specification',
        standard2_value: std2.standard_type || 'Safety & Compliance Specification',
      },
      {
        category: 'Applicability',
        standard1_value: std1.why_applicable || 'Identified as applicable to this product category.',
        standard2_value: std2.why_applicable || 'Identified as applicable to this product category.',
      },
      {
        category: 'Safety Focus',
        standard1_value: std1.key_requirements[0]?.description || 'Statutory safety limits, mechanical durability, and user protection.',
        standard2_value: std2.key_requirements[0]?.description || 'Statutory safety limits, mechanical durability, and user protection.',
        requires_verification: true,
      },
      {
        category: 'Testing Relevance',
        standard1_value: 'Routine in-house factory testing and independent third-party laboratory verification.',
        standard2_value: 'Routine in-house factory testing and independent third-party laboratory verification.',
        requires_verification: true,
      },
      {
        category: 'Certification Relevance',
        standard1_value: std1.scheme_info || 'BIS Scheme-I Conformity Assessment',
        standard2_value: std2.scheme_info || 'BIS Scheme-I Conformity Assessment',
      },
      {
        category: 'Regulatory Context',
        standard1_value: std1.qco_status === 'mandatory' ? `Mandatory under ${std1.qco_order_name || 'QCO'}` : 'Voluntary standard',
        standard2_value: std2.qco_status === 'mandatory' ? `Mandatory under ${std2.qco_order_name || 'QCO'}` : 'Voluntary standard',
      },
      {
        category: 'Related Standards',
        standard1_value: std1.related_standards_preview?.map((s) => s.is_number).join(', ') || 'Requires source verification',
        standard2_value: std2.related_standards_preview?.map((s) => s.is_number).join(', ') || 'Requires source verification',
      },
      {
        category: 'Revision / Edition',
        standard1_value: `${std1.edition_info || 'Current Edition'} (${std1.publication_date})`,
        standard2_value: `${std2.edition_info || 'Current Edition'} (${std2.publication_date})`,
      },
    ],
    key_differences: [
      {
        dimension: 'Scope & Application',
        standard1_point: `Applies specifically to ${std1.product_category || std1.is_number}.`,
        standard2_point: `Applies specifically to ${std2.product_category || std2.is_number}.`,
        summary: 'Each standard serves distinct product categories or specific clause levels.',
      },
      {
        dimension: 'Conformity Scheme',
        standard1_point: `${std1.scheme_info} (${std1.qco_status.toUpperCase()})`,
        standard2_point: `${std2.scheme_info} (${std2.qco_status.toUpperCase()})`,
        summary: 'Verify whether the licensing pathway requires Scheme-I (ISI Mark) or Scheme-II (CRS).',
      },
      {
        dimension: 'Regulatory Enforcement',
        standard1_point: std1.qco_order_name || 'Subject to statutory gazette notifications.',
        standard2_point: std2.qco_order_name || 'Subject to statutory gazette notifications.',
        summary: 'Regulatory timelines and Quality Control Orders dictate compulsory enforcement dates.',
      },
    ],
  };
}
