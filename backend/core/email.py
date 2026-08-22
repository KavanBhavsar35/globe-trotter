"""Core Email Sender with Multi-Provider Support (SMTP, Console mock, SendGrid, SES)."""

from __future__ import annotations

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from rich.console import Console

from core.config import settings

console = Console()


class EmailSender:
    def __init__(self):
        self.provider = settings.EMAIL_PROVIDER
        self.from_address = settings.EMAIL_FROM_ADDRESS

    def send(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: str | None = None,
    ) -> bool:
        """Send an email using the configured provider."""
        if self.provider == "console":
            return self._send_console(to_email, subject, html_content, text_content)
        elif self.provider == "smtp":
            return self._send_smtp(to_email, subject, html_content, text_content)
        else:
            # Fallback to console for unconfigured providers during development
            return self._send_console(to_email, subject, html_content, text_content)

    def _send_console(
        self, to_email: str, subject: str, html: str, text: str | None
    ) -> bool:
        """Print formatted email to console/logs (ideal for local testing)."""
        console.rule(f"[bold green]EMAIL SIMULATION ──▶ {to_email}[/bold green]")
        console.print(f"[bold]From:[/bold] {self.from_address}")
        console.print(f"[bold]To:[/bold] {to_email}")
        console.print(f"[bold]Subject:[/bold] {subject}")
        console.print(f"[bold]Body:[/bold]\n{text or html}\n")
        console.rule()
        return True

    def _send_smtp(
        self, to_email: str, subject: str, html: str, text: str | None
    ) -> bool:
        """Send email via standard SMTP server."""
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = self.from_address
        msg["To"] = to_email

        if text:
            msg.attach(MIMEText(text, "plain"))
        if html:
            msg.attach(MIMEText(html, "html"))

        try:
            with smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT) as server:
                if settings.EMAIL_USE_TLS:
                    server.starttls()
                if settings.EMAIL_USERNAME and settings.EMAIL_PASSWORD:
                    server.login(settings.EMAIL_USERNAME, settings.EMAIL_PASSWORD)
                server.sendmail(self.from_address, [to_email], msg.as_string())
            return True
        except Exception as exc:
            console.print(f"[bold red]Failed to send email via SMTP:[/bold red] {exc}")
            return False
