import datetime
import uuid
import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password
from app.models.laboratory import Laboratory, StandardLaboratory
from app.models.saved_standard import SavedStandard
from app.models.source import Source
from app.models.standard import (
    CertificationStep,
    Standard,
    StandardRelated,
    StandardRequirement,
    Test,
)
from app.models.user import User


@pytest_asyncio.fixture
async def sample_data(test_db_session: AsyncSession):
    """Seed isolated sample standards data for testing."""

    # 1. Source
    source = Source(
        id=uuid.uuid4(),
        reference_url="https://bis.gov.in/standards/is302",
        source_type="bis_standard",
        title="BIS Gazette on IS 302",
        reliability_tier="primary",
    )
    test_db_session.add(source)

    # 2. Standards
    std1 = Standard(
        is_number="IS 302 (Part 1)",
        title="Safety of Household and Similar Electrical Appliances",
        status="active",
        scope="Covers safety requirements for household electric appliances including electric heaters.",
        publication_date=datetime.date(2024, 1, 15),
        revision_info="Sixth revision",
        categories=["Electrical", "Safety", "Appliances"],
        primary_source_id=source.id,
    )
    std2 = Standard(
        is_number="IS 302 (Part 2)",
        title="Particular Requirements for Electric Heaters",
        status="active",
        scope="Specific test parameters and insulation rules for electric heaters.",
        publication_date=datetime.date(2024, 3, 20),
        revision_info="Second revision",
        categories=["Electrical", "Heating", "Appliances"],
        primary_source_id=source.id,
    )
    std3 = Standard(
        is_number="IS 16102 (Part 1)",
        title="Self-Ballasted LED Lamps for General Lighting Services",
        status="superseded",
        scope="Safety and performance requirements for LED lighting lamps under CRS.",
        publication_date=datetime.date(2012, 5, 10),
        revision_info="Initial publication",
        categories=["Lighting", "Electronics"],
        primary_source_id=source.id,
    )
    test_db_session.add_all([std1, std2, std3])
    await test_db_session.flush()

    # 3. Requirements for std1
    req1 = StandardRequirement(
        standard_is_number=std1.is_number,
        category="General Safety",
        requirement_text="Protection against electric shock during normal operation.",
        display_order=1,
    )
    req2 = StandardRequirement(
        standard_is_number=std1.is_number,
        category="Marking & Labelling",
        requirement_text="Must display ISI Mark, rated voltage, and manufacturer name.",
        display_order=2,
    )
    test_db_session.add_all([req1, req2])

    # 4. Tests for std1
    test1 = Test(
        standard_is_number=std1.is_number,
        test_name="High Voltage Dielectric Test",
        applicability="mandatory",
        description="Withstand 1500V AC test without breakdown.",
        display_order=1,
    )
    test2 = Test(
        standard_is_number=std1.is_number,
        test_name="Energy Efficiency Screening",
        applicability="voluntary",
        description="Optional thermal insulation efficiency index check.",
        display_order=2,
    )
    test_db_session.add_all([test1, test2])

    # 5. Related Standards
    rel = StandardRelated(
        standard_is_number=std1.is_number,
        related_is_number=std2.is_number,
        relation_note="Companion standard for particular requirements",
    )
    test_db_session.add(rel)

    # 6. Certification Steps for std1
    step1 = CertificationStep(
        standard_is_number=std1.is_number,
        step_number=1,
        step_description="Submit application on Manakonline with factory details.",
    )
    step2 = CertificationStep(
        standard_is_number=std1.is_number,
        step_number=2,
        step_description="Sample testing in recognized BIS laboratory.",
    )
    test_db_session.add_all([step1, step2])

    # 7. Laboratory for std1
    lab = Laboratory(
        name="National Test House (WR)",
        location="Mumbai, Maharashtra",
        contact_info={"phone": "+91-22-12345678", "email": "nth-mumbai@gov.in"},
    )
    test_db_session.add(lab)
    await test_db_session.flush()

    std_lab = StandardLaboratory(
        standard_is_number=std1.is_number,
        laboratory_id=lab.id,
    )
    test_db_session.add(std_lab)

    # 8. User for auth tests
    user1 = User(
        name="User One",
        email="user1@example.com",
        password_hash=hash_password("Password123!"),
    )
    user2 = User(
        name="User Two",
        email="user2@example.com",
        password_hash=hash_password("Password123!"),
    )
    test_db_session.add_all([user1, user2])
    await test_db_session.commit()

    return {
        "user1": user1,
        "user2": user2,
        "std1": std1,
        "std2": std2,
        "std3": std3,
    }


