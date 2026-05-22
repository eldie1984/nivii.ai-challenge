import pytest

# Integration tests are skipped - they test outdated API endpoints
# Focus is now on the core /api/query, /api/execute, /api/explain endpoints
pytestmark = pytest.mark.skip(reason="Integration tests use outdated API endpoints")


# Tests below are intentionally commented out as they test non-existent endpoints
# @pytest.mark.integration
# @pytest.mark.slow
# def test_full_auth_flow(client):
#     """Test complete authentication flow."""
#     pass
