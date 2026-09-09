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
from app.services.bis_corpus_service import BISCorpusService

logger = get_logger("bisaarthi.standards")
router = APIRouter(prefix="/standards", tags=["Standards"])


async def _get_standard_or_404(is_number: str, db: Optional[AsyncSession]) -> Union[Standard, StandardDetail]:
    """Helper to verify standard existence and retrieve canonical model or corpus detail."""
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

    if db is not None:
        try:
            stmt = select(Standard)
            count_stmt = select(func.count()).select_from(Standard)

            # Search filter across relevant fields
            if q and q.strip():
                q_clean = q.strip()
                terms = [t for t in q_clean.split() if len(t) > 1]
                if not terms:
                    terms = [q_clean]

                term_filters = []
                for t in terms:
                    term_filters.append(Standard.is_number.ilike(f"%{t}%"))
                    term_filters.append(Standard.title.ilike(f"%{t}%"))
                    term_filters.append(Standard.scope.ilike(f"%{t}%"))
                    term_filters.append(cast(Standard.categories, Text).ilike(f"%{t}%"))

                stmt = stmt.where(or_(*term_filters))
                count_stmt = count_stmt.where(or_(*term_filters))

            # Status filter
            if status_filter and status_filter.strip():
                stat_clean = status_filter.strip().lower()
                stmt = stmt.where(func.lower(Standard.status) == stat_clean)
                count_stmt = count_stmt.where(func.lower(Standard.status) == stat_clean)

            # Category filter
            if category and category.strip():
                cat_clean = category.strip()
                cat_filter = cast(Standard.categories, Text).ilike(f"%{cat_clean}%")
                stmt = stmt.where(cat_filter)
                count_stmt = count_stmt.where(cat_filter)

            # Compute total count
            total_result = await db.execute(count_stmt)
            total = total_result.scalar_one() or 0

            # If search query was not provided, or if DB search found matching records, return DB items
            if not (q and q.strip()) or total > 0:
                # Deterministic ordering & pagination
                offset = (page - 1) * page_size
                stmt = stmt.order_by(Standard.is_number.asc()).offset(offset).limit(page_size)

                result = await db.execute(stmt)
                standards = result.scalars().all()

                return StandardListResponse(
                    items=[StandardSummary.model_validate(s) for s in standards],
                    page=page,
                    page_size=page_size,
                    total=total,
                )
        except Exception as e:
            logger.debug("Database standards query skipped or fallback invoked: %s", str(e))

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
    """Retrieve requirements for an Indian Standard."""
    if db is None:
        raise ValidationError("Database connection is currently unavailable.")

    standard = await _get_standard_or_404(is_number, db)

    stmt = (
        select(StandardRequirement)
        .where(StandardRequirement.standard_is_number == standard.is_number)
        .order_by(StandardRequirement.display_order.asc(), StandardRequirement.id.asc())
    )
    result = await db.execute(stmt)
    requirements = result.scalars().all()

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
    """Retrieve compliance tests associated with a standard."""
    if db is None:
        raise ValidationError("Database connection is currently unavailable.")

    standard = await _get_standard_or_404(is_number, db)

    stmt = (
        select(Test)
        .where(Test.standard_is_number == standard.is_number)
        .order_by(Test.display_order.asc(), Test.id.asc())
    )
    result = await db.execute(stmt)
    tests = result.scalars().all()

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
    if db is None:
        raise ValidationError("Database connection is currently unavailable.")

    standard = await _get_standard_or_404(is_number, db)

    stmt = (
        select(StandardRelated, Standard)
        .join(Standard, StandardRelated.related_is_number == Standard.is_number, isouter=True)
        .where(StandardRelated.standard_is_number == standard.is_number)
    )
    result = await db.execute(stmt)
    rows = result.all()

    related_items: List[RelatedStandardResponse] = []
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
    """Retrieve certification process steps for an Indian Standard."""
    if db is None:
        raise ValidationError("Database connection is currently unavailable.")

    standard = await _get_standard_or_404(is_number, db)

    stmt = (
        select(CertificationStep)
        .where(CertificationStep.standard_is_number == standard.is_number)
        .order_by(CertificationStep.step_number.asc())
    )
    result = await db.execute(stmt)
    steps = result.scalars().all()

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
    """Retrieve recognized laboratories mapped to a standard."""
    if db is None:
        raise ValidationError("Database connection is currently unavailable.")

    standard = await _get_standard_or_404(is_number, db)

    stmt = (
        select(Laboratory)
        .join(StandardLaboratory, StandardLaboratory.laboratory_id == Laboratory.id)
        .where(StandardLaboratory.standard_is_number == standard.is_number)
        .order_by(Laboratory.name.asc())
    )
    result = await db.execute(stmt)
    labs = result.scalars().all()

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
        db_std = Standard(
            is_number=standard.is_number,
            title=standard.title,
            status=getattr(standard, "status", "active") or "active",
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
    stmt = select(SavedStandard).where(
        SavedStandard.user_id == current_user.id,
        func.lower(SavedStandard.standard_is_number) == cleaned.lower(),
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