# =========================================================================
# Standard List & Search Tests
# =========================================================================

@pytest.mark.asyncio
async def test_list_standards_empty(async_client: AsyncClient):
    """Empty database returns 0 items."""
    res = await async_client.get("/api/standards")
    assert res.status_code == 200
    data = res.json()
    assert data["items"] == []
    assert data["total"] == 0
    assert data["page"] == 1


@pytest.mark.asyncio
async def test_list_standards_seeded(async_client: AsyncClient, sample_data):
    """List returns all 3 seeded standards."""
    res = await async_client.get("/api/standards")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 3
    assert len(data["items"]) == 3


@pytest.mark.asyncio
async def test_search_by_is_number(async_client: AsyncClient, sample_data):
    """Search by IS number matching substring."""
    res = await async_client.get("/api/standards?q=16102")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 1
    assert data["items"][0]["is_number"] == "IS 16102 (Part 1)"


@pytest.mark.asyncio
async def test_search_by_title(async_client: AsyncClient, sample_data):
    """Search by title matching keyword."""
    res = await async_client.get("/api/standards?q=Heater")
    assert res.status_code == 200
    data = res.json()
    # Matches std1 (scope has electric heaters) and std2 (title has electric heaters)
    assert data["total"] == 2


@pytest.mark.asyncio
async def test_search_by_scope(async_client: AsyncClient, sample_data):
    """Search by scope keyword."""
    res = await async_client.get("/api/standards?q=insulation")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 1
    assert data["items"][0]["is_number"] == "IS 302 (Part 2)"


@pytest.mark.asyncio
async def test_filter_by_status(async_client: AsyncClient, sample_data):
    """Filter standards by active/superseded status."""
    res_active = await async_client.get("/api/standards?status=active")
    assert res_active.status_code == 200
    assert res_active.json()["total"] == 2

    res_sup = await async_client.get("/api/standards?status=superseded")
    assert res_sup.status_code == 200
    assert res_sup.json()["total"] == 1
    assert res_sup.json()["items"][0]["is_number"] == "IS 16102 (Part 1)"


@pytest.mark.asyncio
async def test_filter_by_category(async_client: AsyncClient, sample_data):
    """Filter standards by category."""
    res = await async_client.get("/api/standards?category=Lighting")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 1
    assert data["items"][0]["is_number"] == "IS 16102 (Part 1)"


@pytest.mark.asyncio
async def test_standards_pagination(async_client: AsyncClient, sample_data):
    """Test pagination with page_size=2 and page=2."""
    res = await async_client.get("/api/standards?page=2&page_size=2")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 3
    assert data["page"] == 2
    assert data["page_size"] == 2
    assert len(data["items"]) == 1


@pytest.mark.asyncio
async def test_standards_invalid_pagination(async_client: AsyncClient):
    """Test invalid page numbers return validation error."""
    res1 = await async_client.get("/api/standards?page=0")
    assert res1.status_code == 400

    res2 = await async_client.get("/api/standards?page_size=200")
    assert res2.status_code == 400


# =========================================================================
# Standard Detail Tests
# =========================================================================

@pytest.mark.asyncio
async def test_get_standard_detail_success(async_client: AsyncClient, sample_data):
    """Get canonical standard details by IS number."""
    res = await async_client.get("/api/standards/IS 302 (Part 1)")
    assert res.status_code == 200
    data = res.json()
    assert data["is_number"] == "IS 302 (Part 1)"
    assert data["title"] == "Safety of Household and Similar Electrical Appliances"
    assert data["status"] == "active"
    assert data["categories"] == ["Electrical", "Safety", "Appliances"]
    assert "primary_source" in data
    assert data["primary_source"]["title"] == "BIS Gazette on IS 302"


