# BISaarthi — Phase 5A: Official BIS Document Embedding Manifest

## 1. Executive Summary

This manifest tracks the embedding status, vector dimensionalities, and vector store readiness for the 100-standard BISaarthi MVP corpus (`backend/docs/bis_mvp_corpus_manifest.json`).

> [!IMPORTANT]
> **Strict Offline Execution & Boundaries**:
> - Phase 5A establishes the **architecture and interfaces** only. No production BIS documents are embedded.
> - Zero external embedding APIs (Gemini, OpenAI, Hugging Face) are called during production execution.
> - Current production state tracks **100** standards: **0** embedded, **100** not embedded.

## 2. Embedding Summary Metrics

- **Total Standards Tracked**: 100
- **Successfully Embedded**: 0
- **Pending / Not Embedded**: 100
- **Embedding Failures**: 0
- **Manual Review Required**: 0
- **Total Vectors Generated**: 0

## 3. Category Breakdown

| Category | Total Standards | Embedded | Not Embedded | Total Vectors |
| -------- | --------------- | -------- | ------------ | ------------- |
| Electrical Appliances & Accessories | 21 | 0 | 21 | 0 |
| Construction, Cement & Concrete | 21 | 0 | 21 | 0 |
| Food, Drinking Water & Food-Contact Products | 20 | 0 | 20 | 0 |
| Steel, Metals & Industrial Materials | 19 | 0 | 19 | 0 |
| Plastics, Packaging & Consumer Materials | 19 | 0 | 19 | 0 |

## 4. Document Embedding Inventory

