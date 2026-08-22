"""Object Storage Service for managing files, uploads, and presigned URLs."""

from __future__ import annotations

import io
import uuid
from typing import Any
from botocore.exceptions import ClientError

from core.config import settings
from core.storage import get_s3_client


class StorageService:
    def __init__(self):
        self.client = get_s3_client()
        self.bucket = settings.STORAGE_BUCKET

    def upload_file(
        self,
        file_bytes: bytes,
        filename: str,
        content_type: str = "application/octet-stream",
        folder: str = "uploads",
    ) -> str:
        """Upload raw bytes to S3 and return the object key."""
        ext = filename.split(".")[-1] if "." in filename else "bin"
        file_key = (
            f"{folder}/{uuid.uuid4()}.{ext}" if folder else f"{uuid.uuid4()}.{ext}"
        )

        self.client.upload_fileobj(
            io.BytesIO(file_bytes),
            self.bucket,
            file_key,
            ExtraArgs={"ContentType": content_type},
        )
        return file_key

    def download_file(self, file_key: str) -> bytes:
        """Download raw object bytes from S3."""
        buffer = io.BytesIO()
        self.client.download_fileobj(self.bucket, file_key, buffer)
        buffer.seek(0)
        return buffer.read()

    def generate_presigned_upload_url(
        self,
        filename: str,
        content_type: str = "application/octet-stream",
        expires_in: int = 3600,
        folder: str = "uploads",
    ) -> dict[str, Any]:
        """Generate a presigned S3 PUT URL for direct frontend upload."""
        ext = filename.split(".")[-1] if "." in filename else "bin"
        file_key = (
            f"{folder}/{uuid.uuid4()}.{ext}" if folder else f"{uuid.uuid4()}.{ext}"
        )

        url = self.client.generate_presigned_url(
            ClientMethod="put_object",
            Params={
                "Bucket": self.bucket,
                "Key": file_key,
                "ContentType": content_type,
            },
            ExpiresIn=expires_in,
        )
        return {
            "upload_url": url,
            "file_key": file_key,
            "expires_in": expires_in,
        }

    def generate_presigned_download_url(
        self, file_key: str, expires_in: int = 3600
    ) -> str:
        """Generate a presigned GET URL to view/download a private file."""
        return self.client.generate_presigned_url(
            ClientMethod="get_object",
            Params={
                "Bucket": self.bucket,
                "Key": file_key,
            },
            ExpiresIn=expires_in,
        )

    def delete_file(self, file_key: str) -> bool:
        """Delete an object from S3."""
        try:
            self.client.delete_object(Bucket=self.bucket, Key=file_key)
            return True
        except ClientError:
            return False
