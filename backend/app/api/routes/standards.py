import uuid
from typing import List, Optional, Union
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import Text, cast, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload

from app.core.errors import ConflictError, NotFoundError, ValidationError
from app.core.logging import get_logger
from app.core.security import get_current_user
from app.db.session import get_db
from app.models.laboratory import Laboratory, StandardLaboratory
from app.models.saved_standard import SavedStandard
from app.models.standard import (
    CertificationStep,
    Standard,
    StandardRelated,
    StandardRequirement,
    Test,
)
from app.models.user import User
from app.schemas.bis_api import (
    CompareStandardsRequest,
    CompareStandardsResponse,
    StandardDetailsResponse,
)
from app.schemas.bis_standard_detail import OfficialStandardDetailDocument
from app.schemas.standards import (
    CertificationStepResponse,
    CertificationStepsListResponse,
    LaboratoryResponse,
    RelatedStandardResponse,
    SavedStandardListResponse,
    SavedStandardResponse,
    SaveStandardActionResponse,
    StandardDetail,
    StandardLaboratoriesListResponse,
    StandardListResponse,
    StandardRelatedListResponse,
    StandardRequirementResponse,
    StandardRequirementsListResponse,
    StandardSummary,
    StandardTestResponse,
    StandardTestsListResponse,
)
from app.services.bis_ai_enrichment_service import BISAiEnrichmentService
from app.services.bis_corpus_service import BISCorpusService

logger = get_logger("bisaarthi.standards")
router = APIRouter(prefix="/standards", tags=["Standards"])

STOPWORDS = {
    "i", "want", "to", "manufacture", "manufacturing", "make", "making", "produce",
    "producing", "producer", "which", "bis", "standard", "standards", "should",
    "know", "about", "me", "tell", "what", "is", "are", "for", "please", "can",
    "you", "a", "an", "the", "in", "of", "on", "and", "or", "with", "any", "how",
    "do", "get", "need", "requirements", "requirement", "specification",
    "specifications", "rule", "rules", "guide", "guidance", "applicable", "apply",
    "applies", "comply", "compliance", "indian", "india", "isi", "mark", "marking",
    "product", "products", "item", "items", "good", "goods", "help", "information",
    "details", "suggest", "recommend", "looking", "start", "starting",
    "मैं", "चाहता", "चाहती", "हूँ", "हूं", "मुझे", "किन", "के", "बारे", "में", "पता",
    "होना", "चाहिए", "क्या", "है", "हैं", "बताएं", "बताइए", "बनाना", "निर्माण",
    "उत्पादन", "करना", "लागू", "मानक", "मानकों", "बीआईएस", "जानकारी", "दें", "दीजिए",
    "कृपया", "कौन", "से", "का", "की", "को", "पर", "और", "या", "भारतीय", "नियम",
}


async def _get_standard_or_404(is_number: str, db: Optional[AsyncSession]) -> Union[Standard, StandardDetail]:
    """Helper to verify standard existence and retrieve canonical model, corpus detail, or synthesized detail."""
    cleaned = is_number.strip()
    if db is not None:
        try:
            stmt = (
                select(Standard)
                .where(func.lower(Standard.is_number) == cleaned.lower())
                .options(selectinload(Standard.primary_source))
            )
            result = await db.execute(stmt)
            standard = result.scalar_one_or_none()
            if standard is not None:
                return standard
        except Exception as e:
            logger.debug("Database query in _get_standard_or_404 failed, using corpus fallback: %s", str(e))

    # Fall back to authoritative 100-standard corpus
    corpus_service = BISCorpusService.get_instance()
    std_detail = corpus_service.get_standard(cleaned)
    if std_detail is not None:
        return StandardDetail(
            is_number=std_detail.is_number,
            title=std_detail.title,
            status=std_detail.status or "active",
            scope=std_detail.primary_use_case,
            publication_date=None,
            revision_info=std_detail.type,
            categories=[std_detail.category] if std_detail.category else [],
            reason_selected=std_detail.reason_selected,
            primary_use_case=std_detail.primary_use_case,
            why_applicable=std_detail.why_applicable or std_detail.reason_selected,
            primary_source=None,
        )

    # If it is a recognizable Indian Standard identifier (e.g. 'IS 302', 'IS 2082', 'IS 1293'), synthesize canonical detail
    if cleaned.upper().startswith("IS") or any(char.isdigit() for char in cleaned):
        ai_enricher = BISAiEnrichmentService.get_instance()
        ai_stds = ai_enricher.discover_standards_with_ai(cleaned)
        matched_ai = next((s for s in ai_stds if cleaned.lower() in s.get("is_number", "").lower()), None)
        if matched_ai:
            return StandardDetail(
                is_number=matched_ai.get("is_number", cleaned),
                title=matched_ai.get("title", f"Indian Standard {cleaned}"),
                status="active",
                scope=matched_ai.get("primary_use_case") or matched_ai.get("why_applicable"),
                publication_date=None,
                revision_info="Latest Revision",
                categories=[matched_ai.get("category", "General Standards")],
                reason_selected=matched_ai.get("why_applicable"),
                primary_use_case=matched_ai.get("primary_use_case"),
                why_applicable=matched_ai.get("why_applicable"),
                primary_source=None,
            )

    raise NotFoundError(f"Indian Standard '{is_number}' was not found.")


