# BISaarthi
### Your AI Guide to Indian Standards & BIS Compliance

## PRODUCT REQUIREMENTS DOCUMENT

Consolidated MVP specification for an AI-powered BIS and Indian Standards guidance platform.

**Version:** 1.1
**Status:** Updated MVP Product Definition
**Target:** SIH 2026 / Prototype

Updated to reflect the final three-feature MVP structure and document-upload placement.

---

## 1. Executive Summary

BISaarthi is a BIS-focused AI platform designed primarily for MSMEs and manufacturers who need to understand which Indian Standards may apply to their products and what compliance-related information may follow. It combines authoritative BIS/government retrieval with AI-generated explanations so users can understand standards without navigating multiple complex information sources.

The MVP is intentionally limited to three core product features: AI Chatbot, Find Standards, and Compare Standards. Standard results, Standard Details, Tests & Certification, Laboratories, Saved Standards and History support these core experiences; they are not separate core MVP features.

*BISaarthi — Your AI Guide to Indian Standards & BIS Compliance*

## 2. Problem Statement

BIS publishes a large and technically detailed body of Indian Standards, schemes, certification information and related services. Manufacturers may know the product they want to make but may not know which standard applies, whether certification is mandatory or voluntary, what tests are relevant, where testing can be performed, or what certification procedure applies.

- Difficulty identifying the correct Indian Standard from a product description.
- Information is distributed across different BIS-related pages and documents.
- Technical and regulatory language can be difficult for MSME users to interpret.
- Users struggle to connect a standard with tests, laboratories and certification information.
- Users need a faster way to verify information against authoritative sources.

## 3. Product Goals & Success Criteria

### MVP goals

- Find applicable standards accurately.
- Reduce time spent searching BIS information.
- Explain compliance information in simple language.
- Guide users toward tests, laboratories and certification information.
- Provide reliable, source-backed information.

### Success indicators

- A user can describe a product and receive a ranked set of potentially applicable standards.
- Each recommendation includes an understandable reason for relevance.
- Important claims are traceable to authoritative sources.
- Users can move from a standard result to details and related compliance tools.
- Users can compare exactly two standards.
- The AI avoids unsupported standards, tests, schemes, laboratories or certification claims.

## 4. Target Users

| User segment | Primary need | Typical use |
|---|---|---|
| MSMEs / small manufacturers | Identify standards and compliance path | New product / manufacturing |
| Compliance / technical staff | Verify standards, tests and certification information | Compliance preparation |
| Startups / new businesses | Understand regulatory expectations | Before launching a product |
| Large manufacturers | Faster standards discovery and comparison | Research / compliance |
| Students / researchers | Understand standards and related information | Technical research |

## 5. Primary User Persona

**MSME / Small Manufacturer**

- May have limited regulatory or BIS expertise.
- Knows the product but may not know the applicable IS number.
- Needs clear answers rather than long technical documents.
- Needs to understand tests, laboratories, certification and mandatory/voluntary status.
- Needs confidence that information comes from authoritative sources.

*Example: "I want to manufacture an electric heater. Which BIS standards are applicable?"*

## 6. MVP Scope — Three Core Features

The MVP has exactly three core product features:

| Core feature | Purpose | Key capabilities |
|---|---|---|
| 1. AI Chatbot | Conversational BIS guidance | Two-way chat, current-conversation context, new chat, history |
| 2. Find Standards | One-time discovery of applicable standards | Search, filters, product description, optional document upload, ranked results, Standard Details |
| 3. Compare Standards | Understand differences between two standards | Exactly two IS numbers, structured comparison, similarities, differences, sources |

Supporting screens are part of these core features, not additional MVP features: **Dashboard, Standard Details, Tests & Certification, Laboratories, Saved Standards, History, Settings, Login/Sign Up.**

**Critical correction:** Optional document upload belongs to Find Standards only. The AI Chatbot does not have a document-upload option in the MVP.

## 7. Information Architecture & User Flow

**Entry:** Landing Page → Login / Sign Up → Dashboard

**Core flow 1:** Dashboard → AI Chatbot → conversational BIS answer → current-chat follow-ups → History

**Core flow 2:** Dashboard → Find Standards → search/filter or describe product → optional document upload → one-time ranked results → Standard Details → Related Tools

**Core flow 3:** Dashboard → Compare Standards → enter exactly two IS numbers → structured comparison

**Related Tools from Standard Details:** Tests & Certification and Laboratories

Find Standards and its result/details flow are considered one single core feature. The results are not a separate feature.

## 8. Landing Page Requirements

The landing page should follow the attached project reference image while maintaining a professional, modern SaaS presentation. The overall direction is clean navy blue + white; exact colors can be refined later.

