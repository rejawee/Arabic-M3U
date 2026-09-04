# FIE — Football Intelligence Engine

نظام تحليل وتوقع مباريات كرة القدم: بيانات تاريخية، قوة فرق، هجوم/دفاع، تشكيلات وغيابات، سياق، واستخبارات خارجية **شرعية**.

## التصميم (Figma)

**الملف:** https://www.figma.com/design/JzfocA8oM2m6MjO39O5JW7

التفاصيل: [docs/FIGMA.md](./docs/FIGMA.md)

## الوثائق

| الملف | المحتوى |
|------|---------|
| [docs/FIE_INTELLIGENCE_BLUEPRINT.md](./docs/FIE_INTELLIGENCE_BLUEPRINT.md) | المخطط الشامل: بيانات، نماذج، مراحل |
| [docs/FIGMA.md](./docs/FIGMA.md) | تصميم الواجهة في Figma |
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
│   ├── ingest/
│   ├── features/
│   └── models/
├── api/
└── web/            # واجهة ثابتة أولية
    ├── index.html / match-center.html / match.html
    └── internal/   # مخفي عن التنقّل العام
```

## تشغيل الواجهة

```bash
cd fie/web && python3 -m http.server 4174
```

ثم http://localhost:4174

### مسارات داخلية مخفية

غير مدرجة في الـ nav العام، و`noindex`:

- http://localhost:4174/internal/methodology.html?internal=1
- http://localhost:4174/internal/data-states.html?internal=1
- معاينة حالة: http://localhost:4174/match.html?state=degraded

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