# -------------------------------------------------------------------------
# 1. Compare Standards (Placed before /{is_number} to prevent route collision)
# -------------------------------------------------------------------------
@router.post(
    "/compare",
    response_model=CompareStandardsResponse,
    status_code=status.HTTP_200_OK,
    summary="Compare two Indian Standards",
    description="Compare metadata attributes of two Indian Standards from the authoritative MVP corpus.",
)
async def compare_standards(
    request: CompareStandardsRequest,
) -> CompareStandardsResponse:
    """Compare metadata attributes of two Indian Standards from the authoritative MVP corpus."""
    corpus_service = BISCorpusService.get_instance()
    return corpus_service.compare_standards(request.standard_a, request.standard_b)


# -------------------------------------------------------------------------
# 1. List / Search Standards
# -------------------------------------------------------------------------
@router.get(
    "",
    response_model=StandardListResponse,
    status_code=status.HTTP_200_OK,
    summary="List and search Indian Standards",
    description="Retrieve paginated Indian Standards with optional keyword search, category, and status filters.",
)
async def list_standards(
    q: Optional[str] = Query(None, description="Search term for IS number, title, scope, or categories"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status (active, superseded, withdrawn, under_revision, unknown)"),
    category: Optional[str] = Query(None, description="Filter by category domain"),
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(20, ge=1, le=100, description="Number of items per page (max 100)"),
    db: Optional[AsyncSession] = Depends(get_db),
) -> StandardListResponse:
    corpus_service = BISCorpusService.get_instance()
    ai_enricher = BISAiEnrichmentService.get_instance()

    # 1. Natural Language / Product Query Handling (e.g. 'i want to manufacture electric heater which standards apply')
    if q and q.strip():
        q_clean = q.strip()
        raw_tokens = [t for t in q_clean.split() if len(t) > 1]
        substantive_tokens = [t for t in raw_tokens if t.lower() not in STOPWORDS]

        is_conversational_query = len(raw_tokens) > 2 and (
            any(t.lower() in STOPWORDS for t in raw_tokens) or
            any(kw in q_clean.lower() for kw in ["manufacture", "manufacturing", "making", "produce", "apply", "which", "want to", "how to"])
        )

        if is_conversational_query:
            # Discover standards with Gemini LLM + authoritative corpus
            ai_stds = ai_enricher.discover_standards_with_ai(q_clean, category=category)
            discovered_corpus = corpus_service.discover_standards_for_query(query_text=q_clean, category=category, top_k=20)

            merged_items: List[StandardSummary] = []
            seen_is = set()

            for ai_item in ai_stds:
                is_num = ai_item.get("is_number", "")
                if is_num and is_num.lower() not in seen_is:
                    seen_is.add(is_num.lower())
                    # Cross-reference with corpus to retain canonical metadata if available
                    canonical_std = corpus_service.get_standard(is_num)
                    reason_val = canonical_std.reason_selected if (canonical_std and canonical_std.reason_selected) else ai_item.get("why_applicable")
                    use_val = canonical_std.primary_use_case if (canonical_std and canonical_std.primary_use_case) else ai_item.get("primary_use_case")

                    merged_items.append(
                        StandardSummary(
                            is_number=is_num,
                            title=canonical_std.title if canonical_std else ai_item.get("title", is_num),
                            status=canonical_std.status if (canonical_std and canonical_std.status) else ai_item.get("status", "active"),
                            scope=use_val or ai_item.get("why_applicable"),
                            categories=[ai_item.get("category", "General Standards")] if ai_item.get("category") else [],
                            reason_selected=reason_val,
                            primary_use_case=use_val,
                            why_applicable=ai_item.get("why_applicable") or reason_val,
                        )
                    )

            for std_detail, score in discovered_corpus:
                if std_detail.is_number.lower() not in seen_is:
                    seen_is.add(std_detail.is_number.lower())
                    merged_items.append(
                        StandardSummary(
                            is_number=std_detail.is_number,
                            title=std_detail.title,
                            status=std_detail.status or "active",
                            scope=std_detail.primary_use_case or std_detail.scope,
                            categories=std_detail.categories or ([std_detail.category] if std_detail.category else []),
                            reason_selected=std_detail.reason_selected,
                            primary_use_case=std_detail.primary_use_case,
                            why_applicable=std_detail.why_applicable or std_detail.reason_selected or std_detail.primary_use_case,
                        )
                    )

            if status_filter and status_filter.strip():
                sf = status_filter.strip().lower()
                merged_items = [item for item in merged_items if sf in (item.status or "").lower()]

            if merged_items:
                total = len(merged_items)
                offset = (page - 1) * page_size
                paged = merged_items[offset : offset + page_size]
                return StandardListResponse(
                    items=paged,
                    page=page,
                    page_size=page_size,
                    total=total,
                )

        # 2. Direct Keyword / IS Number search in Database
        if db is not None:
            try:
                stmt = select(Standard)
                count_stmt = select(func.count()).select_from(Standard)

                terms_to_match = substantive_tokens if substantive_tokens else raw_tokens
                if not terms_to_match:
                    terms_to_match = [q_clean]

                term_filters = []
                for t in terms_to_match:
                    term_filters.append(Standard.is_number.ilike(f"%{t}%"))
                    term_filters.append(Standard.title.ilike(f"%{t}%"))
                    term_filters.append(Standard.scope.ilike(f"%{t}%"))
                    term_filters.append(cast(Standard.categories, Text).ilike(f"%{t}%"))

                stmt = stmt.where(or_(*term_filters))
                count_stmt = count_stmt.where(or_(*term_filters))

                if status_filter and status_filter.strip():
                    stat_clean = status_filter.strip().lower()
                    stmt = stmt.where(func.lower(Standard.status) == stat_clean)
                    count_stmt = count_stmt.where(func.lower(Standard.status) == stat_clean)

                if category and category.strip():
                    cat_clean = category.strip()
                    cat_filter = cast(Standard.categories, Text).ilike(f"%{cat_clean}%")
                    stmt = stmt.where(cat_filter)
                    count_stmt = count_stmt.where(cat_filter)

                total_result = await db.execute(count_stmt)
                total = total_result.scalar_one() or 0

                if total > 0:
                    offset = (page - 1) * page_size
                    stmt = stmt.order_by(Standard.is_number.asc()).offset(offset).limit(page_size)
                    result = await db.execute(stmt)
                    standards = result.scalars().all()

                    return StandardListResponse(
                        items=[
                            StandardSummary(
                                is_number=s.is_number,
                                title=s.title,
                                status=s.status or "active",
                                scope=s.scope,
                                publication_date=s.publication_date,
                                revision_info=s.revision_info,
                                categories=s.categories or [],
                                reason_selected=s.scope,
                                primary_use_case=s.scope,
                                why_applicable=s.scope or s.title,
                            )
                            for s in standards
                        ],
                        page=page,
                        page_size=page_size,
                        total=total,
                    )
            except Exception as e:
                logger.debug("Database standards query skipped or fallback invoked: %s", str(e))

    # 3. Standard List when q is None (DB or Corpus)
    if not q or not q.strip():
        if db is not None:
            try:
                stmt = select(Standard)
                count_stmt = select(func.count()).select_from(Standard)

                if status_filter and status_filter.strip():
                    stat_clean = status_filter.strip().lower()
                    stmt = stmt.where(func.lower(Standard.status) == stat_clean)
                    count_stmt = count_stmt.where(func.lower(Standard.status) == stat_clean)

                if category and category.strip():
                    cat_clean = category.strip()
                    cat_filter = cast(Standard.categories, Text).ilike(f"%{cat_clean}%")
                    stmt = stmt.where(cat_filter)
                    count_stmt = count_stmt.where(cat_filter)

                total_result = await db.execute(count_stmt)
                total = total_result.scalar_one() or 0

                if total > 0:
                    offset = (page - 1) * page_size
                    stmt = stmt.order_by(Standard.is_number.asc()).offset(offset).limit(page_size)
                    result = await db.execute(stmt)
                    standards = result.scalars().all()

                    return StandardListResponse(
                        items=[
                            StandardSummary(
                                is_number=s.is_number,
                                title=s.title,
                                status=s.status or "active",
                                scope=s.scope,
                                publication_date=s.publication_date,
                                revision_info=s.revision_info,
                                categories=s.categories or [],
                                reason_selected=s.scope,
                                primary_use_case=s.scope,
                                why_applicable=s.scope or s.title,
                            )
                            for s in standards
                        ],
                        page=page,
                        page_size=page_size,
                        total=total,
                    )
            except Exception as e:
                logger.debug("Database standards query error: %s", str(e))

    # Fallback to authoritative 100-standard corpus service with AI discovery & aliases
    corpus_res = corpus_service.list_standards(
        q=q,
        category=category,
        is_number=None,
        status_filter=status_filter,
        page=page,
        page_size=page_size,
    )
    return StandardListResponse(
        items=[
            StandardSummary(
                is_number=it.is_number,
                title=it.title,
                status=it.status or "active",
                scope=it.primary_use_case,
                categories=[it.category] if it.category else [],
                reason_selected=it.reason_selected,
                primary_use_case=it.primary_use_case,
                why_applicable=it.why_applicable or it.reason_selected or it.primary_use_case,
            )
            for it in corpus_res.items
        ],
        total=corpus_res.total,
        page=corpus_res.page,
        page_size=corpus_res.page_size,
    )


# -------------------------------------------------------------------------
# 2. Saved Standards (Placed before /{is_number} to prevent route collision)
# -------------------------------------------------------------------------
@router.get(
    "/saved",
    response_model=SavedStandardListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get user saved standards",
    description="Retrieve bookmarked standards for the authenticated user.",
)
async def get_saved_standards(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_current_user),
    db: Optional[AsyncSession] = Depends(get_db),
) -> SavedStandardListResponse:
    """Retrieve all standards saved by current user."""
    if db is None:
        raise ValidationError("Database connection is currently unavailable.")

    count_stmt = (
        select(func.count())
        .select_from(SavedStandard)
        .where(SavedStandard.user_id == current_user.id)
    )
    total_res = await db.execute(count_stmt)
    total = total_res.scalar_one() or 0

    offset = (page - 1) * page_size
    stmt = (
        select(SavedStandard)
        .where(SavedStandard.user_id == current_user.id)
        .options(joinedload(SavedStandard.standard))
        .order_by(SavedStandard.saved_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    result = await db.execute(stmt)
    saved_items = result.scalars().all()

    return SavedStandardListResponse(
        items=[SavedStandardResponse.model_validate(item) for item in saved_items],
        total=total,
        page=page,
        page_size=page_size,
    )


# -------------------------------------------------------------------------
# 3. Standard Detail
# -------------------------------------------------------------------------
@router.get(
    "/{is_number}",
    response_model=Union[StandardDetailsResponse, StandardDetail],
    status_code=status.HTTP_200_OK,
    summary="Get Indian Standard details",
    description="Retrieve full canonical record for a specific IS number or standard ID.",
)
async def get_standard_detail(
    is_number: str,
    db: Optional[AsyncSession] = Depends(get_db),
) -> Union[StandardDetailsResponse, StandardDetail]:
    """Retrieve canonical standard detail by IS number or ID with full corpus & official metadata."""
    if db is not None:
        try:
            cleaned = is_number.strip()
            stmt = (
                select(Standard)
                .where(func.lower(Standard.is_number) == cleaned.lower())
                .options(selectinload(Standard.primary_source))
            )
            result = await db.execute(stmt)
            standard = result.scalar_one_or_none()
            if standard is not None:
                return StandardDetail.model_validate(standard)
        except Exception as e:
            logger.debug("Database standard detail query fallback: %s", str(e))

    corpus_service = BISCorpusService.get_instance()
    std_detail = corpus_service.get_standard(is_number)
    if std_detail is not None:
        return std_detail

    standard_or_detail = await _get_standard_or_404(is_number, db)
    if isinstance(standard_or_detail, StandardDetail):
        return standard_or_detail
    return StandardDetail.model_validate(standard_or_detail)


@router.get(
    "/{is_number}/official-details",
    response_model=OfficialStandardDetailDocument,
    status_code=status.HTTP_200_OK,
    summary="Get official BIS multi-tab standard details",
    description="Retrieve verified multi-tab official BIS details including laboratories, licenses, amendments, and gazette orders.",
)
async def get_official_standard_details(
    is_number: str,
) -> OfficialStandardDetailDocument:
    """Retrieve normalized official BIS Standard Details document."""
    corpus_service = BISCorpusService.get_instance()
    doc = corpus_service.get_enriched_standard_detail(is_number)
    if doc is None:
        raise NotFoundError(f"Official BIS details for '{is_number}' could not be resolved.")
    return doc


# -------------------------------------------------------------------------
# 4. Standard Requirements
# -------------------------------------------------------------------------
@router.get(
    "/{is_number}/requirements",
    response_model=StandardRequirementsListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get standard requirements",
    description="Retrieve categorized requirements for a standard ordered by display_order.",
)
async def get_standard_requirements(
    is_number: str,
    db: Optional[AsyncSession] = Depends(get_db),
) -> StandardRequirementsListResponse:
    """Retrieve requirements for an Indian Standard with AI synthesis fallback."""
    standard = await _get_standard_or_404(is_number, db)

    requirements = []
    if db is not None:
        try:
            stmt = (
                select(StandardRequirement)
                .where(func.lower(StandardRequirement.standard_is_number) == standard.is_number.lower())
                .order_by(StandardRequirement.display_order.asc(), StandardRequirement.id.asc())
            )
            result = await db.execute(stmt)
            requirements = result.scalars().all()
        except Exception as e:
            logger.debug("Database requirements query fallback: %s", str(e))

    if not requirements:
        ai_enricher = BISAiEnrichmentService.get_instance()
        std_title = getattr(standard, "title", is_number)
        std_cat = getattr(standard, "category", None) or (standard.categories[0] if getattr(standard, "categories", None) else "General")
        synth_reqs = ai_enricher.synthesize_requirements(
            is_number=standard.is_number,
            title=std_title,
            category=std_cat,
        )
        return StandardRequirementsListResponse(
            standard_is_number=standard.is_number,
            requirements=[
                StandardRequirementResponse(
                    id=uuid.uuid4(),
                    standard_is_number=standard.is_number,
                    category=r.get("category", "Technical"),
                    requirement_text=r.get("requirement_text", ""),
                    source_id=None,
                    display_order=r.get("display_order", idx),
                )
                for idx, r in enumerate(synth_reqs, 1)
            ],
        )

    return StandardRequirementsListResponse(
        standard_is_number=standard.is_number,
        requirements=[StandardRequirementResponse.model_validate(r) for r in requirements],
    )


# -------------------------------------------------------------------------
# 5. Standard Tests
# -------------------------------------------------------------------------
@router.get(
    "/{is_number}/tests",
    response_model=StandardTestsListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get standard compliance tests",
    description="Retrieve tests associated with an Indian Standard including applicability (mandatory, voluntary, unknown).",
)
async def get_standard_tests(
    is_number: str,
    db: Optional[AsyncSession] = Depends(get_db),
) -> StandardTestsListResponse:
    """Retrieve compliance tests associated with a standard with AI synthesis fallback."""
    standard = await _get_standard_or_404(is_number, db)

    tests = []
    if db is not None:
        try:
            stmt = (
                select(Test)
                .where(func.lower(Test.standard_is_number) == standard.is_number.lower())
                .order_by(Test.display_order.asc(), Test.id.asc())
            )
            result = await db.execute(stmt)
            tests = result.scalars().all()
        except Exception as e:
            logger.debug("Database tests query fallback: %s", str(e))

    if not tests:
        ai_enricher = BISAiEnrichmentService.get_instance()
        std_title = getattr(standard, "title", is_number)
        std_cat = getattr(standard, "category", None) or (standard.categories[0] if getattr(standard, "categories", None) else "General")
        synth_tests = ai_enricher.synthesize_tests(
            is_number=standard.is_number,
            title=std_title,
            category=std_cat,
        )
        return StandardTestsListResponse(
            standard_is_number=standard.is_number,
            tests=[
                StandardTestResponse(
                    id=uuid.uuid4(),
                    standard_is_number=standard.is_number,
                    test_name=t.get("test_name", "Verification Test"),
                    applicability=t.get("applicability", "mandatory"),
                    description=t.get("description", "Verification test under standard criteria"),
                    source_id=None,
                    display_order=t.get("display_order", idx),
                )
                for idx, t in enumerate(synth_tests, 1)
            ],
        )

    return StandardTestsListResponse(
        standard_is_number=standard.is_number,
        tests=[StandardTestResponse.model_validate(t) for t in tests],
    )


# -------------------------------------------------------------------------
# 6. Related Standards
# -------------------------------------------------------------------------
@router.get(
    "/{is_number}/related",
    response_model=StandardRelatedListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get related Indian Standards",
    description="Retrieve related standards mapped to this standard.",
)
async def get_related_standards(
    is_number: str,
    db: Optional[AsyncSession] = Depends(get_db),
) -> StandardRelatedListResponse:
    """Retrieve related standards for an Indian Standard."""
    standard = await _get_standard_or_404(is_number, db)

    related_items: List[RelatedStandardResponse] = []
    if db is not None:
        try:
            stmt = (
                select(StandardRelated, Standard)
                .join(Standard, StandardRelated.related_is_number == Standard.is_number, isouter=True)
                .where(func.lower(StandardRelated.standard_is_number) == standard.is_number.lower())
            )
            result = await db.execute(stmt)
            rows = result.all()

            for rel, rel_std in rows:
                related_items.append(
                    RelatedStandardResponse(
                        standard_is_number=rel.standard_is_number,
                        related_is_number=rel.related_is_number,
                        relation_note=rel.relation_note,
                        title=rel_std.title if rel_std else None,
                        status=rel_std.status if rel_std else None,
                    )
                )
        except Exception as e:
            logger.debug("Database related standards query fallback: %s", str(e))

    if not related_items:
        corpus_service = BISCorpusService.get_instance()
        corpus_std = corpus_service.get_standard(standard.is_number)
        if corpus_std and corpus_std.related_selected_standards:
            for rel_num in corpus_std.related_selected_standards:
                rel_info = corpus_service.get_standard(rel_num)
                related_items.append(
                    RelatedStandardResponse(
                        standard_is_number=standard.is_number,
                        related_is_number=rel_num,
                        relation_note="Normative companion standard in domain",
                        title=rel_info.title if rel_info else rel_num,
                        status=rel_info.status if rel_info else "active",
                    )
                )

    return StandardRelatedListResponse(
        standard_is_number=standard.is_number,
        related_standards=related_items,
    )


# -------------------------------------------------------------------------
# 7. Certification Steps
# -------------------------------------------------------------------------
@router.get(
    "/{is_number}/certification",
    response_model=CertificationStepsListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get certification process steps",
    description="Retrieve sequential steps for acquiring compliance certification under this standard.",
)
async def get_certification_steps(
    is_number: str,
    db: Optional[AsyncSession] = Depends(get_db),
) -> CertificationStepsListResponse:
    """Retrieve certification process steps for an Indian Standard with AI fallback."""
    standard = await _get_standard_or_404(is_number, db)

    steps = []
    if db is not None:
        try:
            stmt = (
                select(CertificationStep)
                .where(func.lower(CertificationStep.standard_is_number) == standard.is_number.lower())
                .order_by(CertificationStep.step_number.asc())
            )
            result = await db.execute(stmt)
            steps = result.scalars().all()
        except Exception as e:
            logger.debug("Database certification steps query fallback: %s", str(e))

    if not steps:
        ai_enricher = BISAiEnrichmentService.get_instance()
        std_title = getattr(standard, "title", is_number)
        synth_steps = ai_enricher.synthesize_certification_steps(
            is_number=standard.is_number,
            title=std_title,
        )
        return CertificationStepsListResponse(
            standard_is_number=standard.is_number,
            certification_steps=[
                CertificationStepResponse(
                    id=uuid.uuid4(),
                    standard_is_number=standard.is_number,
                    step_number=s.get("step_number", idx),
                    step_description=s.get("step_description", ""),
                    source_id=None,
                )
                for idx, s in enumerate(synth_steps, 1)
            ],
        )

    return CertificationStepsListResponse(
        standard_is_number=standard.is_number,
        certification_steps=[CertificationStepResponse.model_validate(s) for s in steps],
    )


# -------------------------------------------------------------------------
# 8. Laboratories
# -------------------------------------------------------------------------
@router.get(
    "/{is_number}/laboratories",
    response_model=StandardLaboratoriesListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get recognized testing laboratories",
    description="Retrieve BIS recognized test laboratories capable of testing this standard.",
)
async def get_standard_laboratories(
    is_number: str,
    db: Optional[AsyncSession] = Depends(get_db),
) -> StandardLaboratoriesListResponse:
    """Retrieve recognized laboratories mapped to a standard with AI synthesis fallback."""
    standard = await _get_standard_or_404(is_number, db)

    labs = []
    if db is not None and isinstance(standard, Standard):
        try:
            stmt = (
                select(Laboratory)
                .join(StandardLaboratory, StandardLaboratory.laboratory_id == Laboratory.id)
                .where(func.lower(StandardLaboratory.standard_is_number) == standard.is_number.lower())
                .order_by(Laboratory.name.asc())
            )
            result = await db.execute(stmt)
            labs = result.scalars().all()
            return StandardLaboratoriesListResponse(
                standard_is_number=standard.is_number,
                laboratories=[LaboratoryResponse.model_validate(lab) for lab in labs],
            )
        except Exception as e:
            logger.debug("Database laboratory query fallback: %s", str(e))

    if not labs:
        ai_enricher = BISAiEnrichmentService.get_instance()
        std_title = getattr(standard, "title", is_number)
        std_cat = getattr(standard, "category", None) or (standard.categories[0] if getattr(standard, "categories", None) else "General")
        synth_labs = ai_enricher.synthesize_laboratories(
            is_number=standard.is_number,
            title=std_title,
            category=std_cat,
        )
        lab_items = [
            LaboratoryResponse(
                id=uuid.uuid4(),
                name=lab.get("lab_name", "Recognized Testing Laboratory"),
                location=f"{lab.get('district', '')}, {lab.get('state', '')}".strip(", "),
                contact_info={
                    "phone": lab.get("contact_phone"),
                    "email": lab.get("contact_person"),
                    "bis_code": lab.get("bis_code"),
                    "osl_code": lab.get("osl_code"),
                    "scope": lab.get("testing_scope"),
                    "lab_type": lab.get("lab_type"),
                },
                source_id=None,
                created_at=None,
            )
            for lab in synth_labs
        ]
        return StandardLaboratoriesListResponse(
            standard_is_number=standard.is_number,
            laboratories=lab_items,
        )

    return StandardLaboratoriesListResponse(
        standard_is_number=standard.is_number,
        laboratories=[LaboratoryResponse.model_validate(lab) for lab in labs],
    )


# -------------------------------------------------------------------------
# 9. Save / Bookmark Standard (Protected)
# -------------------------------------------------------------------------
@router.post(
    "/{is_number}/save",
    response_model=SaveStandardActionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Save / bookmark standard",
    description="Bookmark a standard to the authenticated user's saved list.",
)
async def save_standard(
    is_number: str,
    current_user: User = Depends(get_current_user),
    db: Optional[AsyncSession] = Depends(get_db),
) -> SaveStandardActionResponse:
    """Bookmark an Indian Standard for the current user."""
    if db is None:
        raise ValidationError("Database connection is currently unavailable.")

    standard = await _get_standard_or_404(is_number, db)

    # Ensure parent Standard row exists in DB for foreign key constraint
    stmt_std = select(Standard).where(func.lower(Standard.is_number) == standard.is_number.lower())
    res_std = await db.execute(stmt_std)
    existing_std = res_std.scalar_one_or_none()
    if existing_std is None:
        raw_status = str(getattr(standard, "status", "active") or "active").lower()
        valid_status = raw_status if raw_status in ("active", "superseded", "withdrawn", "under_revision", "unknown") else "active"
        db_std = Standard(
            is_number=standard.is_number,
            title=standard.title,
            status=valid_status,
            scope=getattr(standard, "scope", getattr(standard, "primary_use_case", None)),
            categories=getattr(standard, "categories", []) or [],
        )
        db.add(db_std)
        await db.flush()

    # Check for existing bookmark
    stmt = select(SavedStandard).where(
        SavedStandard.user_id == current_user.id,
        SavedStandard.standard_is_number == standard.is_number,
    )
    res = await db.execute(stmt)
    existing = res.scalar_one_or_none()

    if existing is not None:
        raise ConflictError(f"Standard '{standard.is_number}' is already in your saved standards.")

    new_saved = SavedStandard(
        user_id=current_user.id,
        standard_is_number=standard.is_number,
    )
    db.add(new_saved)
    await db.commit()

    logger.info("User %s saved standard %s", str(current_user.id), standard.is_number)
    return SaveStandardActionResponse(
        status="saved",
        is_number=standard.is_number,
        message=f"Standard '{standard.is_number}' was successfully saved.",
    )


# -------------------------------------------------------------------------
# 10. Delete / Unsave Standard (Protected)
# -------------------------------------------------------------------------
@router.delete(
    "/{is_number}/save",
    response_model=SaveStandardActionResponse,
    status_code=status.HTTP_200_OK,
    summary="Remove saved standard",
    description="Remove a bookmarked standard from the authenticated user's saved list.",
)
async def delete_saved_standard(
    is_number: str,
    current_user: User = Depends(get_current_user),
    db: Optional[AsyncSession] = Depends(get_db),
) -> SaveStandardActionResponse:
    """Remove a bookmarked standard from current user's saved list."""
    if db is None:
        raise ValidationError("Database connection is currently unavailable.")

    cleaned = is_number.strip()
    try:
        resolved_std = await _get_standard_or_404(cleaned, db)
        canonical_num = resolved_std.is_number
    except Exception:
        canonical_num = cleaned

    stmt = select(SavedStandard).where(
        SavedStandard.user_id == current_user.id,
        or_(
            func.lower(SavedStandard.standard_is_number) == cleaned.lower(),
            func.lower(SavedStandard.standard_is_number) == canonical_num.lower(),
            SavedStandard.standard_is_number.ilike(f"{cleaned}%"),
        ),
    )
    res = await db.execute(stmt)
    saved = res.scalar_one_or_none()

    if saved is None:
        raise NotFoundError(f"Standard '{is_number}' is not in your saved list.")

    await db.delete(saved)
    await db.commit()

    logger.info("User %s unsaved standard %s", str(current_user.id), is_number)
    return SaveStandardActionResponse(
        status="removed",
        is_number=is_number,
        message=f"Standard '{is_number}' was removed from your saved list.",
    )