- Clear BISaarthi branding and positioning.
- Problem → solution narrative.
- Key capabilities.
- How BISaarthi works.
- Trust/source-backed messaging.
- Primary CTA: Ask BISaarthi.
- Login / Sign Up entry.

## 9. Authentication

- Login + Sign Up.
- Email + password.
- Google authentication.
- Basic profile: name and email.
- Successful authentication leads to Dashboard.

## 10. Dashboard

The Dashboard is the main application hub and entry point to the three core features.

**Sidebar:**

- AI Chatbot
- Find Standards
- Compare Standard
- Saved Standards
- History
- Settings

Dashboard home includes a welcome area, large AI prompt / "Ask BISaarthi" input, quick actions and recent activity/conversations.

## 11. Core Feature 1 — AI Chatbot

The AI Chatbot is a BIS-focused conversational assistant only. It is not a general-purpose chatbot.

### Behavior

- Full-screen chat experience.
- Two-way conversational interaction.
- Maintains context within the current conversation.
- New Chat is available.
- Conversations are automatically saved to History.
- New chats start fresh and do not inherit old conversation context.
- AI should answer directly rather than forcing a questionnaire.
- Clarification is used only when genuinely necessary.

**Document upload is NOT part of the AI Chatbot MVP.**

## 12. AI Answer & Guidance

For a question such as "I want to manufacture an electric heater. Which BIS standards are applicable?", the chatbot should directly provide useful BIS-focused guidance and identify potentially applicable standards when the available evidence supports it.

Where standards are surfaced, results use the same structured standard presentation defined under Find Standards. The chatbot answer should not dump complete tests, laboratory details or certification procedures into the main response; those are accessed through the relevant Standard Details → Related Tools flow.

Important information must be source-backed, and unsupported claims must not be presented as facts.

## 13. Core Feature 2 — Find Standards

Find Standards is the single core feature for standard discovery. It includes the input experience, one-time results and the Standard Details view reached from those results. These are not separate MVP features.

### Input methods

- Keyword / standard-number search.
- Search filters.
- Natural-language product description.
- Optional document upload to provide additional product context.

**Important:** Document upload is optional and belongs only to Find Standards. Users can use Find Standards without uploading anything.

### Interaction model

Find Standards is a one-time answer/discovery experience, not a two-way conversation. The user submits a search or product description and receives a result set.

## 14. Find Standards — Results

The result page displays ranked potentially applicable standards. Each result should contain:

- Relevance level: Highly Relevant / Relevant / Possibly Relevant.
- IS Number.
- Standard title.
- Current status where available.
- Why the standard is applicable.
- Source.
- View Details.

No numeric relevance percentage is required for the MVP. Relevance is communicated qualitatively unless a validated scoring methodology is introduced later.

## 15. Find Standards — Standard Details

Selecting View Details from a Find Standards result opens the Standard Details view. This view is therefore part of the Find Standards feature flow.

The Standard Details page contains:

- IS Number.
- Title.
- Status.
- Scope.
- Why Applicable.
- Key Requirements.
- Revision / publication information where available.
- Related Standards.
- Sources.
- Related Tools.

There is no "View on Official BIS Website" redirect in the product experience. Sources remain available inside BISaarthi for verification.

Key Requirements: categorized cards + short bullet points. Categories should reflect the actual standard rather than being rigidly hardcoded. Possible categories include Safety, Performance, Construction, Marking & Labelling, etc.

## 16. Related Tool — Tests & Certification

From a relevant Standard Details page: Related Tools → Tests & Certification.

- Simple list of applicable/required tests.
- Certification status: mandatory or voluntary where authoritative evidence supports the claim.
- Step-by-step certification process based on the applicable BIS scheme/procedure.
- Source references supporting the information.

Tests & Certification is a supporting workflow under Find Standards, not one of the three core MVP features.

## 17. Related Tool — Laboratories

From Standard Details: Related Tools → Laboratories.

- Laboratory name
- Location
- Contact information

Laboratories are intentionally lightweight in the MVP and are a supporting workflow under Find Standards.

## 18. Core Feature 3 — Compare Standards

Users manually enter exactly two IS numbers.

The result contains:

- Structured side-by-side comparison.
- Simple-language summary.
- Similarities.
- Key differences.
- Sources.

The AI must not invent differences. If authoritative evidence is insufficient, it should explicitly state that the difference could not be verified.

## 19. Supporting Dashboard Functions

**Saved Standards:** users can save standards and revisit their Standard Details.

**History:** stores chatbot conversations only.

**Settings:** basic profile and application preferences, including language/theme where applicable.

These are supporting functions and are not additional core MVP features.

## 20. Trust, Sources & AI Reliability

Trust is a core product requirement. BISaarthi should use authoritative information as the foundation of its responses and make verification practical.

