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
3. **Match Center / Desktop** — قائمة مباريات تفاعلية (صفوف قابلة للنقر)
4. **Match Intelligence / Desktop** — بطاقة توقع: 1X2، ثقة، أسواق، عوامل تفسير

## Tokens (Variables)

مجموعة `FIE / Foundations`:
- `color/*` — canvas, surface, pitch, signal, teal, ink, on-dark, line
- `space/*` — 8…64
- `radius/*` — sm/md/lg

## الخطوة التالية في التصميم

- تنويع نسب الاحتمال لكل مباراة في FixtureRow (variants أو overrides)
- شاشة Methodology
- حالات: بيانات ناقصة / XI مؤكد / Live لاحقاً
- ربط Code Connect بعد بناء الواجهة في الكود