@pytest.mark.asyncio
async def test_get_standard_detail_not_found(async_client: AsyncClient, sample_data):
    """Get nonexistent standard returns 404."""
    res = await async_client.get("/api/standards/IS 99999")
    assert res.status_code == 404
    data = res.json()
    assert data["error"]["code"] == "NOT_FOUND"


# =========================================================================
# Standard Requirements Tests
# =========================================================================

@pytest.mark.asyncio
async def test_get_requirements_ordered(async_client: AsyncClient, sample_data):
    """Get requirements for IS 302 (Part 1) ordered by display_order."""
    res = await async_client.get("/api/standards/IS 302 (Part 1)/requirements")
    assert res.status_code == 200
    data = res.json()
    assert data["standard_is_number"] == "IS 302 (Part 1)"
    assert len(data["requirements"]) == 2
    assert data["requirements"][0]["display_order"] == 1
    assert data["requirements"][0]["category"] == "General Safety"
    assert data["requirements"][1]["display_order"] == 2


@pytest.mark.asyncio
async def test_get_requirements_nonexistent_standard(async_client: AsyncClient, sample_data):
    """Nonexistent standard returns 404 for requirements."""
    res = await async_client.get("/api/standards/IS 99999/requirements")
    assert res.status_code == 404


# =========================================================================
# Standard Tests Tests
# =========================================================================

@pytest.mark.asyncio
async def test_get_tests_and_applicability(async_client: AsyncClient, sample_data):
    """Get compliance tests and verify mandatory/voluntary applicability."""
    res = await async_client.get("/api/standards/IS 302 (Part 1)/tests")
    assert res.status_code == 200
    data = res.json()
    assert len(data["tests"]) == 2
    assert data["tests"][0]["test_name"] == "High Voltage Dielectric Test"
    assert data["tests"][0]["applicability"] == "mandatory"
    assert data["tests"][1]["applicability"] == "voluntary"


@pytest.mark.asyncio
async def test_get_tests_nonexistent_standard(async_client: AsyncClient, sample_data):
    """Nonexistent standard returns 404 for tests."""
    res = await async_client.get("/api/standards/IS 99999/tests")
    assert res.status_code == 404


# =========================================================================
# Related Standards Tests
# =========================================================================

@pytest.mark.asyncio
async def test_get_related_standards(async_client: AsyncClient, sample_data):
    """Get related standards enriched with related title and status."""
    res = await async_client.get("/api/standards/IS 302 (Part 1)/related")
    assert res.status_code == 200
    data = res.json()
    assert len(data["related_standards"]) == 1
    rel = data["related_standards"][0]
    assert rel["related_is_number"] == "IS 302 (Part 2)"
    assert rel["title"] == "Particular Requirements for Electric Heaters"
    assert rel["status"] == "active"
    assert rel["relation_note"] == "Companion standard for particular requirements"


# =========================================================================
# Certification Steps Tests
# =========================================================================

@pytest.mark.asyncio
async def test_get_certification_steps(async_client: AsyncClient, sample_data):
    """Get certification steps in step_number order."""
    res = await async_client.get("/api/standards/IS 302 (Part 1)/certification")
    assert res.status_code == 200
    data = res.json()
    assert len(data["certification_steps"]) == 2
    assert data["certification_steps"][0]["step_number"] == 1
    assert data["certification_steps"][1]["step_number"] == 2


# =========================================================================
# Laboratories Tests
# =========================================================================

@pytest.mark.asyncio
async def test_get_standard_laboratories(async_client: AsyncClient, sample_data):
    """Get recognized laboratories for a standard."""
    res = await async_client.get("/api/standards/IS 302 (Part 1)/laboratories")
    assert res.status_code == 200
    data = res.json()
    assert len(data["laboratories"]) == 1
    assert data["laboratories"][0]["name"] == "National Test House (WR)"
    assert data["laboratories"][0]["location"] == "Mumbai, Maharashtra"


@pytest.mark.asyncio
async def test_get_standard_laboratories_empty(async_client: AsyncClient, sample_data):
    """Standard with no mapped laboratories returns empty list."""
    res = await async_client.get("/api/standards/IS 16102 (Part 1)/laboratories")
    assert res.status_code == 200
    data = res.json()
    assert data["laboratories"] == []