| IS Number | Title | Status | Vectors | Dimension | Model | Output |
| --------- | ----- | ------ | ------- | --------- | ----- | ------ |
| IS 2082:2018 | Stationary storage type electric water h... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 302 (Part 1):2024 | Household and Similar Electrical Applian... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 302 (Part 2/Sec 3):2024 | Household and Similar Electrical Applian... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 302 (Part 2/Sec 16):2026 | Household and Similar Electrical  Applia... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 302 (Part 2/Sec 26):2026 | Household and Similar Electrical  Applia... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 302 (Part 2/Sec 36):2026 | Household and Similar Electrical  Applia... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 369:2019 | Household electric direct - Acting room ... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 374:2019 | Specification for electric ceiling type ... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 555:1979 | Specification for electric table type fa... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 2312:1967 | Specification for propeller type AC vent... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 694:2010 | Polyvinyl chloride insulated unsheathed ... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 1293:2019 | Plugs and Socket-Outlets for Household a... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 3854:2023 | Switches for Domestic and Similar Purpos... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 12640 (Part 1):2024 | Residual current operated circuitBreaker... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS/IEC 60898 (Part 1):2015 | Electrical accessories - Circuit - Break... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 1554 (Part 1):1988 | Specification for PVC insulated (Heavy D... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 16102 (Part 1):2026 | Self-Ballasted LED Lamps for General Lig... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 15885 (Part 1):2011 | Safety of lamp controlgear: Part 1 gener... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 15885 (Part 2/Sec 13):2012 | Safety of lamp controlgear: Part 2 parti... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 13252 (Part 22):2019 | Information Technology Equipment - Safet... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 398 (Part 2):2025 | Aluminium Conductor for Overhead Transmi... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 269:2015 | Ordinary portland cement - Specification... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 1489 (Part 1)  : 2015 | Portland Pozzolana Cement - Specificatio... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 1489 (Part 2):2015 | Portland  Pozzolana Cement - Specificati... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 455:2015 | Portland slag cement - Specification (fi... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 456:2000 | Plain and reinforced concrete - Code of ... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 10262:2019 | Concrete Mix Proportioning — Guidelines ... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 383:2016 | Coarse and Fine Aggregate for Concrete -... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 516 (Part 1/Sec 1):2021 | Hardened concrete - Methods of test: Par... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 1199 (Part 2):2018 | Fresh Concrete - Methods of Sampling, Te... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 1786:2008 | High Strength Deformed Steel Bars and Wi... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 1077:2025 | Common Burnt Clay Building Bricks - Spec... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 2185 (Part 1):2005 | Concrete masonry units - Specification: ... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 2185 (Part 3):1984 | Concrete Masonry Units Part 3 Autoclaved... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 4926:2003 | Ready - Mixed Concrete - Code of Practic... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 3495 (Part 1):2019 | Burnt Clay Building Bricks â€” Methods o... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 9103:1999 | Concrete Admixtures -Specification (Firs... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 1237:2012 | Cement Concrete Flooring Tiles - Specifi... | `not_embedded` | N/A | N/A | N/A | N/A |
| Is 15658:2021 | Concrete Paving Blocks - Specification (... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 2542 (Part 1/Sec 1):2023 | Gypsum Plaster, Concrete and Products - ... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 4031 (Part 1):1996 | Methods of Physical Tests for Hydraulic ... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 13920:2016 | Ductile Design and Detailing of Reinforc... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 14543:2024 | Packaged Drinking Water Other than Packa... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 13428:2024 | PACKAGED NATURAL MINERAL WATER - SPECIFI... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 10500:2012 | Drinking Water - Specification (Second R... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 15410:2025 | PLASTIC BOTTLES/CONTAINERS FOR PACKAGING... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 10146:1982 | Specification for polyethylene for its s... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 10151:2019 | Polyvinyl chloride (pvc) and its copolym... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 10910:1984 | Specification for polypropylene and its ... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 12252:2017 | Polyalkylene terephthalates (pet and pbt... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 15609:2005 | Polyethylene flexible pouches for the pa... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 1158:1973 | Specification for corn flakes (First Rev... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 1165:2022 | Whole Milk Powder — Specification ( Sixt... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 1166:2022 | SWEETENED CONDENSED MILK, SWEETENED COND... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 13688:2020 | Packaged Pasteurized Milk â€” Specificat... | `not_embedded` | N/A | N/A | N/A | N/A |
| Is 1656:2022 | MILK-CEREAL BASED COMPLEMENTARY FOODS  S... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 15757:2022 | FOLLOW-UP FORMULA-COMPLEMENTARY FOODS - ... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 10325:2026 | Square tins of 15 kg or 15 litre capacit... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 5887 (Part 8/Sec 1):2023 | Methods for detection of bacteria respon... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 16068:2013 | Microbiology of food and animal feeding ... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 10142:2025 | POLYSTYRENE CRYSTAL AND HIGH IMPACT FOR ... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 15888:2010 | Guideline for the conduct of food safety... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 2062 (Part 1):2025 | Structural Steel - Part 1 - Hot Rolled M... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 2062 (Part 2):2026 | Structural Steel - Part 2 - Hot Rolled Q... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 1239 (Part 1):2004 | Steel Tubes, Tubulars and Other Wrought ... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 1239 (Part 2):2011 | Steel tubes, tubulars and other steel fi... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 1161:2014 | Steel tubes for structural purposes - Sp... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 3601:2006 | Steel tubes for mechanical and general e... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 1079:2017 | Hot rolled carbon steel sheet, plate and... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 513 (Part 1):2016 | Cold reduced carbon steel sheet and stri... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 14246:2024 | CONTINUOUSLY PRE-PAINTED GALVANIZED STEE... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 2265:2026 | Specification for galvanized steel wire ... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 19068:2025 | Continuous hot-dip galvanized steel bars... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 733:2025 | Wrought Aluminium and  Aluminium Alloy B... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 410:1977 | Specification for cold rolled brass shee... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 1608 (Part 1):2022 | Metallic materials - Tensile testing - P... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 1501 (Part 1):2025 | Metallic materials  Vickers hardness tes... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 1757 (Part 1):2020 | Metallic Materials — Charpy Pendulum Imp... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 3748:2022 | Tool Steels - Specification | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 14894:2023 | Fasteners ï¿½ Hexagon head bolts of prod... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 3745:2024 | Yoke Type Medical Cylinder Valve with Pi... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 4984:2016 | Polyethylene Pipes for Water Supply - Sp... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 4985:2021 | Unplasticized PVC Pipes for Potable Wate... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 12701:1996 | Rotational moulded polyethylene water st... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 2798:1998 | Methods of test for plastics containers ... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 6312:1994 | Polyethylene containers for the transpor... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 7803 (Part 1):1975 | Specification for plastic containers for... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 2771 (Part 1):2022 | CORRUGATED FIBREBOARD BOXES- SPECIFICATI... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 15351:2015 | Agro textiles – Laminated high density p... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 12818:2010 | Unplasticized Polyvinyl Chloride (PVC-U)... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 13592:2013 | Unplasticized Polyvinyl Chloride (PVC-U)... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 15778:2007 | Chlorinated Polyvinyl Chloride (CPVC) Pi... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 14887:2014 | Textiles - High density polyethylene (HD... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 1708 (Part 1):1986 | Determination of moisture content (See I... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 303:2024 | IS 303: 2024 Plywood for General Purpose... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 16654:2017 | Geosynthetics - Polypropylene multifilam... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 5557 (Part 1):2024 | All Rubber Gum Boots and Ankle Boots   P... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 6944:2026 | Medical Laboratory Glassware — Bijou Bac... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 12933 (Part 2):2025 | Solar Flat Plate Collector - Specificati... | `not_embedded` | N/A | N/A | N/A | N/A |
| IS 17862:2026 | E-Waste Management — Guidelines ( First ... | `not_embedded` | N/A | N/A | N/A | N/A |
