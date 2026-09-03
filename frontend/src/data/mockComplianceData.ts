import { TestsCertificationData, RecognizedLaboratoriesData, SourceRef } from '@/types';
import { MOCK_SOURCES } from './mockChatData';
import { getStandardDetailsBySlug } from './mockStandardDetails';

export const MOCK_TESTS_CERTIFICATION_DATA: Record<string, TestsCertificationData> = {
  'IS 302 (Part 2/Sec 201)': {
    is_number: 'IS 302 (Part 2/Sec 201)',
    title: 'Safety of Household and Similar Electrical Appliances — Part 2: Particular Requirements: Section 201: Electric Immersion Water Heaters',
    status: 'active',
    relevance: 'highly_relevant',
    overview: {
      certification_relevance: 'Mandatory certification required under Scheme-I for commercial manufacture and distribution in India.',
      scheme_name: 'BIS Conformity Assessment Scheme-I (ISI Mark)',
      scheme_code: 'Scheme-I (Product Certification)',
      mandate_status: 'mandatory',
      qco_order_name: 'Electrical Appliances (Quality Control) Order, 2023',
      product_category: 'Electrical Heating & Domestic Appliances',
      testing_relevance: 'Factory routine testing + Independent type testing at recognized BIS or NABL accredited laboratory.',
      guidance_note: 'High voltage breakdown, operating leakage current, boil-dry thermal protection, and IPX7 immersion integrity form the core testing matrix.',
    },
    testing_categories: [
      {
        id: 'cat-elec',
        category: 'Electrical Safety & Dielectric Integrity',
        description: 'Protection against electric shock, insulation resistance, and dielectric withstand.',
        badge_label: 'Critical Safety',
        points: [
          {
            title: 'High Voltage Breakdown (Dielectric Withstand)',
            detail: 'Verification that insulation withstands high voltage potential between energized components and external metal sheath.',
            requires_verification: true,
          },
          {
            title: 'Operating Leakage Current Limits',
            detail: 'Measurement of continuous leakage current across the liquid medium under maximum rated power dissipation.',
            requires_verification: true,
          },
          {
            title: 'Protective Earthing & Continuity',
            detail: 'Measurement of electrical bonding resistance between accessible conductive surfaces and protective earthing terminal.',
            requires_verification: false,
          },
          {
            title: 'Insulation Resistance at Operating Temperature',
            detail: 'Verification of minimum megaohm resistance under elevated temperature and humidity conditions.',
            requires_verification: true,
          },
        ],
      },
      {
        id: 'cat-mech',
        category: 'Construction & Mechanical Safety',
        description: 'Physical durability, sheath material integrity, and dry-run hazard mitigation.',
        badge_label: 'Construction Safety',
        points: [
          {
            title: 'Boil-Dry Thermal Cut-Out Functionality',
            detail: 'Evaluation of non-self-resetting thermal cut-out tripping during accidental dry-run activation without water.',
            requires_verification: true,
          },
          {
            title: 'Heating Element Sheath Thickness & Metallurgy',
            detail: 'Verification of copper or approved stainless alloy wall thickness against corrosion and mechanical fatigue.',
            requires_verification: false,
          },
          {
            title: 'Supply Cord Anchorage & Flexing Resistance',
            detail: 'Tensile pull and rotational torque tests on cable terminal entry to prevent conductor strain and detachment.',
            requires_verification: true,
          },
        ],
      },
      {
        id: 'cat-env',
        category: 'Environmental & Moisture Protection',
        description: 'Protection against water ingress during immersion and cleaning operations.',
        badge_label: 'Environmental (IPX)',
        points: [
          {
            title: 'Moisture Ingress Protection (IPX7 Immersion)',
            detail: 'Submersion test of heating head and handle assembly to confirm water seal integrity.',
            requires_verification: true,
          },
          {
            title: 'Spill & Splash Resistance',
            detail: 'Evaluation of terminal enclosure against liquid splashing and condensation build-up.',
            requires_verification: false,
          },
          {
            title: 'Resistance to Rusting & Chemical Scaling',
            detail: 'Visual and metallurgical check after cyclic immersion in hard water testing solution.',
            requires_verification: false,
          },
        ],
      },
      {
        id: 'cat-mark',
        category: 'Marking, Labelling & Consumer Warnings',
        description: 'Mandatory on-product ratings, safety warnings, and standard mark traceability.',
        badge_label: 'Traceability',
        points: [
          {
            title: 'Permanent Nameplate & Electrical Rating',
            detail: 'Durability rubbing test (water & petroleum spirit) for voltage, wattage rating, and manufacturer identification.',
            requires_verification: false,
          },
          {
            title: 'Water Level Indicator Markings',
            detail: 'Indelible minimum and maximum water level lines clearly demarcated on the element sheath.',
            requires_verification: false,
          },
          {
            title: 'ISI Mark & License Number Display',
            detail: 'Legible display of standard ISI monogram with assigned 7 or 8-digit CM/L license number.',
            requires_verification: true,
          },
        ],
      },
      {
        id: 'cat-perf',
        category: 'Performance & Thermal Balance',
        description: 'Operational heating efficiency and energy transfer characteristics.',
        badge_label: 'Performance',
        points: [
          {
            title: 'Rated Input Power Tolerance',
            detail: 'Verification that measured power consumption at rated voltage is within standard tolerance brackets.',
            requires_verification: true,
          },
          {
            title: 'Heating-up Time & Efficiency',
            detail: 'Evaluation of time required to heat standardized water volume against baseline performance benchmarks.',
            requires_verification: false,
          },
        ],
      },
    ],
    workflow_steps: [
      {
        step_number: 1,
        title: 'Product Specification & Design Alignment',
        description: 'Define technical ratings (voltage, wattage, sheath material) and align initial prototypes with IS 302 (Part 2/Sec 201) and IS 1293 standards.',
      },
      {
        step_number: 2,
        title: 'Applicable Requirements & Clause Identification',
        description: 'Identify specific mandatory safety clauses, routine in-house test parameters, and external laboratory type-test scope.',
      },
      {
        step_number: 3,
        title: 'Prototype & Pre-Compliance Testing',
        description: 'Conduct internal screening tests (dielectric withstand, leakage current, boil-dry safety) on pilot manufacturing batches.',
      },
      {
        step_number: 4,
        title: 'Test Documentation & Quality Management',
        description: 'Compile testing records, calibration certificates for test equipment, raw material traceability, and Scheme of Inspection and Testing (SIT).',
      },
      {
        step_number: 5,
        title: 'Conformity Assessment & Sample Submission',
        description: 'Submit formal application on Manakonline portal and send sealed test samples to recognized BIS / NABL accredited laboratory.',
      },
      {
        step_number: 6,
        title: 'Factory Audit & BIS License Grant',
        description: 'Host BIS officer for factory inspection, verification of testing laboratory infrastructure, and receive CM/L license for ISI marking.',
      },
    ],
    conformity_pathway_steps: [
      {
        step_number: 1,
        title: 'Determine Applicability & Scope',
        subtitle: 'Classification & Standards Mapping',
        description: 'Verify if your product falls under the mandatory Electrical Appliances Quality Control Order (QCO) and confirm applicable product series.',
        key_actions: [
          'Confirm product operating voltage (≤ 250V AC) and physical heater configuration',
          'Review mandatory QCO enforcement notifications issued by DPIIT',
          'Identify companion standards including IS 302 (Part 1) and IS 1293 (plug)',
        ],
      },
      {
        step_number: 2,
        title: 'Identify Applicable Requirements & SIT',
        subtitle: 'Scheme of Inspection & Testing',
        description: 'Obtain the official BIS Scheme of Inspection and Testing (SIT) outlining daily routine tests, acceptance tests, and sampling frequencies.',
        key_actions: [
          'Acquire official standard copy and SIT document from BIS Sales Portal',
          'Identify in-house test equipment mandatory for factory laboratory setup',
          'Establish calibration schedules with NABL-traceable reference standards',
        ],
      },
      {
        step_number: 3,
        title: 'Conduct In-House & Laboratory Testing',
        subtitle: 'Type Testing & Verification',
        description: 'Execute internal quality control runs and obtain independent type-test reports from recognized testing facilities.',
        key_actions: [
          'Perform routine tests: High Voltage, Earthing Continuity, Insulation Resistance',
          'Dispatch sample units for independent type testing under full clause scope',
          'Review third-party test report against pass/fail criteria',
        ],
      },
      {
        step_number: 4,
        title: 'Prepare Compliance Dossier',
        subtitle: 'Technical Documentation',
        description: 'Assemble complete documentation packet including component BOM, circuit diagrams, factory layout, and calibration logbooks.',
        key_actions: [
          'Prepare manufacturing process flowchart and quality manual',
          'Include test reports of critical sub-components (switches, thermal fuses, plugs)',
          'Draft standard marking artwork with designated ISI mark layout',
        ],
      },
      {
        step_number: 5,
        title: 'Submit Through BIS Manakonline',
        subtitle: 'Licensing Application & Audit',
        description: 'File application under Scheme-I on the official BIS portal (Manakonline) and schedule the preliminary factory inspection.',
        key_actions: [
          'Upload technical dossier and pay statutory government evaluation fees',
          'Undergo factory audit by BIS technical officer to verify testing apparatus',
          'Facilitate independent sample drawing and sealing during factory visit',
        ],
      },
      {
        step_number: 6,
        title: 'Maintain Conformity & Market Surveillance',
        subtitle: 'Ongoing Compliance & Renewals',
        description: 'Upon license grant (CM/L), maintain strict adherence to SIT, maintain production batch registers, and participate in periodic surveillance audits.',
        key_actions: [
          'Apply valid CM/L license number on products, packaging, and invoices',
          'Log continuous routine test data for every manufactured production batch',
          'Comply with annual renewal guidelines and periodic BIS market sample draws',
        ],
      },
    ],
    source_refs: [MOCK_SOURCES.bisIS302, MOCK_SOURCES.dpiitQco, MOCK_SOURCES.bisScheme1],
  },
};