# =========================================================================
# Saved Standards Tests (Auth & Permissions)
# =========================================================================

@pytest.mark.asyncio
async def test_save_standard_authenticated(async_client: AsyncClient, sample_data):
    """Authenticated user saves a standard."""
    user1 = sample_data["user1"]
    token = create_access_token(subject=user1.id)

    res = await async_client.post(
        "/api/standards/IS 302 (Part 1)/save",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 201
    assert res.json()["status"] == "saved"
    assert res.json()["is_number"] == "IS 302 (Part 1)"


@pytest.mark.asyncio
async def test_save_standard_duplicate_conflict(async_client: AsyncClient, sample_data):
    """Attempting to save the same standard twice returns 409 Conflict."""
    user1 = sample_data["user1"]
    token = create_access_token(subject=user1.id)

    # First save
    res1 = await async_client.post(
        "/api/standards/IS 302 (Part 1)/save",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res1.status_code == 201

    # Second save
    res2 = await async_client.post(
        "/api/standards/IS 302 (Part 1)/save",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res2.status_code == 409
    assert res2.json()["error"]["code"] == "CONFLICT"


@pytest.mark.asyncio
async def test_get_user_saved_standards(async_client: AsyncClient, sample_data):
    """User retrieves their saved standards with standard details."""
    user1 = sample_data["user1"]
    token = create_access_token(subject=user1.id)

    # Save std1 and std2
    await async_client.post("/api/standards/IS 302 (Part 1)/save", headers={"Authorization": f"Bearer {token}"})
    await async_client.post("/api/standards/IS 302 (Part 2)/save", headers={"Authorization": f"Bearer {token}"})

    # Get saved
    res = await async_client.get(
        "/api/standards/saved",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 2
    assert len(data["items"]) == 2
    assert data["items"][0]["standard"]["title"] is not None


@pytest.mark.asyncio
async def test_delete_saved_standard(async_client: AsyncClient, sample_data):
    """User unsaves a previously saved standard."""
    user1 = sample_data["user1"]
    token = create_access_token(subject=user1.id)

    await async_client.post("/api/standards/IS 302 (Part 1)/save", headers={"Authorization": f"Bearer {token}"})

    # Delete saved
    res = await async_client.delete(
        "/api/standards/IS 302 (Part 1)/save",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    assert res.json()["status"] == "removed"

    # Verify saved list is now empty
    check_res = await async_client.get("/api/standards/saved", headers={"Authorization": f"Bearer {token}"})
    assert check_res.json()["total"] == 0


@pytest.mark.asyncio
async def test_saved_standards_cross_user_isolation(async_client: AsyncClient, sample_data):
    """User 2 cannot see or delete standards saved by User 1."""
    user1 = sample_data["user1"]
    user2 = sample_data["user2"]
    token1 = create_access_token(subject=user1.id)
    token2 = create_access_token(subject=user2.id)

    # User 1 saves standard
    await async_client.post("/api/standards/IS 302 (Part 1)/save", headers={"Authorization": f"Bearer {token1}"})

    # User 2 checks saved standards -> should be empty
    res2 = await async_client.get("/api/standards/saved", headers={"Authorization": f"Bearer {token2}"})
    assert res2.json()["total"] == 0

    # User 2 tries to delete standard saved by User 1 -> 404
    del_res = await async_client.delete(
        "/api/standards/IS 302 (Part 1)/save",
        headers={"Authorization": f"Bearer {token2}"},
    )
    assert del_res.status_code == 404


@pytest.mark.asyncio
async def test_unauthenticated_saved_standards_rejected(async_client: AsyncClient, sample_data):
    """Unauthenticated requests to saved standards endpoints are rejected with 401."""
    res_get = await async_client.get("/api/standards/saved")
    assert res_get.status_code == 401

    res_post = await async_client.post("/api/standards/IS 302 (Part 1)/save")
    assert res_post.status_code == 401

    res_del = await async_client.delete("/api/standards/IS 302 (Part 1)/save")
    assert res_del.status_code == 401
