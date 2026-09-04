"""Point-in-time feature assembly stubs."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict


@dataclass
class FeatureRow:
    match_id: str
    as_of_ts: datetime
    values: Dict[str, Any]

    def assert_no_future_leak(self, kickoff_utc: datetime) -> None:
        if self.as_of_ts >= kickoff_utc:
            raise ValueError(
                f"Feature cutoff {self.as_of_ts.isoformat()} must be before kickoff {kickoff_utc.isoformat()}"
            )


def build_mvp_features(
    match_id: str,
    as_of_ts: datetime,
    elo_home: float,
    elo_away: float,
    rest_days_home: int,
    rest_days_away: int,
    market_home: float | None = None,
    market_draw: float | None = None,
    market_away: float | None = None,
) -> FeatureRow:
    values: Dict[str, Any] = {
        "elo_home": elo_home,
        "elo_away": elo_away,
        "elo_diff": elo_home - elo_away,
        "rest_days_home": rest_days_home,
        "rest_days_away": rest_days_away,
    }
    if market_home is not None and market_draw is not None and market_away is not None:
        values.update(
            {
                "market_1x2_home": market_home,
                "market_1x2_draw": market_draw,
                "market_1x2_away": market_away,
            }
        )
    return FeatureRow(match_id=match_id, as_of_ts=as_of_ts, values=values)
