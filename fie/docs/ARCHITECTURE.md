# FIE Architecture One-Pager

```
┌─────────────────────────────────────────────────────────────┐
│                         Clients                             │
│              Web cards · Mobile · Internal tools            │
└────────────────────────────┬────────────────────────────────┘
                             │ REST /v1/predictions/*
┌────────────────────────────▼────────────────────────────────┐
│                        API (FastAPI)                        │
│         auth · cache · model version · explanations         │
└───────────────┬─────────────────────────────┬───────────────┘
                │                             │
┌───────────────▼──────────────┐   ┌──────────▼───────────────┐
│     Online Feature Store     │   │     Model Registry       │
│  PIT features as_of_ts       │   │  elo+dc · lgbm · calib   │
└───────────────▲──────────────┘   └──────────▲───────────────┘
                │                             │
┌───────────────┴─────────────────────────────┴───────────────┐
│                    Batch / Train Jobs                       │
│   walk-forward train · calibration · weekly evaluation      │
└───────────────▲─────────────────────────────────────────────┘
                │
┌───────────────┴─────────────────────────────────────────────┐
│                     Normalize + IdMap                       │
└──▲────────▲────────▲────────▲────────▲────────▲─────────────┘
   │        │        │        │        │        │
Fixtures Results Lineups Injuries  Odds   Weather/News
(API-FB) (hist)  (API-FB) (API)  (OddsAPI) (legal feeds)
```

## Cutoff schedule

| Trigger | Purpose |
|---------|---------|
| Schedule publish | first prior |
| T-24h | form + market open |
| T-6h | injuries refresh |
| T-60m | expected/official XI |
| Post-match | feedback + Elo update |