export const MOCK_RECOGNIZED_LABORATORIES_DATA: Record<string, RecognizedLaboratoriesData> = {
  'IS 302 (Part 2/Sec 201)': {
    is_number: 'IS 302 (Part 2/Sec 201)',
    title: 'Safety of Household and Similar Electrical Appliances — Part 2: Particular Requirements: Section 201: Electric Immersion Water Heaters',
    status: 'active',
    relevance: 'highly_relevant',
    product_category: 'Electrical Heating & Domestic Appliances',
    laboratories: [
      {
        id: 'lab-01',
        name: 'National Testing House (Northern Region)',
        lab_type: 'bis_central',
        type_label: 'Central Government Testing Facility',
        city: 'Ghaziabad',
        state: 'Uttar Pradesh',
        testing_capability: 'Comprehensive Type Testing & Routine Evaluation for IS 302 series (Electric Heaters, Geysers & Domestic Appliances)',
        applicable_standards: ['IS 302 (Part 2/Sec 201)', 'IS 302 (Part 1)', 'IS 1293', 'IS 368'],
        accreditation_indicator: 'BIS Recognized & NABL Accredited (ISO/IEC 17025)',
        lead_time_guidance: '15–25 working days typical for full type test schedule',
        facilities_overview: [
          'High Voltage Dielectric Withstand chamber up to 5kV AC',
          'Dynamic Water Ingress & IPX7 immersion test tank',
          'Calibrated Leakage Current measurement rig with temperature tracking',
          'Glow-Wire & Flammability chamber for polymer materials',
        ],
        is_example_listing: true,
      },
      {
        id: 'lab-02',
        name: 'BIS Central Laboratory (Sahibabad)',
        lab_type: 'bis_central',
        type_label: 'Authoritative BIS Laboratory',
        city: 'Sahibabad',
        state: 'Uttar Pradesh',
        testing_capability: 'Official Reference Laboratory for Scheme-I ISI Mark Certification & Statutory Dispute Testing',
        applicable_standards: ['IS 302 (Part 2/Sec 201)', 'IS 302 (Part 1)', 'IS 1293'],
        accreditation_indicator: 'Central BIS Laboratory Network (Statutory Facility)',
        lead_time_guidance: 'Allocated directly through official BIS Manakonline application workflow',
        facilities_overview: [
          'Automated Boil-Dry Thermal Cutout verification station',
          'Continuous Endurance & Thermal Shock cycle apparatus',
          'Precision Go / No-Go Gauges for ISI 1293 plug inspection',
          'Climatic Condition & Humidity Pre-conditioning chamber',
        ],
        is_example_listing: true,
      },
      {
        id: 'lab-03',
        name: 'Western Regional Conformity Testing Station',
        lab_type: 'nabl_accredited',
        type_label: 'NABL Accredited Testing Facility',
        city: 'Mumbai',
        state: 'Maharashtra',
        testing_capability: 'Commercial Pre-Compliance, Safety Verification & Type Testing for Household Electrical Appliances',
        applicable_standards: ['IS 302 (Part 2/Sec 201)', 'IS 302 (Part 1)', 'IS 1293'],
        accreditation_indicator: 'NABL Accredited Laboratory & Recognized Third-Party Facility',
        lead_time_guidance: '10–18 working days typical sample testing turnaround',
        facilities_overview: [
          'Rapid Pre-compliance screening and failure diagnostics',
          'Cord Anchorage and Mechanical Pull-Torsion bench',
          'Digital Power Analyzer and thermal rise loggers',
          'Corrosion and Salt-Spray test enclosure for sheaths',
        ],
        is_example_listing: true,
      },
      {
        id: 'lab-04',
        name: 'Southern Electro-Technical Assessment Centre',
        lab_type: 'commercial',
        type_label: 'Recognized Commercial Testing Facility',
        city: 'Bengaluru',
        state: 'Karnataka',
        testing_capability: 'Complete Electrical Safety, Environmental Ingress & Energy Consumption Evaluation',
        applicable_standards: ['IS 302 (Part 2/Sec 201)', 'IS 302 (Part 1)', 'IS 16046'],
        accreditation_indicator: 'ISO/IEC 17025 Conformity Assessment Laboratory',
        lead_time_guidance: '12–20 working days typical turnaround',
        facilities_overview: [
          'Full automated data logging for temperature rise benchmarks',
          'Water immersion depth test columns for IPX4 through IPX8',
          'Electronic insulation resistance testers (1000V DC)',
          'Mechanical impact and spring-operated hammer test bench',
        ],
        is_example_listing: true,
      },
    ],
    source_refs: [MOCK_SOURCES.bisIS302, MOCK_SOURCES.bisScheme1],
  },
};

