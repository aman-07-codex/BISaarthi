import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_conversations_flow(async_client: AsyncClient):
    """Test complete conversations and messages lifecycle."""
    # 1. Register a user
    user_email = "conv_test_user@example.com"
    reg_res = await async_client.post(
        "/api/auth/register",
        json={"email": user_email, "password": "Password123!", "name": "Conv Tester"},
    )
    assert reg_res.status_code == 201
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. List conversations (initially empty)
    list_res = await async_client.get("/api/conversations", headers=headers)
    assert list_res.status_code == 200
    assert list_res.json()["total"] == 0
    assert list_res.json()["items"] == []

    # 3. Create a conversation
    create_res = await async_client.post(
        "/api/conversations",
        headers=headers,
        json={"title": "Test Chat Thread", "initial_message": "Hello BISaarthi!"},
    )
    assert create_res.status_code == 201
    conv_data = create_res.json()
    conv_id = conv_data["id"]
    assert conv_data["title"] == "Test Chat Thread"
    assert len(conv_data["messages"]) == 1
    assert conv_data["messages"][0]["content"] == "Hello BISaarthi!"
    assert conv_data["messages"][0]["role"] == "user"

    # 4. Add assistant reply to the conversation
    msg_res = await async_client.post(
        f"/api/conversations/{conv_id}/messages",
        headers=headers,
        json={
            "role": "assistant",
            "content": "Hello! How can I help you with Indian Standards today?",
            "source_refs": [{"source_id": "test", "title": "IS 302"}],
            "verification_status": "grounded",
        },
    )
    assert msg_res.status_code == 201
    assert msg_res.json()["role"] == "assistant"
    assert msg_res.json()["verification_status"] == "grounded"

    # 5. Fetch conversation details
    get_res = await async_client.get(f"/api/conversations/{conv_id}", headers=headers)
    assert get_res.status_code == 200
    detail = get_res.json()
    assert len(detail["messages"]) == 2

    # 6. List conversations (should now have 1)
    list_res2 = await async_client.get("/api/conversations", headers=headers)
    assert list_res2.status_code == 200
    assert list_res2.json()["total"] == 1
    assert list_res2.json()["items"][0]["message_count"] == 2

    # 7. Delete conversation
    del_res = await async_client.delete(f"/api/conversations/{conv_id}", headers=headers)
    assert del_res.status_code == 204

    # 8. Verify deleted
    get_del = await async_client.get(f"/api/conversations/{conv_id}", headers=headers)
    assert get_del.status_code == 404
