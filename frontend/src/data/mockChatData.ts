import { ChatConversationData, StandardCardData, SourceRef, RecentConversation } from '@/types';

export const MOCK_SOURCES: Record<string, SourceRef> = {
  bisIS302: {
    source_id: 'src-bis-302',
    title: 'BIS Catalogue: IS 302 (Part 2/Sec 201) & IS 302 (Part 1)',
    reference_url: 'https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx',
    reliability_tier: 'primary',
    source_type: 'bis_standard',
    retrieved_at: '2026-08-15',
  },
  dpiitQco: {
    source_id: 'src-dpiit-qco',
    title: 'DPIIT Gazette Notice: Electrical Appliances Quality Control Order',
    reference_url: 'https://dpiit.gov.in/quality-control-orders',
    reliability_tier: 'primary',
    source_type: 'gov_portal',
    retrieved_at: '2026-08-20',
  },
  bisScheme1: {
    source_id: 'src-bis-scheme1',
    title: 'BIS Conformity Assessment Scheme-I (ISI Mark Guidelines)',
    reference_url: 'https://www.bis.gov.in/product-certification/conformity-assessment-scheme',
    reliability_tier: 'primary',
    source_type: 'bis_scheme',
    retrieved_at: '2026-08-10',
  },
};

export const MOCK_STANDARDS_ELECTRIC_HEATER: StandardCardData[] = [
  {
    is_number: 'IS 302 (Part 2/Sec 201)',
    title: 'Safety of Household and Similar Electrical Appliances — Part 2: Particular Requirements: Section 201: Electric Immersion Water Heaters',
    relevance: 'highly_relevant',
    status: 'active',
    why_applicable: 'Directly specifies safety, heating element protection, leakage current limits, and insulation resistance for electric immersion heaters.',
    source_refs: [MOCK_SOURCES.bisIS302],
    is_saved: false,
  },
  {
    is_number: 'IS 302 (Part 1): 2024',
    title: 'Safety of Household and Similar Electrical Appliances — General Requirements',
    relevance: 'highly_relevant',
    status: 'active',
    why_applicable: 'Mandatory base standard for all electrical household appliances, covering general construction, earthing, moisture resistance, and supply connection.',
    source_refs: [MOCK_SOURCES.bisIS302],
    is_saved: true,
  },
  {
    is_number: 'IS 1293: 2019',
    title: 'Plugs and Socket-Outlets of Rated Voltage up to and including 250 Volts and Rated Current up to and including 16 Amperes',
    relevance: 'relevant',
    status: 'active',
    why_applicable: 'Mandatory for the molded 3-pin plug top and power cord assembly attached to the heater appliance.',
    source_refs: [MOCK_SOURCES.bisIS302, MOCK_SOURCES.dpiitQco],
    is_saved: false,
  },
];

export const MOCK_DEFAULT_CONVERSATION: ChatConversationData = {
  id: 'electric-heater-standards',
  title: 'Electric Heater Standards',
  created_at: '2026-09-02T18:30:00Z',
  updated_at: 'Today',
  messages: [
    {
      id: 'msg-1',
      role: 'user',
      content: 'I want to manufacture an electric heater. Which Indian Standards apply?',
      created_at: '10:15 AM',
    },
    {
      id: 'msg-2',
      role: 'assistant',
      content: `For manufacturing electric heaters in India, BIS compliance is anchored in the **IS 302 series** for electrical appliance safety, alongside auxiliary standards for the supply cord and plug.

Here are the primary Indian Standards applicable to your product:`,
      standard_cards: MOCK_STANDARDS_ELECTRIC_HEATER,
      source_refs: [MOCK_SOURCES.bisIS302, MOCK_SOURCES.dpiitQco],
      uncertainty_notice: 'Specific test limits (e.g., dry-run protection vs water immersion depth) depend on whether your product is a portable immersion heater, geyser (storage water heater), or room convector. Verify exact sub-clauses against the designated standard before setting up production lines.',
      created_at: '10:15 AM',
    },
    {
      id: 'msg-3',
      role: 'user',
      content: 'Are these standards mandatory under a Quality Control Order (QCO), or is certification voluntary?',
      created_at: '10:17 AM',
    },
    {
      id: 'msg-4',
      role: 'assistant',
      content: `Under the **Electrical Appliances (Quality Control) Order** issued by the Ministry of Commerce & Industry (DPIIT), compliance with **IS 302 (Part 2/Sec 201)** and **IS 302 (Part 1)** is **MANDATORY**.

### Key Regulatory Takeaways for Manufacturers:
1. **Compulsory ISI Mark:** No person shall manufacture, import, distribute, or sell electric immersion heaters without the standard ISI mark under **BIS Scheme-I**.
2. **Factory Testing Setup:** You will need an in-house testing facility for routine tests (High Voltage withstand test, Insulation Resistance test, Earthing continuity test).
3. **Plugs & Cords:** The supply cord and plug must independently comply with **IS 1293** and bear the ISI mark.`,
      source_refs: [MOCK_SOURCES.dpiitQco, MOCK_SOURCES.bisScheme1],
      uncertainty_notice: 'Exemptions or extended compliance timelines may exist for specific micro/cottage enterprises under updated MSME notifications. Always check the official DPIIT gazette notification date.',
      created_at: '10:18 AM',
    },
  ],
};