/** Normalizes diverse user URL inputs and returns Tests & Certification Data */
export function getTestsCertificationDataBySlug(slug: string): TestsCertificationData {
  const decoded = decodeURIComponent(slug).trim();

  if (MOCK_TESTS_CERTIFICATION_DATA[decoded]) {
    return MOCK_TESTS_CERTIFICATION_DATA[decoded];
  }

  const normalized = decoded.toLowerCase().replace(/[^a-z0-9]/g, '');

  for (const [key, val] of Object.entries(MOCK_TESTS_CERTIFICATION_DATA)) {
    const keyNorm = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normalized.includes(keyNorm) || keyNorm.includes(normalized)) {
      return val;
    }
  }

  // Fallback realistic generic standard tests & certification data
  const baseStandard = getStandardDetailsBySlug(slug);

  return {
    is_number: baseStandard.is_number,
    title: baseStandard.title,
    status: baseStandard.status,
    relevance: baseStandard.relevance,
    overview: {
      certification_relevance: `Mandatory or voluntary conformity assessment pathway applicable for products covered under ${baseStandard.is_number}.`,
      scheme_name: baseStandard.scheme_info || 'BIS Conformity Assessment Scheme-I',
      scheme_code: 'Scheme-I / Product Certification',
      mandate_status: baseStandard.qco_status || 'mandatory',
      qco_order_name: baseStandard.qco_order_name || 'Applicable Ministry Quality Control Order',
      product_category: baseStandard.product_category || 'Industrial & Consumer Product Standards',
      testing_relevance: 'Factory routine quality testing + Independent testing at recognized BIS or NABL accredited testing laboratory.',
      guidance_note: 'Standard compliance requires verification of material parameters, mechanical endurance, safety thresholds, and traceable markings.',
    },
    testing_categories: [
      {
        id: 'cat-gen-safe',
        category: 'General Safety & Operational Integrity',
        description: 'Verification of fundamental physical and operational safety boundaries under normal and abnormal use.',
        badge_label: 'Primary Safety',
        points: [
          {
            title: 'Statutory Safety Thresholds',
            detail: 'Appliance or component must satisfy prescribed limits for operational safety and mechanical resilience.',
            requires_verification: true,
          },
          {
            title: 'Material Durability & Aging Resistance',
            detail: 'Constituent materials must withstand continuous operating environmental stresses without premature degradation.',
            requires_verification: true,
          },
          {
            title: 'Failure Mode & Containment',
            detail: 'Protection against collateral hazard in the event of component failure or improper operator handling.',
            requires_verification: false,
          },
        ],
      },
      {
        id: 'cat-gen-mech',
        category: 'Construction & Mechanical Requirements',
        description: 'Physical structural integrity, dimensional tolerances, and enclosure strength.',
        badge_label: 'Construction',
        points: [
          {
            title: 'Dimensional & Tolerance Compliance',
            detail: 'Critical physical dimensions must verify against designated tolerances specified in standard tables.',
            requires_verification: true,
          },
          {
            title: 'Mechanical Impact & Vibration Resistance',
            detail: 'Enclosure must withstand standardized impact and vibration stresses without compromising protection.',
            requires_verification: false,
          },
        ],
      },
      {
        id: 'cat-gen-mark',
        category: 'Marking, Traceability & Packaging',
        description: 'Mandatory standard monogram, batch identification, and consumer warning legends.',
        badge_label: 'Marking',
        points: [
          {
            title: 'BIS Standard Mark Application',
            detail: 'Clear and indelible application of the standard ISI / CRS mark with corresponding license number.',
            requires_verification: true,
          },
          {
            title: 'Manufacturer Identification & Rating',
            detail: 'Permanent display of manufacturer name, model designation, and nominal operating parameters.',
            requires_verification: false,
          },
        ],
      },
    ],
    workflow_steps: [
      {
        step_number: 1,
        title: 'Product Specification & Design Alignment',
        description: `Define product technical specifications and align design with requirements under ${baseStandard.is_number}.`,
      },
      {
        step_number: 2,
        title: 'Applicable Requirements & Clause Identification',
        description: 'Identify specific mandatory clauses, required factory testing setup, and independent laboratory test routines.',
      },
      {
        step_number: 3,
        title: 'Testing Against Relevant Requirements',
        description: 'Conduct comprehensive prototype testing against designated mechanical, safety, and performance benchmarks.',
      },
      {
        step_number: 4,
        title: 'Test Documentation & Quality Logs',
        description: 'Compile testing records, calibration documents, and factory Scheme of Inspection and Testing (SIT).',
      },
      {
        step_number: 5,
        title: 'Conformity Assessment & BIS Application',
        description: 'Submit formal application through the BIS Manakonline portal with technical files and test reports.',
      },
      {
        step_number: 6,
        title: 'BIS Licensing & Ongoing Conformity',
        description: 'Complete factory audit, receive CM/L license, and maintain ongoing conformity inspection protocols.',
      },
    ],
    conformity_pathway_steps: [
      {
        step_number: 1,
        title: 'Determine Applicability',
        subtitle: 'Scope & Mandate Analysis',
        description: 'Assess product parameters, operating conditions, and applicable government Quality Control Orders (QCOs).',
        key_actions: [
          'Review technical scope and limitation clauses in the standard',
          'Check gazette notifications for mandatory enforcement dates',
          'Identify companion or parent reference standards',
        ],
      },
      {
        step_number: 2,
        title: 'Identify Applicable Requirements',
        subtitle: 'SIT & Clause Mapping',
        description: 'Acquire the official BIS standard copy and the Scheme of Inspection and Testing (SIT) guideline.',
        key_actions: [
          'Review mandatory factory testing instruments required',
          'Establish quality control parameters and acceptance criteria',
        ],
      },
      {
        step_number: 3,
        title: 'Conduct Required Testing',
        subtitle: 'In-House & Independent Testing',
        description: 'Execute internal verification tests and complete third-party type tests at a recognized laboratory.',
        key_actions: [
          'Perform in-house routine safety and performance checks',
          'Submit test samples to recognized laboratory for full type testing',
        ],
      },
      {
        step_number: 4,
        title: 'Prepare Documentation',
        subtitle: 'Dossier Assembly',
        description: 'Compile test certificates, factory floor layout, calibration certificates, and raw material test reports.',
        key_actions: [
          'Draft standard marking and packaging artwork',
          'Assemble raw material vendor compliance certificates',
        ],
      },
      {
        step_number: 5,
        title: 'Submit Through BIS Process',
        subtitle: 'Portal Submission & Audit',
        description: 'Submit application via Manakonline, undergo factory inspection by BIS officials, and submit drawn samples.',
        key_actions: [
          'File online application and pay prescribed government inspection fees',
          'Facilitate BIS officer on-site audit of manufacturing and lab facility',
        ],
      },
      {
        step_number: 6,
        title: 'Maintain Conformity',
        subtitle: 'License Renewal & Surveillance',
        description: 'Affix standard ISI mark, maintain daily test logs, and cooperate with periodic BIS surveillance checks.',
        key_actions: [
          'Maintain production batch logs in accordance with SIT',
          'Prepare for periodic market and factory sample draw verifications',
        ],
      },
    ],
    source_refs: baseStandard.source_refs || [MOCK_SOURCES.bisIS302],
  };
}