**Source priority:** BIS standards and authoritative BIS information first; relevant government sources second.

- Important claims should have source references attached to relevant cards/claims.
- A consolidated Sources section should also be available.
- Never hallucinate IS numbers, tests, laboratories, schemes or clauses.
- Never invent mandatory/voluntary certification status.
- Never claim a product is officially BIS certified or compliant.
- Prefer current authoritative information where status/date data is available.
- If reliable information cannot be verified, say so clearly.

## 21. AI / RAG Architecture

User Query → Query Understanding → Authoritative Retrieval → Relevant BIS Information → Grounded LLM Response → Source Mapping → Structured UI

Hybrid retrieval is preferred: an indexed BIS knowledge base for fast retrieval plus live retrieval where feasible for information that may change. BIS should remain the primary knowledge source, supplemented by relevant government sources.

For Find Standards, an optional uploaded document may be processed as additional product context. This upload pipeline is not part of the AI Chatbot.

## 22. Conceptual Data Model

| Entity | Important fields / purpose |
|---|---|
| User | ID, name, email, authentication method, preferences |
| Conversation | ID, user, title, timestamps |
| Message | Conversation, role, content, source references, timestamps |
| Standard | IS number, title, status, scope, publication/revision data, source |
| Standard Requirement | Standard, category, requirement text / summary |
| Test | Standard/product context, test name, applicability, source |
| Laboratory | Name, location, contact information, source |
| Saved Standard | User + standard relationship |
| Comparison | User, two standards, result, source references |
| Source | Reference, source type, title, retrieval metadata |
| Uploaded Document | User, file metadata, extracted/contextual content, timestamps; used by Find Standards |

## 23. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | User can sign up and log in using email/password or Google. | Must |
| FR-02 | Authenticated user lands on Dashboard. | Must |
| FR-03 | User can start a BIS-focused chatbot conversation. | Must |
| FR-04 | Chat maintains context within the current conversation. | Must |
| FR-05 | Chat conversations are automatically saved to History. | Must |
| FR-06 | Find Standards accepts keyword/search-filter input. | Must |
| FR-07 | Find Standards accepts natural-language product descriptions. | Must |
| FR-08 | Find Standards optionally accepts a relevant uploaded document. | Must |
| FR-09 | Find Standards returns a one-time ranked result. | Must |
| FR-10 | Find Standards results show relevance, IS number, title, status, why applicable and source. | Must |
| FR-11 | User can open Standard Details from a Find Standards result. | Must |
| FR-12 | User can access Tests & Certification from Standard Details → Related Tools. | Must |
| FR-13 | User can access Laboratories from Standard Details → Related Tools. | Must |
| FR-14 | User can compare exactly two IS numbers. | Must |
| FR-15 | Comparison includes similarities, differences, summary and sources. | Must |
| FR-16 | User can save standards. | Must |
| FR-17 | User can view chatbot history. | Must |
| FR-18 | Important information includes source references. | Must |
| FR-19 | System supports English and Hindi. | Must |
| FR-20 | System supports light and dark themes. | Must |

## 24. Non-Functional Requirements

- **Accuracy:** prioritize authoritative source grounding over unsupported fluency.
- **Transparency:** users can see sources behind important information.
- **Usability:** understandable to non-expert MSME users.
- **Performance:** common searches should return promptly; live retrieval may take longer.
- **Security:** authenticated data and uploaded documents must be protected.
- **Privacy:** uploaded documents should be handled according to the application's privacy policy.
- **Accessibility:** readable typography, keyboard navigation and adequate contrast in both themes.
- **Maintainability:** standards, sources and retrieval components should be independently updateable.

## 25. UX / Visual Design Direction

- Professional, modern, clean SaaS interface.
- Navy blue + white visual direction; exact colors can be refined.
- Light + dark themes.
- Structured cards and sections with concise text.
- Persistent sidebar for core tools and supporting functions.
- Progressive disclosure so the main answer is not overloaded.
- Clearly visible source indicators.

The main AI Chatbot answer should not dump complete tests, laboratory details or certification procedures. Those are reached through Standard Details → Related Tools.

## 26. Key User Stories

| ID | User story |
|---|---|
| US-01 | As a manufacturer, I want to describe my product so BISaarthi can identify potentially applicable Indian Standards. |
| US-02 | As a user, I want to know why a standard is relevant so I can judge whether it fits my product. |
| US-03 | As a user, I want sources beside important information so I can verify the answer. |
| US-04 | As a Find Standards user, I want to optionally upload a product document so the system can use additional context. |
| US-05 | As a user, I want to understand relevant tests and certification information for a selected standard. |
| US-06 | As a user, I want to see basic laboratory information. |
| US-07 | As a user, I want to compare two standards to understand their similarities and differences. |
| US-08 | As a user, I want to save standards that I may need again. |
| US-09 | As a user, I want my chatbot conversations saved so I can revisit them. |
| US-10 | As a chatbot user, I want to ask follow-up questions within the same chat without repeating context. |

