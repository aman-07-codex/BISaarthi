# BISaarthi — Phase 3A: Official BIS Document Acquisition Reconnaissance

## 1. Executive Summary & Objective

The objective of **Phase 3A** is to determine the legitimate, technically supported mechanism for acquiring official Bureau of Indian Standards (BIS) standard documents for the approved 100-standard MVP corpus (`backend/docs/bis_mvp_corpus_manifest.json`).

> [!IMPORTANT]
> **Strict Security & Legal Policy**:
> - **No PDFs or document bodies were downloaded** during this reconnaissance phase.
> - **No authentication, CAPTCHA, authorization, or rate-limiting protections were circumvented**.
> - **No third-party mirrors, scraped repositories, or unofficial mirrors were used**.
> - All findings reflect verified official Bureau of Indian Standards (BIS) API and portal behaviors.

## 2. Aggregated Summary Metrics

- **Total Standards Assessed**: 100
- **PUBLIC_AUTOMATABLE**: 0
- **PUBLIC_MANUAL**: 0
- **AUTHENTICATED**: 0
- **PAID_OR_LICENSED**: 0
- **NOT_EXPOSED**: 100
- **UNKNOWN**: 0
- **Official Document References Discovered (Public REST)**: 0
- **Public Automated Acquisition Candidates**: 0
- **Manual / Portal Acquisition Candidates**: 100
- **Standards Requiring Authentication (Portal)**: 100
- **Standards Subject to Official Licensing / Purchasing**: 100

## 3. Category Breakdown

| Category | Total | PUBLIC_AUTOMATABLE | AUTHENTICATED / NOT_EXPOSED | Manual Portal |
| -------- | ----- | ------------------ | --------------------------- | ------------- |
| Electrical Appliances & Accessories | 21 | 0 | 21 | 21 |
| Construction, Cement & Concrete | 21 | 0 | 21 | 21 |
| Food, Drinking Water & Food-Contact Products | 20 | 0 | 20 | 20 |
| Steel, Metals & Industrial Materials | 19 | 0 | 19 | 19 |
| Plastics, Packaging & Consumer Materials | 19 | 0 | 19 | 19 |

## 4. Technical Architecture & Access Analysis

### 4.1 Official BIS Public API Capabilities
1. **Public Standards Catalogue API (`proposal-service/getWebsiteIndianStandardsList`)**:
   - Exposes authoritative metadata: `standardId`, `standardEncId`, `standardNumber`, `standardName`, publication date, technical department, and sectional committee.
   - Does **not** expose unauthenticated direct full-text PDF URLs in the public JSON response payload.

2. **Official BIS Standards Details API (`proposal-service/getStandardsWithDeptAndCommittee`)**:
   - Exposes department/committee linkage and session review identifiers (`reviewId`).
   - Does **not** provide open binary PDF streams to unauthenticated callers.

3. **Official Portal Infrastructure (`standards.bis.gov.in` / `standardsbis.bsbedge.com`)**:
   - Access to complete official Indian Standard specifications requires legitimate user authentication (Manakonline / BSB Edge account credentials) and compliance with official BIS licensing terms.

### 4.2 Acquisition Feasibility Conclusion
- **Public Automated Acquisition**: Not feasible without unauthorized bypass of BIS access controls.
- **Legitimate Acquisition Model**: Official portal acquisition (manual download with authorized credentials) or pre-acquired licensed repository ingestion in Phase 3B.

## 5. Standard Acquisition Assessment Inventory

