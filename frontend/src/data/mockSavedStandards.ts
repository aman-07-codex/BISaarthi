import { StandardCardData } from '@/types';
import { MOCK_SOURCES } from './mockChatData';

export const MOCK_INITIAL_SAVED_STANDARDS: StandardCardData[] = [
  {
    is_number: 'IS 302 (Part 2/Sec 201)',
    title: 'Safety of Household and Similar Electrical Appliances — Part 2: Particular Requirements: Section 201: Electric Immersion Water Heaters',
    status: 'active',
    relevance: 'highly_relevant',
    why_applicable: 'Directly applicable to electric heating elements and immersion water heaters. Mandates leakage current thresholds, earthing, moisture resistance, and dry-run protection.',
    source_refs: [MOCK_SOURCES.bisIS302, MOCK_SOURCES.dpiitQco],
    is_saved: true,
  },
  {
    is_number: 'IS 302 (Part 1): 2024',
    title: 'Safety of Household and Similar Electrical Appliances — Part 1: General Requirements',
    status: 'active',
    relevance: 'highly_relevant',
    why_applicable: 'Compulsory base standard for all electrical household appliances, regulating general construction, electrical insulation, mechanical hazard protection, and internal wiring.',
    source_refs: [MOCK_SOURCES.bisIS302],
    is_saved: true,
  },
  {
    is_number: 'IS 1293: 2019',
    title: 'Plugs and Socket-Outlets of Rated Voltage up to and including 250 Volts and Rated Current up to and including 16 Amperes',
    status: 'active',
    relevance: 'relevant',
    why_applicable: 'Mandatory for the molded 3-pin power plug top and supply cord assembly attached to the heater. Covered under compulsory Quality Control Order.',
    source_refs: [MOCK_SOURCES.bisIS302, MOCK_SOURCES.dpiitQco],
    is_saved: true,
  },
  {
    is_number: 'IS 368: 2014',
    title: 'Electric Immersion Water Heaters — Specification for Performance',
    status: 'active',
    relevance: 'possibly_relevant',
    why_applicable: 'Evaluates heating efficiency, thermal standing loss, heating-up duration, and sheath corrosion resistance under standard test water conditions.',
    source_refs: [MOCK_SOURCES.bisIS302],
    is_saved: true,
  },
];
