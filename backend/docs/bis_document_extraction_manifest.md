# BISaarthi — Phase 4A: Official BIS Document Extraction Manifest

## 1. Executive Summary

This manifest tracks the local page-level text extraction, structural validation, and quality assessment status for the 100-standard BISaarthi MVP corpus (`backend/docs/bis_mvp_corpus_manifest.json`).

> [!IMPORTANT]
> **Strict Offline Execution & Boundaries**:
> - Extraction runs **100% offline** on local verified PDFs without network requests or external API calls.
> - Input is restricted strictly to `backend/data/bis_documents/verified/`.
> - With 0 verified PDFs currently in production, the manifest accurately represents 100 standards in state `not_extracted` without fabricated data.

## 2. Extraction Summary Metrics

- **Total Standards Tracked**: 100
- **Successfully Extracted**: 0
- **Pending Acquisition / Not Extracted**: 100
- **Extraction Failures**: 0
- **Manual Review Required**: 0
- **Good Quality Extractions**: 0
- **Scanned / Requires OCR**: 0
- **Total Pages Extracted**: 0
- **Total Characters Extracted**: 0

## 3. Category Breakdown

| Category | Total Standards | Extracted | Not Extracted | Manual Review |
| -------- | --------------- | --------- | ------------- | ------------- |
| Electrical Appliances & Accessories | 21 | 0 | 21 | 0 |
| Construction, Cement & Concrete | 21 | 0 | 21 | 0 |
| Food, Drinking Water & Food-Contact Products | 20 | 0 | 20 | 0 |
| Steel, Metals & Industrial Materials | 19 | 0 | 19 | 0 |
| Plastics, Packaging & Consumer Materials | 19 | 0 | 19 | 0 |

## 4. Document Extraction Inventory

