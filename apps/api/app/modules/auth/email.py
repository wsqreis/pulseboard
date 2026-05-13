from __future__ import annotations

from dataclasses import dataclass


@dataclass
class SentEmail:
    to: str
    subject: str
    body: str


class DevEmailGateway:
    def __init__(self) -> None:
        self.outbox: list[SentEmail] = []

    def send(self, to: str, subject: str, body: str) -> None:
        self.outbox.append(SentEmail(to=to, subject=subject, body=body))


email_gateway = DevEmailGateway()
