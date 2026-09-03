from engine.models.baseline import (
    EloState,
    expected_goals,
    fit_attack_defense,
    outcome_probs,
    scoreline_matrix,
)

elo = EloState(ratings={"A": 1600, "B": 1500})
assert 0.5 < elo.expected("A", "B") < 1.0

matches = [("A", "B", 2, 1), ("B", "A", 0, 0), ("A", "C", 3, 1), ("C", "B", 1, 1)]
ratings = fit_attack_defense(matches)
lam_h, lam_a = expected_goals(ratings["A"], ratings["B"])
matrix = scoreline_matrix(lam_h, lam_a)
home, draw, away = outcome_probs(matrix)
assert abs(home + draw + away - 1.0) < 1e-6
print("baseline_ok", round(home, 3), round(draw, 3), round(away, 3))