| IS Number | Title | Extraction Status | Quality | Pages | Characters | Output Path |
| --------- | ----- | ----------------- | ------- | ----- | ---------- | ----------- |
| IS 2082:2018 | Stationary storage type electric water hea... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 302 (Part 1):2024 | Household and Similar Electrical Appliance... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 302 (Part 2/Sec 3):2024 | Household and Similar Electrical Appliance... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 302 (Part 2/Sec 16):2026 | Household and Similar Electrical Appliance... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 302 (Part 2/Sec 26):2026 | Household and Similar Electrical Appliance... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 302 (Part 2/Sec 36):2026 | Household and Similar Electrical Appliance... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 369:2019 | Household electric direct - Acting room he... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 374:2019 | Specification for electric ceiling type fa... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 555:1979 | Specification for electric table type fans... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 2312:1967 | Specification for propeller type AC ventil... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 694:2010 | Polyvinyl chloride insulated unsheathed an... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 1293:2019 | Plugs and Socket-Outlets for Household and... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 3854:2023 | Switches for Domestic and Similar Purposes... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 12640 (Part 1):2024 | Residual current operated circuitBreakers ... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS/IEC 60898 (Part 1):2015 | Electrical accessories - Circuit - Breaker... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 1554 (Part 1):1988 | Specification for PVC insulated (Heavy Dut... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 16102 (Part 1):2026 | Self-Ballasted LED Lamps for General Light... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 15885 (Part 1):2011 | Safety of lamp controlgear: Part 1 general... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 15885 (Part 2/Sec 13):2012 | Safety of lamp controlgear: Part 2 particu... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 13252 (Part 22):2019 | Information Technology Equipment - Safety ... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 398 (Part 2):2025 | Aluminium Conductor for Overhead Transmiss... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 269:2015 | Ordinary portland cement - Specification (... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 1489 (Part 1)  : 2015 | Portland Pozzolana Cement - Specification:... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 1489 (Part 2):2015 | Portland Pozzolana Cement - Specification:... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 455:2015 | Portland slag cement - Specification (fift... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 456:2000 | Plain and reinforced concrete - Code of pr... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 10262:2019 | Concrete Mix Proportioning - Guidelines ( ... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 383:2016 | Coarse and Fine Aggregate for Concrete - S... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 516 (Part 1/Sec 1):2021 | Hardened concrete - Methods of test: Part ... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 1199 (Part 2):2018 | Fresh Concrete - Methods of Sampling, Test... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 1786:2008 | High Strength Deformed Steel Bars and Wire... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 1077:2025 | Common Burnt Clay Building Bricks - Specif... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 2185 (Part 1):2005 | Concrete masonry units - Specification: Pa... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 2185 (Part 3):1984 | Concrete Masonry Units Part 3 Autoclaved C... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 4926:2003 | Ready - Mixed Concrete - Code of Practice ... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 3495 (Part 1):2019 | Burnt Clay Building Bricks â€" Methods of... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 9103:1999 | Concrete Admixtures -Specification (First ... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 1237:2012 | Cement Concrete Flooring Tiles - Specifica... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| Is 15658:2021 | Concrete Paving Blocks - Specification ( F... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 2542 (Part 1/Sec 1):2023 | Gypsum Plaster, Concrete and Products - Me... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 4031 (Part 1):1996 | Methods of Physical Tests for Hydraulic Ce... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 13920:2016 | Ductile Design and Detailing of Reinforced... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 14543:2024 | Packaged Drinking Water Other than Package... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 13428:2024 | PACKAGED NATURAL MINERAL WATER - SPECIFICA... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 10500:2012 | Drinking Water - Specification (Second Rev... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 15410:2025 | PLASTIC BOTTLES/CONTAINERS FOR PACKAGING O... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 10146:1982 | Specification for polyethylene for its saf... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 10151:2019 | Polyvinyl chloride (pvc) and its copolymer... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 10910:1984 | Specification for polypropylene and its co... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 12252:2017 | Polyalkylene terephthalates (pet and pbt),... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 15609:2005 | Polyethylene flexible pouches for the pack... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 1158:1973 | Specification for corn flakes (First Revis... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 1165:2022 | Whole Milk Powder - Specification ( Sixth ... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 1166:2022 | SWEETENED CONDENSED MILK, SWEETENED CONDEN... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 13688:2020 | Packaged Pasteurized Milk â€" Specificati... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| Is 1656:2022 | MILK-CEREAL BASED COMPLEMENTARY FOODS SPEC... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 15757:2022 | FOLLOW-UP FORMULA-COMPLEMENTARY FOODS - SP... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 10325:2026 | Square tins of 15 kg or 15 litre capacity ... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 5887 (Part 8/Sec 1):2023 | Methods for detection of bacteria responsi... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 16068:2013 | Microbiology of food and animal feeding st... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 10142:2025 | POLYSTYRENE CRYSTAL AND HIGH IMPACT FOR IT... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 15888:2010 | Guideline for the conduct of food safety a... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 2062 (Part 1):2025 | Structural Steel - Part 1 - Hot Rolled Med... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 2062 (Part 2):2026 | Structural Steel - Part 2 - Hot Rolled Que... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 1239 (Part 1):2004 | Steel Tubes, Tubulars and Other Wrought St... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 1239 (Part 2):2011 | Steel tubes, tubulars and other steel fitt... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 1161:2014 | Steel tubes for structural purposes - Spec... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 3601:2006 | Steel tubes for mechanical and general eng... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 1079:2017 | Hot rolled carbon steel sheet, plate and s... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 513 (Part 1):2016 | Cold reduced carbon steel sheet and strip:... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 14246:2024 | CONTINUOUSLY PRE-PAINTED GALVANIZED STEEL ... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 2265:2026 | Specification for galvanized steel wire st... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 19068:2025 | Continuous hot-dip galvanized steel bars f... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 733:2025 | Wrought Aluminium and Aluminium Alloy Bars... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 410:1977 | Specification for cold rolled brass sheet,... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 1608 (Part 1):2022 | Metallic materials - Tensile testing - Par... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 1501 (Part 1):2025 | Metallic materials Vickers hardness test P... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 1757 (Part 1):2020 | Metallic Materials - Charpy Pendulum Impac... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 3748:2022 | Tool Steels - Specification | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 14894:2023 | Fasteners ï¿1⁄2 Hexagon head bolts of pro... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 3745:2024 | Yoke Type Medical Cylinder Valve with Pin ... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 4984:2016 | Polyethylene Pipes for Water Supply - Spec... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 4985:2021 | Unplasticized PVC Pipes for Potable Water ... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 12701:1996 | Rotational moulded polyethylene water stor... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 2798:1998 | Methods of test for plastics containers (F... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 6312:1994 | Polyethylene containers for the transport ... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 7803 (Part 1):1975 | Specification for plastic containers for p... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 2771 (Part 1):2022 | CORRUGATED FIBREBOARD BOXES- SPECIFICATION... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 15351:2015 | Agro textiles - Laminated high density pol... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 12818:2010 | Unplasticized Polyvinyl Chloride (PVC-U) S... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 13592:2013 | Unplasticized Polyvinyl Chloride (PVC-U) P... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 15778:2007 | Chlorinated Polyvinyl Chloride (CPVC) Pipe... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 14887:2014 | Textiles - High density polyethylene (HDPE... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 1708 (Part 1):1986 | Determination of moisture content (See IS ... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 303:2024 | IS 303: 2024 Plywood for General Purposes ... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 16654:2017 | Geosynthetics - Polypropylene multifilamen... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 5557 (Part 1):2024 | All Rubber Gum Boots and Ankle Boots Part ... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 6944:2026 | Medical Laboratory Glassware - Bijou Bacte... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 12933 (Part 2):2025 | Solar Flat Plate Collector - Specification... | `not_extracted` | `N/A` | N/A | N/A | N/A |
| IS 17862:2026 | E-Waste Management - Guidelines ( First Re... | `not_extracted` | `N/A` | N/A | N/A | N/A |

## 5. Next Pipeline Phase (Phase 4B)

Extracted JSON documents will serve as deterministic inputs to **Phase 4B: Document Normalization & Semantic Section Partitioning** upon verified PDF acquisition.
