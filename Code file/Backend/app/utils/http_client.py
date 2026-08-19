import os
import ssl

import certifi

try:
    import truststore
except ImportError:  # safety fallback
    truststore = None


def get_httpx_verify():
    """
    Returns the best SSL verification config for httpx.

    Order:
    1. If HTTPX_VERIFY=false in env => disable verify (DEV ONLY)
    2. If truststore is available => use OS trust store
    3. Else => use certifi CA bundle
    """
    env_value = os.getenv("HTTPX_VERIFY", "true").strip().lower()

    if env_value == "false":
        return False  # DEV ONLY fallback

    if truststore is not None:
        return truststore.SSLContext(ssl.PROTOCOL_TLS_CLIENT)

    return certifi.where()