| IS Number | Title | Access Type | Acquisition Method | Category | Evidence | Confidence |
| --------- | ----- | ----------- | ------------------ | -------- | -------- | ---------- |
| IS 2082:2018 | Stationary storage type electric water heaters - Spe... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 302 (Part 1):2024 | Household and Similar Electrical Appliances â€" Saf... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 302 (Part 2/Sec 3):2024 | Household and Similar Electrical Appliances â€"Safe... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 302 (Part 2/Sec 16):2026 | Household and Similar Electrical Appliances - Safety... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 302 (Part 2/Sec 26):2026 | Household and Similar Electrical Appliances -- Safet... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 302 (Part 2/Sec 36):2026 | Household and Similar Electrical Appliances - Safety... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 369:2019 | Household electric direct - Acting room heaters - Pe... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 374:2019 | Specification for electric ceiling type fans and reg... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 555:1979 | Specification for electric table type fans and regul... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 2312:1967 | Specification for propeller type AC ventilating fans... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 694:2010 | Polyvinyl chloride insulated unsheathed and sheathed... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 1293:2019 | Plugs and Socket-Outlets for Household and Similar P... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 3854:2023 | Switches for Domestic and Similar Purposes - Specifi... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 12640 (Part 1):2024 | Residual current operated circuitBreakers without in... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS/IEC 60898 (Part 1):2015 | Electrical accessories - Circuit - Breakers for over... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 1554 (Part 1):1988 | Specification for PVC insulated (Heavy Duty) electri... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 16102 (Part 1):2026 | Self-Ballasted LED Lamps for General Lighting Servic... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 15885 (Part 1):2011 | Safety of lamp controlgear: Part 1 general requirements | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 15885 (Part 2/Sec 13):2012 | Safety of lamp controlgear: Part 2 particular requir... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 13252 (Part 22):2019 | Information Technology Equipment - Safety Part 22: E... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 398 (Part 2):2025 | Aluminium Conductor for Overhead Transmission Purpos... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 269:2015 | Ordinary portland cement - Specification (Sixth Revi... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 1489 (Part 1)  : 2015 | Portland Pozzolana Cement - Specification: Part 1 fl... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 1489 (Part 2):2015 | Portland Pozzolana Cement - Specification: Part 2 Ca... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 455:2015 | Portland slag cement - Specification (fifth revision) | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 456:2000 | Plain and reinforced concrete - Code of practice (Fo... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 10262:2019 | Concrete Mix Proportioning - Guidelines ( Second Rev... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 383:2016 | Coarse and Fine Aggregate for Concrete - Specificati... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 516 (Part 1/Sec 1):2021 | Hardened concrete - Methods of test: Part 1 Testing ... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 1199 (Part 2):2018 | Fresh Concrete - Methods of Sampling, Testing and An... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 1786:2008 | High Strength Deformed Steel Bars and Wires for Conc... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 1077:2025 | Common Burnt Clay Building Bricks - Specification (S... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 2185 (Part 1):2005 | Concrete masonry units - Specification: Part 1 hollo... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 2185 (Part 3):1984 | Concrete Masonry Units Part 3 Autoclaved Cellular Ae... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 4926:2003 | Ready - Mixed Concrete - Code of Practice (Second Re... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 3495 (Part 1):2019 | Burnt Clay Building Bricks â€" Methods of Tests Par... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 9103:1999 | Concrete Admixtures -Specification (First Revision) | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 1237:2012 | Cement Concrete Flooring Tiles - Specification (Seco... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| Is 15658:2021 | Concrete Paving Blocks - Specification ( First Revis... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 2542 (Part 1/Sec 1):2023 | Gypsum Plaster, Concrete and Products - Methods of T... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 4031 (Part 1):1996 | Methods of Physical Tests for Hydraulic Cement: Part... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 13920:2016 | Ductile Design and Detailing of Reinforced Concrete ... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 14543:2024 | Packaged Drinking Water Other than Packaged Natural ... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 13428:2024 | PACKAGED NATURAL MINERAL WATER - SPECIFICATION Third... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 10500:2012 | Drinking Water - Specification (Second Revision) | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 15410:2025 | PLASTIC BOTTLES/CONTAINERS FOR PACKAGING OF NATURAL ... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 10146:1982 | Specification for polyethylene for its safe use in c... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 10151:2019 | Polyvinyl chloride (pvc) and its copolymers for its ... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 10910:1984 | Specification for polypropylene and its copolymers f... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 12252:2017 | Polyalkylene terephthalates (pet and pbt), their cop... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 15609:2005 | Polyethylene flexible pouches for the packing of nat... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 1158:1973 | Specification for corn flakes (First Revision) | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 1165:2022 | Whole Milk Powder - Specification ( Sixth Revision ) | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 1166:2022 | SWEETENED CONDENSED MILK, SWEETENED CONDENSED PARTLY... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 13688:2020 | Packaged Pasteurized Milk â€" Specification ( Secon... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| Is 1656:2022 | MILK-CEREAL BASED COMPLEMENTARY FOODS SPECIFICATION ... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 15757:2022 | FOLLOW-UP FORMULA-COMPLEMENTARY FOODS - SPECIFICATIO... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 10325:2026 | Square tins of 15 kg or 15 litre capacity for ghee, ... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 5887 (Part 8/Sec 1):2023 | Methods for detection of bacteria responsible for fo... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 16068:2013 | Microbiology of food and animal feeding stuffs - Hor... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 10142:2025 | POLYSTYRENE CRYSTAL AND HIGH IMPACT FOR ITS SAFE USE... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 15888:2010 | Guideline for the conduct of food safety assessment ... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 2062 (Part 1):2025 | Structural Steel - Part 1 - Hot Rolled Medium and Hi... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 2062 (Part 2):2026 | Structural Steel - Part 2 - Hot Rolled Quenched and ... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 1239 (Part 1):2004 | Steel Tubes, Tubulars and Other Wrought Steel Fittin... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 1239 (Part 2):2011 | Steel tubes, tubulars and other steel fittings - Spe... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 1161:2014 | Steel tubes for structural purposes - Specification ... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 3601:2006 | Steel tubes for mechanical and general engineering p... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 1079:2017 | Hot rolled carbon steel sheet, plate and strip - Spe... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 513 (Part 1):2016 | Cold reduced carbon steel sheet and strip: Part 1 co... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 14246:2024 | CONTINUOUSLY PRE-PAINTED GALVANIZED STEEL SHEETS AND... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 2265:2026 | Specification for galvanized steel wire strand for s... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 19068:2025 | Continuous hot-dip galvanized steel bars for concret... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 733:2025 | Wrought Aluminium and Aluminium Alloy Bars, Rods, Se... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 410:1977 | Specification for cold rolled brass sheet, strip and... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 1608 (Part 1):2022 | Metallic materials - Tensile testing - Part 1 : Meth... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 1501 (Part 1):2025 | Metallic materials Vickers hardness test Part 1: Tes... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 1757 (Part 1):2020 | Metallic Materials - Charpy Pendulum Impact Test Par... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 3748:2022 | Tool Steels - Specification | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 14894:2023 | Fasteners ï¿1⁄2 Hexagon head bolts of product grade... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 3745:2024 | Yoke Type Medical Cylinder Valve with Pin Index Conn... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 4984:2016 | Polyethylene Pipes for Water Supply - Specification ... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 4985:2021 | Unplasticized PVC Pipes for Potable Water Supplies -... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 12701:1996 | Rotational moulded polyethylene water storage tanks ... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 2798:1998 | Methods of test for plastics containers (First Revis... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 6312:1994 | Polyethylene containers for the transport of materia... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 7803 (Part 1):1975 | Specification for plastic containers for pharmaceuti... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 2771 (Part 1):2022 | CORRUGATED FIBREBOARD BOXES- SPECIFICATION PART 1 GE... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 15351:2015 | Agro textiles - Laminated high density polyethylene ... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 12818:2010 | Unplasticized Polyvinyl Chloride (PVC-U) Screen and ... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 13592:2013 | Unplasticized Polyvinyl Chloride (PVC-U) Pipes for S... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 15778:2007 | Chlorinated Polyvinyl Chloride (CPVC) Pipes for Pota... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 14887:2014 | Textiles - High density polyethylene (HDPE)/polyprop... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 1708 (Part 1):1986 | Determination of moisture content (See IS 1708: PART... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 303:2024 | IS 303: 2024 Plywood for General Purposes - Specific... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 16654:2017 | Geosynthetics - Polypropylene multifilament woven ge... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 5557 (Part 1):2024 | All Rubber Gum Boots and Ankle Boots Part 1 Safety a... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 6944:2026 | Medical Laboratory Glassware - Bijou Bacteriological... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 12933 (Part 2):2025 | Solar Flat Plate Collector - Specification Part 2 Co... | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |
| IS 17862:2026 | E-Waste Management - Guidelines ( First Revision ) | `not_exposed` | `official_portal_manual` | `NOT_EXPOSED` | verified_api_behavior | high |

## 6. Recommendations for Phase 3B (Controlled Acquisition)

1. **Controlled Ingestion Directory**: Establish a local acquisition repository (e.g. `backend/data/corpus_documents/`) for verified, legitimately obtained official BIS PDFs.
2. **Manifest Alignment**: Map every acquired PDF against its exact `is_number` and `standard_id` in `bis_document_manifest.json` before ingestion.
3. **Zero Third-Party Compromise**: Reject unverified third-party mirror downloads.
