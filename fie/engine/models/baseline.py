"""FIE baseline models: Elo and Dixon-Coles stubs for MVP scaffolding."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Iterable, Tuple

import math


@dataclass
class EloState:
    ratings: Dict[str, float]
    k: float = 20.0
    home_advantage: float = 60.0
    initial: float = 1500.0

    def get(self, team_id: str) -> float:
        return self.ratings.get(team_id, self.initial)

    def expected(self, home_id: str, away_id: str) -> float:
        rh = self.get(home_id) + self.home_advantage
        ra = self.get(away_id)
        return 1.0 / (1.0 + 10 ** ((ra - rh) / 400.0))

    def update(self, home_id: str, away_id: str, home_goals: int, away_goals: int) -> None:
        if home_goals > away_goals:
            score = 1.0
        elif home_goals < away_goals:
            score = 0.0
        else:
            score = 0.5
        exp = self.expected(home_id, away_id)
        delta = self.k * (score - exp)
        self.ratings[home_id] = self.get(home_id) + delta
        self.ratings[away_id] = self.get(away_id) - delta


def poisson_pmf(k: int, lam: float) -> float:
    if lam <= 0:
        return 1.0 if k == 0 else 0.0
    return math.exp(-lam) * (lam**k) / math.factorial(k)


def dixon_coles_tau(hg: int, ag: int, lam_h: float, lam_a: float, rho: float) -> float:
    if hg == 0 and ag == 0:
        return 1.0 - lam_h * lam_a * rho
    if hg == 0 and ag == 1:
        return 1.0 + lam_h * rho
    if hg == 1 and ag == 0:
        return 1.0 + lam_a * rho
    if hg == 1 and ag == 1:
        return 1.0 - rho
    return 1.0


def scoreline_matrix(
    lam_h: float,
    lam_a: float,
    rho: float = -0.05,
    max_goals: int = 6,
) -> Dict[str, float]:
    raw: Dict[str, float] = {}
    total = 0.0
    for h in range(max_goals + 1):
        for a in range(max_goals + 1):
            p = (
                dixon_coles_tau(h, a, lam_h, lam_a, rho)
                * poisson_pmf(h, lam_h)
                * poisson_pmf(a, lam_a)
            )
            key = f"{h}-{a}"
            raw[key] = max(p, 0.0)
            total += raw[key]
    if total <= 0:
        return raw
    return {k: v / total for k, v in raw.items()}


def outcome_probs(matrix: Dict[str, float]) -> Tuple[float, float, float]:
    home = draw = away = 0.0
    for key, p in matrix.items():
        h, a = map(int, key.split("-"))
        if h > a:
            home += p
        elif h == a:
            draw += p
        else:
            away += p
    return home, draw, away


def fit_attack_defense(
    matches: Iterable[Tuple[str, str, int, int]],
    home_advantage: float = 0.25,
) -> Dict[str, Dict[str, float]]:
    """Very small heuristic prior for scaffolding (not full MLE).

    Returns per-team attack/defense multipliers around 1.0.
    Replace with proper Dixon-Coles MLE in the training pipeline.
    """
    scored: Dict[str, list] = {}
    conceded: Dict[str, list] = {}
    for home, away, hg, ag in matches:
        scored.setdefault(home, []).append(hg)
        scored.setdefault(away, []).append(ag)
        conceded.setdefault(home, []).append(ag)
        conceded.setdefault(away, []).append(hg)

    teams = set(scored) | set(conceded)
    league_avg = 1.3
    out: Dict[str, Dict[str, float]] = {}
    for team in teams:
        att = (sum(scored.get(team, [league_avg])) / max(len(scored.get(team, [1])), 1)) / league_avg
        deff = (sum(conceded.get(team, [league_avg])) / max(len(conceded.get(team, [1])), 1)) / league_avg
        out[team] = {"attack": att, "defense": deff, "home_advantage": home_advantage}
    return out


def expected_goals(home: Dict[str, float], away: Dict[str, float]) -> Tuple[float, float]:
    lam_h = home["attack"] * away["defense"] * (1.0 + home.get("home_advantage", 0.25))
    lam_a = away["attack"] * home["defense"]
    return lam_h, lam_a
