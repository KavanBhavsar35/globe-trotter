"""Email service for transactional emails, user verification, and password resets."""

from __future__ import annotations

from core.email import EmailSender
from core.config import settings


class EmailService:
    def __init__(self):
        self.sender = EmailSender()

    def send_email(
        self,
        to_email: str,
        subject: str,
        html_body: str,
        text_body: str | None = None,
    ) -> bool:
        """Send a transactional email."""
        return self.sender.send(
            to_email=to_email,
            subject=subject,
            html_content=html_body,
            text_content=text_body,
        )

    def send_verification_email(
        self,
        to_email: str,
        token: str,
        verify_url: str | None = None,
    ) -> bool:
        """Send email address verification email."""
        url = verify_url or f"{settings.FRONTEND_URL}/verify?token={token}"
        subject = "Verify your email address"
        html_body = f"""
        <h2>Welcome!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <p><a href="{url}">Verify Email Address</a></p>
        """
        text_body = f"Please verify your email address: {url}"
        return self.send_email(to_email, subject, html_body, text_body)

    def send_password_reset_email(
        self,
        to_email: str,
        token: str,
        reset_url: str | None = None,
    ) -> bool:
        """Send password reset instructions."""
        url = reset_url or f"{settings.FRONTEND_URL}/reset-password?token={token}"
        subject = "Reset your password"
        html_body = f"""
        <h2>Password Reset Request</h2>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <p><a href="{url}">Reset Password</a></p>
        <p>If you did not request this, please ignore this email.</p>
        """
        text_body = f"Reset your password: {url}"
        return self.send_email(to_email, subject, html_body, text_body)
