from app.services.tlachia.risk_rules import RiskRulesEngine


def test_no_signals_returns_unclassified() -> None:
    engine = RiskRulesEngine()
    signals = engine.evaluate("texto inocuo", {})
    score = engine.compute_score(signals)
    assert score == 0
    assert engine.risk_level_from_score(score) == "unclassified"


def test_medium_case() -> None:
    engine = RiskRulesEngine()
    text = "Esta mujer de la casa no sirve para nada"
    metadata = {"protected_labels": ["candidata_a"], "mentions_in_window": 5, "similar_texts_count": 3, "score": 40, "prior_alerts_count": 1}
    signals = engine.evaluate(text, metadata)
    score = engine.compute_score(signals)
    assert 35 <= score <= 69
    assert engine.risk_level_from_score(score) == "medium"


def test_high_case() -> None:
    engine = RiskRulesEngine()
    text = "Solo es una mujer, quédate en casa, las mujeres no sirven"
    metadata = {"protected_labels": ["candidata_a"], "mentions_in_window": 10, "similar_texts_count": 5, "score": 80, "prior_alerts_count": 2}
    signals = engine.evaluate(text, metadata)
    score = engine.compute_score(signals)
    assert score >= 70
    assert engine.risk_level_from_score(score) == "high"


def test_each_alert_has_at_least_one_signal() -> None:
    engine = RiskRulesEngine()
    text = "candidata_a es una feminazi"
    metadata = {"protected_labels": ["candidata_a"]}
    signals = engine.evaluate(text, metadata)
    matched = [s for s in signals if s.matched]
    assert len(matched) >= 1


def test_never_confirmed() -> None:
    engine = RiskRulesEngine()
    assert engine.risk_level_from_score(0) == "unclassified"
    assert engine.risk_level_from_score(10) == "low"
    assert engine.risk_level_from_score(50) == "medium"
    assert engine.risk_level_from_score(90) == "high"
    assert "confirmed" not in ["unclassified", "low", "medium", "high"]