export const MOCK_CONVERSATIONS_MAP: Record<string, ChatConversationData> = {
  'electric-heater-standards': MOCK_DEFAULT_CONVERSATION,
  'conv-101': MOCK_DEFAULT_CONVERSATION,

  'led-lamp-requirements': {
    id: 'led-lamp-requirements',
    title: 'LED Lamp Requirements',
    created_at: '2026-09-01T14:20:00Z',
    updated_at: 'Yesterday',
    messages: [
      {
        id: 'msg-led-1',
        role: 'user',
        content: 'What BIS standards are applicable to LED lamps?',
        created_at: '2:15 PM',
      },
      {
        id: 'msg-led-2',
        role: 'assistant',
        content: `Self-ballasted LED lamps for general lighting services are governed by **IS 16102 (Part 1)** for safety and **IS 16102 (Part 2)** for performance requirements.

### Key BIS Requirements for LED Lamps:
- **Compulsory Registration Scheme (CRS):** Covered under MeitY / BIS Compulsory Registration Order (CRO).
- **Mandatory Safety Tests:** Insulation resistance, electrical strength, mechanical strength of lamp caps, and resistance to heat and fire.`,
        standard_cards: [
          {
            is_number: 'IS 16102 (Part 1): 2012',
            title: 'Self-Ballasted LED Lamps for General Lighting Services — Part 1: Safety Requirements',
            relevance: 'highly_relevant',
            status: 'active',
            why_applicable: 'Mandatory standard under MeitY Compulsory Registration Scheme (CRS) for all self-ballasted LED lamps.',
            source_refs: [MOCK_SOURCES.bisScheme1],
            is_saved: false,
          },
          {
            is_number: 'IS 16102 (Part 2): 2012',
            title: 'Self-Ballasted LED Lamps for General Lighting Services — Part 2: Performance Requirements',
            relevance: 'relevant',
            status: 'active',
            why_applicable: 'Prescribes lumen maintenance, power factor (>= 0.9), efficacy, and color temperature tolerances.',
            source_refs: [MOCK_SOURCES.bisScheme1],
            is_saved: false,
          },
        ],
        source_refs: [MOCK_SOURCES.bisScheme1],
        uncertainty_notice: 'Check specific BEE (Bureau of Energy Efficiency) star rating mandates in addition to BIS safety certification.',
        created_at: '2:16 PM',
      },
    ],
  },
  'conv-102': {
    id: 'conv-102',
    title: 'LED Lamp Requirements',
    created_at: '2026-09-01T14:20:00Z',
    updated_at: 'Yesterday',
    messages: [
      {
        id: 'msg-led-1',
        role: 'user',
        content: 'What BIS standards are applicable to LED lamps?',
        created_at: '2:15 PM',
      },
      {
        id: 'msg-led-2',
        role: 'assistant',
        content: `Self-ballasted LED lamps for general lighting services are governed by **IS 16102 (Part 1)** for safety and **IS 16102 (Part 2)** for performance requirements.`,
        source_refs: [MOCK_SOURCES.bisScheme1],
        created_at: '2:16 PM',
      },
    ],
  },

  'plugs-and-socket-outlets': {
    id: 'plugs-and-socket-outlets',
    title: 'Plugs and Socket-Outlets',
    created_at: '2026-08-30T11:00:00Z',
    updated_at: '3 days ago',
    messages: [
      {
        id: 'msg-plug-1',
        role: 'user',
        content: 'Which standard covers domestic plugs and socket-outlets?',
        created_at: '11:00 AM',
      },
      {
        id: 'msg-plug-2',
        role: 'assistant',
        content: `In India, domestic plugs and socket-outlets of rated voltage up to 250V and current up to 16A are governed by **IS 1293: 2019**.

### Essential Compliance Points:
- **Mandatory Quality Control Order:** ISI mark is legally mandatory on all 6A, 16A, and 2.5A plugs and sockets.
- **Key Safety Features:** Mandatory insulated pin sleeves on live and neutral pins to prevent accidental finger contact during insertion.`,
        standard_cards: [
          {
            is_number: 'IS 1293: 2019',
            title: 'Plugs and Socket-Outlets of Rated Voltage up to and including 250 Volts and Rated Current up to and including 16 Amperes',
            relevance: 'highly_relevant',
            status: 'active',
            why_applicable: 'Mandatory standard governing dimensional tolerances, pin insulation, and temperature rise for all Indian domestic plugs.',
            source_refs: [MOCK_SOURCES.bisIS302, MOCK_SOURCES.dpiitQco],
            is_saved: true,
          },
        ],
        source_refs: [MOCK_SOURCES.bisIS302, MOCK_SOURCES.dpiitQco],
        created_at: '11:01 AM',
      },
    ],
  },
  'conv-103': {
    id: 'conv-103',
    title: 'Plugs and Socket-Outlets',
    created_at: '2026-08-30T11:00:00Z',
    updated_at: '3 days ago',
    messages: [
      {
        id: 'msg-plug-1',
        role: 'user',
        content: 'Which standard covers domestic plugs and socket-outlets?',
        created_at: '11:00 AM',
      },
      {
        id: 'msg-plug-2',
        role: 'assistant',
        content: `Domestic plugs and socket-outlets are governed by **IS 1293: 2019**.`,
        source_refs: [MOCK_SOURCES.bisIS302],
        created_at: '11:01 AM',
      },
    ],
  },

  'lithium-battery-standards': {
    id: 'lithium-battery-standards',
    title: 'Lithium Battery Standards',
    created_at: '2026-08-29T16:45:00Z',
    updated_at: '4 days ago',
    messages: [
      {
        id: 'msg-bat-1',
        role: 'user',
        content: 'What Indian Standards should I consider for lithium battery packs?',
        created_at: '4:45 PM',
      },
      {
        id: 'msg-bat-2',
        role: 'assistant',
        content: `Portable lithium cells and battery packs are regulated under **IS 16046 (Part 2): 2018** (equivalent to IEC 62133-2).

### Key Highlights:
- **MeitY CRS Scheme:** Requires registration with BIS before import or commercial assembly.
- **Critical Tests:** Continuous charging, external short circuit, mechanical crush, and thermal abuse.`,
        standard_cards: [
          {
            is_number: 'IS 16046 (Part 2): 2018',
            title: 'Secondary Cells and Batteries Containing Alkaline or Other Non-Acid Electrolytes — Safety Requirements (Lithium Systems)',
            relevance: 'highly_relevant',
            status: 'active',
            why_applicable: 'Mandatory standard for portable lithium-ion and lithium-polymer cells and battery packs.',
            source_refs: [MOCK_SOURCES.bisScheme1],
            is_saved: false,
          },
        ],
        source_refs: [MOCK_SOURCES.bisScheme1],
        created_at: '4:46 PM',
      },
    ],
  },
  'conv-104': {
    id: 'conv-104',
    title: 'Lithium Battery Standards',
    created_at: '2026-08-29T16:45:00Z',
    updated_at: '4 days ago',
    messages: [
      {
        id: 'msg-bat-1',
        role: 'user',
        content: 'What Indian Standards should I consider for lithium battery packs?',
        created_at: '4:45 PM',
      },
      {
        id: 'msg-bat-2',
        role: 'assistant',
        content: `Portable lithium cells and battery packs are regulated under **IS 16046 (Part 2): 2018**.`,
        source_refs: [MOCK_SOURCES.bisScheme1],
        created_at: '4:46 PM',
      },
    ],
  },

  'electrical-appliance-certification': {
    id: 'electrical-appliance-certification',
    title: 'Electrical Appliance Certification',
    created_at: '2026-08-26T09:30:00Z',
    updated_at: '1 week ago',
    messages: [
      {
        id: 'msg-cert-1',
        role: 'user',
        content: 'Can you explain the BIS certification requirements for my product?',
        created_at: '9:30 AM',
      },
      {
        id: 'msg-cert-2',
        role: 'assistant',
        content: `BIS certification for domestic electrical appliances generally follows **Scheme-I (Product Certification / ISI Mark)**:

1. **In-house Testing Laboratory:** Manufacturer must set up mandatory factory testing equipment.
2. **Factory Inspection:** A designated BIS technical officer conducts an on-site audit.
3. **Independent Sample Drawing:** Samples are drawn during the audit and tested at a recognized BIS laboratory.
4. **Grant of License (CM/L):** Once reports confirm conformity, a 7-8 digit CM/L license number is issued.`,
        source_refs: [MOCK_SOURCES.bisScheme1],
        created_at: '9:31 AM',
      },
    ],
  },
  'conv-105': {
    id: 'conv-105',
    title: 'Electrical Appliance Certification',
    created_at: '2026-08-26T09:30:00Z',
    updated_at: '1 week ago',
    messages: [
      {
        id: 'msg-cert-1',
        role: 'user',
        content: 'Can you explain the BIS certification requirements for my product?',
        created_at: '9:30 AM',
      },
      {
        id: 'msg-cert-2',
        role: 'assistant',
        content: `BIS certification for domestic electrical appliances follows **Scheme-I (Product Certification / ISI Mark)**.`,
        source_refs: [MOCK_SOURCES.bisScheme1],
        created_at: '9:31 AM',
      },
    ],
  },

  'understanding-is-302': {
    id: 'understanding-is-302',
    title: 'Understanding IS 302',
    created_at: '2026-08-19T10:00:00Z',
    updated_at: '2 weeks ago',
    messages: [
      {
        id: 'msg-302-1',
        role: 'user',
        content: 'What is the scope of IS 302 for household electrical appliances?',
        created_at: '10:00 AM',
      },
      {
        id: 'msg-302-2',
        role: 'assistant',
        content: `**IS 302** is India's principal standard series for the safety of household and similar electrical appliances:

- **IS 302 (Part 1):** General baseline safety requirements applicable to all electrical appliances.
- **IS 302 (Part 2 Series):** Particular requirements for specific appliances (e.g., Section 201 for immersion heaters, Section 21 for storage water heaters, Section 3 for irons).`,
        standard_cards: [
          {
            is_number: 'IS 302 (Part 1): 2024',
            title: 'Safety of Household and Similar Electrical Appliances — Part 1: General Requirements',
            relevance: 'highly_relevant',
            status: 'active',
            why_applicable: 'Mandatory horizontal baseline safety standard.',
            source_refs: [MOCK_SOURCES.bisIS302],
            is_saved: true,
          },
        ],
        source_refs: [MOCK_SOURCES.bisIS302],
        created_at: '10:01 AM',
      },
    ],
  },
  'conv-106': {
    id: 'conv-106',
    title: 'Understanding IS 302',
    created_at: '2026-08-19T10:00:00Z',
    updated_at: '2 weeks ago',
    messages: [
      {
        id: 'msg-302-1',
        role: 'user',
        content: 'What is the scope of IS 302 for household electrical appliances?',
        created_at: '10:00 AM',
      },
      {
        id: 'msg-302-2',
        role: 'assistant',
        content: `**IS 302** is India's principal standard series for household appliance safety.`,
        source_refs: [MOCK_SOURCES.bisIS302],
        created_at: '10:01 AM',
      },
    ],
  },
};

