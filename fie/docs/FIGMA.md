# FIE — Figma Design

**ملف Figma:** [FIE — Football Intelligence Engine](https://www.figma.com/design/JzfocA8oM2m6MjO39O5JW7)

## الاتجاه البصري

| العنصر | القرار |
|--------|--------|
| ألوان | Pitch green `#0A2E24` + Signal lime `#B8F000` + Teal بيانات `#1C9B8E` |
| خلفية | Mist canvas `#E9EFEA` (ليست كريمية دافئة) |
| خطوط | **Barlow Condensed** للعلامة والعناوين · **IBM Plex Sans** للنص |
| جو | تدرج ملعب ليلي في الـ Hero + قوس خفيف — بدون بنفسجي أو توهج مفرط |

## الصفحات في الملف

| الصفحة | المحتوى |
|--------|---------|
| `00 — Foundations` | Variables + مكوّنات `Button/Primary` · `Button/Ghost` · `Match/FixtureRow` |
| `01 — Screens` | الشاشات |

## الشاشات

1. **Landing / Desktop** — Hero كامل العرض، العلامة FIE بطلة المشهد، جملة واحدة، مجموعة CTA
2. **Landing / Mobile** — نفس الهوية على 390pt
3. **Match Center / Desktop** — قائمة مباريات تفاعلية مع **شعارات الفرق**
4. **Match Intelligence / Desktop** — توقع + شعارات كبيرة + **صور لاعبين مؤثرين**
5. **Methodology / Desktop** — خط أنابيب Elo → Dixon-Coles → LightGBM → معايرة
6. **Data States / Desktop [HIDDEN]** — كتالوج داخلي: ناقصة / XI غير مؤكد / XI مؤكد / متدهور

## الوسائط

شعارات وصور تجريبية من `media.api-sports.io` مدمجة في Figma والويب (`fie/web/assets/`).  
في الإنتاج: تغذية مرخّصة فقط — راجع `fie/web/assets/README.md`.

## مكوّن حالات البيانات

`DataState/Banner` (component set):
- `State=incomplete`
- `State=xi-unconfirmed`
- `State=xi-confirmed`
- `State=degraded`

## واجهة ويب مخفية (`fie/web`)

المسارات التالية **غير مدرجة** في التنقّل العام و`noindex`:

| المسار | الفتح |
|--------|------|
| `internal/methodology.html` | يتطلب `?internal=1` |
| `internal/data-states.html` | يتطلب `?internal=1` |

معاينة حالة على بطاقة المباراة: `match.html?state=xi-unconfirmed`

## Tokens (Variables)

مجموعة `FIE / Foundations`:
- `color/*` — canvas, surface, pitch, signal, teal, ink, on-dark, line
- `space/*` — 8…64
- `radius/*` — sm/md/lg

## الخطوة التالية في التصميم

- تنويع نسب الاحتمال لكل مباراة في FixtureRow (variants أو overrides)
- حالات Live لاحقاً
- ربط Code Connect بعد استقرار الواجهة
