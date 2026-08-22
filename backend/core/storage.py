"""S3-compatible Object Storage Client Setup."""

from __future__ import annotations

import boto3
from botocore.config import Config
from core.config import settings

_s3_client = None


def get_s3_client():
    """Return a boto3 S3 client configured from application settings."""
    global _s3_client
    if _s3_client is None:
        client_kwargs = {
            "service_name": "s3",
            "region_name": settings.STORAGE_REGION,
            "aws_access_key_id": settings.STORAGE_ACCESS_KEY,
            "aws_secret_access_key": settings.STORAGE_SECRET_KEY,
            "config": Config(s3={"addressing_style": "path"}, signature_version="s3v4"),
        }
        if settings.STORAGE_ENDPOINT_URL:
            client_kwargs["endpoint_url"] = settings.STORAGE_ENDPOINT_URL

        _s3_client = boto3.client(**client_kwargs)
    return _s3_client