## 27. Example End-to-End Scenario

**Scenario:** A small manufacturer wants to manufacture an electric heater.

1. User opens BISaarthi and logs in.
2. User chooses Find Standards.
3. User describes: "I want to manufacture an electric heater."
4. If available, the user may optionally upload a product document.
5. BISaarthi retrieves relevant authoritative information and returns a one-time ranked result.
6. Results show relevance, IS number, title, status, why applicable and sources.
7. User opens Standard Details.
8. User reviews scope, key requirements, status, related standards and sources.
9. User can open Related Tools → Tests & Certification or Laboratories.
10. If needed, user goes to Compare Standards and enters exactly two IS numbers.

**Alternative:** The user may ask the same product question through the AI Chatbot for a conversational BIS-focused discussion. The chatbot does not accept document uploads in this MVP.

## 28. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Incorrect standard recommendation | High | RAG, authoritative ranking, relevance explanation and evaluation set |
| Hallucinated compliance information | High | Ground answers in retrieved sources; explicit uncertainty behavior |
| Outdated standards/status | High | Hybrid retrieval and source metadata |
| Overly technical answers | Medium | Structured cards and simple-language summaries |
| Confusing related standards | Medium | Ranked results + why applicable + comparison |
| Unverified mandatory/voluntary claims | High | Only state when supported by authoritative evidence |
| Uploaded document misinterpretation | Medium | Optional contextual use, controlled extraction and source tracking |
| Live retrieval failure | Medium | Fallback to indexed authoritative knowledge base and communicate limits |
| User assumes AI guidance is official certification | High | Clear disclaimer and source-backed guidance |

## 29. AI Evaluation & Quality Strategy

Evaluation should focus on retrieval quality, groundedness and practical usefulness.

- Build a test set of product descriptions and expected relevant standards.
- Measure whether correct standards appear among top results.
- Check whether "Why applicable?" is supported by retrieved evidence.
- Verify mandatory/voluntary claims against authoritative sources.
- Test comparison outputs for unsupported differences.
- Test English and Hindi responses for meaning preservation.
- Test cases where the system should say information cannot be verified.
- Test optional document uploads specifically within Find Standards.

## 30. Future Scope

Features intentionally kept aside from the current MVP may include:

- Advanced compliance tracking.
- Enterprise accounts/workspaces.
- Admin/content management.
- Notifications for standard changes.
- More advanced document analysis.
- Direct BIS service/application integrations where officially supported.
- Expanded multilingual coverage.
- Advanced laboratory discovery and filtering.
- Personalized compliance journeys.
- Analytics and reporting.

## 31. Product Disclaimer

BISaarthi is an AI-powered guidance and information tool. It does not replace BIS, authorized certification bodies, testing laboratories, regulators or qualified compliance professionals. AI-generated information must not be presented as official BIS certification, approval or legal determination. Where authoritative information cannot be verified, BISaarthi should say so clearly.

## 32. Final MVP Definition

BISaarthi has exactly three core MVP features:

1. **AI Chatbot** — a BIS-focused, two-way conversational assistant with current-chat context and saved chat history.
2. **Find Standards** — a one-time standards discovery tool using search, filters, natural-language product descriptions and optional document upload. Its ranked results and Standard Details view are part of this same feature.
3. **Compare Standards** — a two-standard comparison tool with structured results, similarities, differences, simple-language explanation and sources.

**The central principle is: simple answers for the user, authoritative evidence underneath.**

---

## Appendix A. MVP Navigation Map

| Screen / flow | Role |
|---|---|
| Landing | Product introduction and CTA |
| Login / Sign Up | Authentication |
| Dashboard | Hub for the three core features |
| AI Chatbot | Core feature 1 — conversational BIS guidance |
| Find Standards | Core feature 2 — one-time discovery + optional document upload |
| Find Standards Results | Part of Find Standards — ranked standards |
| Standard Details | Part of Find Standards — detailed standard information |
| Tests & Certification | Related Tool from Standard Details |
| Laboratories | Related Tool from Standard Details |
| Compare Standards | Core feature 3 — compare exactly two standards |
| Saved Standards | Supporting function |
| History | Supporting function — chatbot conversations |
| Settings | Supporting function |

## Appendix B. Core Product Principle

Every important answer should be useful, understandable and verifiable. BISaarthi should prefer a transparent "I cannot verify this from authoritative information" over a confident but unsupported answer.
