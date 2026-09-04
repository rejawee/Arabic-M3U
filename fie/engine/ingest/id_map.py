"""Canonical entity helpers for provider ID mapping."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, Optional


@dataclass
class IdMap:
    """Maps external provider IDs to stable internal IDs."""

    teams: Dict[str, str] = field(default_factory=dict)
    players: Dict[str, str] = field(default_factory=dict)
    fixtures: Dict[str, str] = field(default_factory=dict)

    def resolve_team(self, provider: str, external_id: str) -> Optional[str]:
        return self.teams.get(f"{provider}:{external_id}")

    def register_team(self, provider: str, external_id: str, internal_id: str) -> None:
        self.teams[f"{provider}:{external_id}"] = internal_id