export const MOCK_CHAT_HISTORY_LIST: RecentConversation[] = [
  {
    id: 'electric-heater-standards',
    title: 'Electric Heater Standards',
    preview: 'I want to manufacture an electric heater. Which Indian Standards apply?',
    updated_at: 'Today',
    message_count: 4,
    time_bucket: 'today',
  },
  {
    id: 'led-lamp-requirements',
    title: 'LED Lamp Requirements',
    preview: 'What BIS standards are applicable to LED lamps?',
    updated_at: 'Yesterday',
    message_count: 2,
    time_bucket: 'this_week',
  },
  {
    id: 'plugs-and-socket-outlets',
    title: 'Plugs and Socket-Outlets',
    preview: 'Which standard covers domestic plugs and socket-outlets?',
    updated_at: '3 days ago',
    message_count: 2,
    time_bucket: 'this_week',
  },
  {
    id: 'lithium-battery-standards',
    title: 'Lithium Battery Standards',
    preview: 'What Indian Standards should I consider for lithium battery packs?',
    updated_at: '4 days ago',
    message_count: 2,
    time_bucket: 'this_week',
  },
  {
    id: 'electrical-appliance-certification',
    title: 'Electrical Appliance Certification',
    preview: 'Can you explain the BIS certification requirements for my product?',
    updated_at: '1 week ago',
    message_count: 2,
    time_bucket: 'older',
  },
  {
    id: 'understanding-is-302',
    title: 'Understanding IS 302',
    preview: 'What is the scope of IS 302 for household electrical appliances?',
    updated_at: '2 weeks ago',
    message_count: 2,
    time_bucket: 'older',
  },
];

export function getChatConversationById(id: string): ChatConversationData {
  if (MOCK_CONVERSATIONS_MAP[id]) {
    return MOCK_CONVERSATIONS_MAP[id];
  }

  // Fallback
  return {
    id,
    title: 'BIS Standards Inquiry',
    created_at: '2026-09-02T18:30:00Z',
    updated_at: 'Recently',
    messages: [
      {
        id: 'msg-f1',
        role: 'user',
        content: 'How do I identify applicable Indian Standards for my product?',
        created_at: '10:00 AM',
      },
      {
        id: 'msg-f2',
        role: 'assistant',
        content: 'You can search by product name, standard number, or HS Code in the Find Standards tool, or ask specific technical questions here.',
        source_refs: [MOCK_SOURCES.bisIS302],
        created_at: '10:01 AM',
      },
    ],
  };
}
