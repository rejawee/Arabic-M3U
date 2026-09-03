# FIE — Football Intelligence Engine

نظام تحليل وتوقع مباريات كرة القدم: بيانات تاريخية، قوة فرق، هجوم/دفاع، تشكيلات وغيابات، سياق، واستخبارات خارجية **شرعية**.

## الوثائق

| الملف | المحتوى |
|------|---------|
| [docs/FIE_INTELLIGENCE_BLUEPRINT.md](./docs/FIE_INTELLIGENCE_BLUEPRINT.md) | المخطط الشامل: بيانات، نماذج، مراحل |
| [docs/DATA_SOURCES.md](./docs/DATA_SOURCES.md) | بطاقات مزودي البيانات وقرار MVP |
| [docs/FEATURE_INVENTORY.md](./docs/FEATURE_INVENTORY.md) | قائمة الخصائص القابلة للتنفيذ |
| [schemas/prediction.schema.json](./schemas/prediction.schema.json) | عقد JSON للتوقع |
| [data/samples/prediction.example.json](./data/samples/prediction.example.json) | مثال بطاقة مباراة |

## الهيكل

```
fie/
├── docs/
├── schemas/
├── data/samples/
├── engine/
│   ├── ingest/     # id_map والموصلات
│   ├── features/   # خصائص point-in-time
│   └── models/     # Elo + Dixon-Coles baseline
├── api/            # FastAPI stub
└── web/            # واجهة لاحقاً
```

## تشغيل الـ API (مسودة)

```bash
cd fie
python -m venv .venv && source .venv/bin/activate
pip install fastapi uvicorn
uvicorn api.main:app --reload --port 8080
```

- Health: `GET /health`
- عينة توقع: `GET /v1/predictions/sample`

## مسار MVP المقترح

1. دوري واحد + نتائج تاريخية + Elo + Dixon-Coles  
2. Odds snapshots + calibration  
3. lineups / injuries  
4. واجهة بطاقة مباراة + شرح العوامل  

## ملاحظة قانونية

لا تُستخدم مصادر غير مرخّصة أو شبكات مظلمة. التوقعات احتمالات إحصائية وليست ضمان نتائج.
