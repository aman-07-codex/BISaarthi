import { StandardCardData, SourceRef } from '@/types';
import { MOCK_SOURCES } from './mockChatData';

export const MOCK_FIND_STANDARDS_ELECTRIC_HEATER: StandardCardData[] = [
  {
    is_number: 'IS 302 (Part 2/Sec 201)',
    title: 'Safety of Household and Similar Electrical Appliances — Part 2: Particular Requirements: Section 201: Electric Immersion Water Heaters',
    relevance: 'highly_relevant',
    status: 'active',
    why_applicable: 'Directly applicable to electric heating elements and immersion water heaters. Mandates leakage current thresholds, earthing, moisture resistance, and dry-run protection.',
    source_refs: [MOCK_SOURCES.bisIS302, MOCK_SOURCES.dpiitQco],
    is_saved: false,
  },
  {
    is_number: 'IS 302 (Part 1): 2024',
    title: 'Safety of Household and Similar Electrical Appliances — General Requirements',
    relevance: 'highly_relevant',
    status: 'active',
    why_applicable: 'Compulsory base standard for all electrical household appliances, regulating general construction, electrical insulation, mechanical hazard protection, and internal wiring.',
    source_refs: [MOCK_SOURCES.bisIS302],
    is_saved: true,
  },
  {
    is_number: 'IS 1293: 2019',
    title: 'Plugs and Socket-Outlets of Rated Voltage up to and including 250 Volts and Rated Current up to and including 16 Amperes',
    relevance: 'relevant',
    status: 'active',
    why_applicable: 'Mandatory for the molded 3-pin power plug top and supply cord assembly attached to the heater. Covered under compulsory Quality Control Order.',
    source_refs: [MOCK_SOURCES.bisIS302, MOCK_SOURCES.dpiitQco],
    is_saved: false,
  },
  {
    is_number: 'IS 368: 2014',
    title: 'Electric Immersion Water Heaters — Specification for Performance',
    relevance: 'possibly_relevant',
    status: 'active',
    why_applicable: 'Evaluates heating efficiency, thermal standing loss, heating-up duration, and sheath corrosion resistance under standard test water conditions.',
    source_refs: [MOCK_SOURCES.bisIS302],
    is_saved: false,
  },
];

export const MOCK_FIND_STANDARDS_LED: StandardCardData[] = [
  {
    is_number: 'IS 16102 (Part 1): 2012',
    title: 'Self-Ballasted LED Lamps for General Lighting Services — Part 1: Safety Requirements',
    relevance: 'highly_relevant',
    status: 'active',
    why_applicable: 'Mandatory standard under MeitY Compulsory Registration Scheme (CRS). Governs electric shock protection, insulation resistance, and mechanical strength of lamp caps.',
    source_refs: [MOCK_SOURCES.bisScheme1],
    is_saved: false,
  },
  {
    is_number: 'IS 16102 (Part 2): 2012',
    title: 'Self-Ballasted LED Lamps for General Lighting Services — Part 2: Performance Requirements',
    relevance: 'relevant',
    status: 'active',
    why_applicable: 'Prescribes initial luminous flux, lumen maintenance at 2,000h and 6,000h, wattage rating limits, and power factor (> 0.90).',
    source_refs: [MOCK_SOURCES.bisScheme1],
    is_saved: false,
  },
  {
    is_number: 'IS 15885 (Part 2/Sec 13)',
    title: 'Lamp Controlgear — Part 2: Particular Requirements: Section 13: D.C. or A.C. Supplied Electronic Controlgear for LED Modules',
    relevance: 'possibly_relevant',
    status: 'active',
    why_applicable: 'Applies to the internal electronic LED driver/ballast circuit board for protection against thermal overload and short-circuit conditions.',
    source_refs: [MOCK_SOURCES.bisIS302],
    is_saved: false,
  },
];

export const MOCK_FIND_STANDARDS_BATTERY: StandardCardData[] = [
  {
    is_number: 'IS 16046 (Part 2): 2018',
    title: 'Secondary Cells and Batteries Containing Alkaline or Other Non-Acid Electrolytes — Safety Requirements for Portable Sealed Secondary Cells (Lithium Systems)',
    relevance: 'highly_relevant',
    status: 'active',
    why_applicable: 'Mandatory under CRO for lithium-ion battery packs and portable power banks. Specifies continuous charging safety, external short circuit, and mechanical crush testing.',
    source_refs: [MOCK_SOURCES.bisScheme1],
    is_saved: false,
  },
  {
    is_number: 'IS 16047: 2018',
    title: 'Secondary Cells and Batteries for the Propulsion of Electric Road Vehicles — Part 1: Performance Testing',
    relevance: 'relevant',
    status: 'active',
    why_applicable: 'Applies specifically if the lithium battery pack is designed for electric two-wheelers, three-wheelers, or automotive EV powertrains.',
    source_refs: [MOCK_SOURCES.bisIS302],
    is_saved: false,
  },
];