/** Normalizes diverse user URL inputs and returns Recognized Laboratories Data */
export function getLaboratoriesDataBySlug(slug: string): RecognizedLaboratoriesData {
  const decoded = decodeURIComponent(slug).trim();

  if (MOCK_RECOGNIZED_LABORATORIES_DATA[decoded]) {
    return MOCK_RECOGNIZED_LABORATORIES_DATA[decoded];
  }

  const normalized = decoded.toLowerCase().replace(/[^a-z0-9]/g, '');

  for (const [key, val] of Object.entries(MOCK_RECOGNIZED_LABORATORIES_DATA)) {
    const keyNorm = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normalized.includes(keyNorm) || keyNorm.includes(normalized)) {
      return val;
    }
  }

  // Fallback realistic generic laboratories
  const baseStandard = getStandardDetailsBySlug(slug);

  return {
    is_number: baseStandard.is_number,
    title: baseStandard.title,
    status: baseStandard.status,
    relevance: baseStandard.relevance,
    product_category: baseStandard.product_category || 'Industrial & Consumer Standards',
    laboratories: [
      {
        id: 'lab-gen-01',
        name: 'National Testing House (Regional Testing Facility)',
        lab_type: 'bis_central',
        type_label: 'Government Testing Facility',
        city: 'New Delhi / NCR',
        state: 'Delhi NCR',
        testing_capability: `Full type testing, physical verification, and safety assessment for standards under ${baseStandard.is_number}`,
        applicable_standards: [baseStandard.is_number, 'General Safety Series'],
        accreditation_indicator: 'BIS Recognized & NABL Accredited (ISO/IEC 17025)',
        lead_time_guidance: '15–25 working days typical turnaround',
        facilities_overview: [
          'Comprehensive environmental and safety test chambers',
          'High voltage and dielectric breakdown testing setup',
          'Mechanical stress and endurance testing bench',
        ],
        is_example_listing: true,
      },
      {
        id: 'lab-gen-02',
        name: 'BIS Regional Testing Laboratory',
        lab_type: 'bis_regional',
        type_label: 'Authoritative BIS Laboratory',
        city: 'Mumbai',
        state: 'Maharashtra',
        testing_capability: 'Official reference laboratory testing for statutory certification and licensing compliance',
        applicable_standards: [baseStandard.is_number],
        accreditation_indicator: 'Central BIS Laboratory Network',
        lead_time_guidance: 'Allocated via official BIS Manakonline licensing channel',
        facilities_overview: [
          'Statutory sample verification and dispute testing',
          'Calibrated measurement equipment with national metrology traceability',
          'Environmental conditioning and humidity testing rooms',
        ],
        is_example_listing: true,
      },
      {
        id: 'lab-gen-03',
        name: 'Accredited Industrial Testing & Certification Lab',
        lab_type: 'nabl_accredited',
        type_label: 'NABL Accredited Testing Facility',
        city: 'Bengaluru',
        state: 'Karnataka',
        testing_capability: 'Pre-compliance screening, third-party batch testing, and full clause type tests',
        applicable_standards: [baseStandard.is_number],
        accreditation_indicator: 'NABL Accredited (ISO/IEC 17025)',
        lead_time_guidance: '10–18 working days typical turnaround',
        facilities_overview: [
          'Rapid diagnostic pre-testing and technical advisory support',
          'Automated data acquisition for thermal and electrical parameters',
          'Non-destructive testing and material characterization',
        ],
        is_example_listing: true,
      },
    ],
    source_refs: baseStandard.source_refs || [MOCK_SOURCES.bisIS302],
  };
}
