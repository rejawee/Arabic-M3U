# FIE — Football Intelligence Engine

## مخطط الاستخبارات والبيانات والمنتج

> وثيقة بحث وتخطيط تشغيلية لاستخراج أهم المعلومات والبيانات اللازمة لصناعة النظام.
> جميع المصادر المذكورة هنا **شرعية ومرخّصة أو مفتوحة بشروط واضحة**. لا يُعتمد على بيانات مسروقة أو شبكات مظلمة أو كسر حماية لمصادر مدفوعة.

---

## 1) الرؤية

**FIE** نظام تحليل وتوقع لمباريات كرة القدم يجمع:

| الطبقة | الدور |
|--------|--------|
| البيانات التاريخية | نتائج، إحصاءات، xG، أوضاع سابقة |
| قوة الفرق | Elo/Glicko، هجوم/دفاع Bayesian |
| الأداء الهجومي والدفاعي | xG، shots، PPDA، set-pieces |
| التشكيلات والغيابات | XI، تشكيل، إصابات، إيقافات |
| سياق المباراة | راحة، سفر، أهمية، طقس، حكم |
| استخبارات خارجية | أخبار رسمية، حركة السوق، إشارات تقويم |

الهدف التشغيلي: احتمالات **معايرة** (calibrated) لأسواق 1X2، النتيجة الدقيقة، Over/Under، BTTS — مع شرح العوامل وثقة التوقع، وليس «نصيحة رهان» كمنتج أساسي.

---

## 2) ما نحتاجه فعلاً (أولوية البيانات)

### P0 — لا يعمل النظام بدونها

| الكيان | الحقول الحرجة | مصدر مقترح للـ MVP |
|--------|----------------|---------------------|
| مسابقة / موسم | `competition_id`, `season`, قواعد النقاط | API-Football أو football-data.org |
| مباراة | وقت الانطلاق، ملعب، حالة، نتيجة نهائية | نفس المصدر |
| فريق | معرفات ثابتة، منزل/خارج | نفس المصدر |
| تاريخ النتائج | ≥ 5 مواسم للدوري المستهدف | football-data.co.uk (CSV) + مزود API |
| قوة نسبية | Elo قبل المباراة | ClubElo أو حساب داخلي |

### P1 — جودة التوقع تقفز معها

| الكيان | الحقول | مصدر |
|--------|---------|------|
| إحصاءات المباراة | shots, SOT, possession, corners, cards | API-Football / Sportmonks |
| xG / أحداث | shots + xG، مواقع تسديد | StatsBomb Open (بحث) → تجاري لاحقاً |
| تشكيلات | XI، مقاعد، formation | API-Football lineups |
| غيابات | إصابة / إيقاف / سبب / تاريخ العودة | `/injuries` أو Sportmonks sidelined |
| أسعار سوق | opening / closing، 1X2 و O/U | The Odds API أو CSV التاريخي |

### P2 — طبقة الاستخبارات السياقية (البديل الذكي، ليس Dark Web)

| الإشارة | لماذا مهمة | مصدر قانوني |
|---------|------------|-------------|
| أيام الراحة / ازدحام الجدول | تدوير وتراجع الأداء | حساب من fixtures |
| مسافة السفر / فرق التوقيت | proxy للإجهاد | إحداثيات الملعب + timezone |
| الطقس عند الانطلاق | يؤثر على الوتيرة والكرات الثابتة | Open-Meteo (خطة تجارية للاستخدام التجاري) |
| ميول الحكم | بطاقات / ركلات جزاء | من أحداث تاريخية مرخّصة |
| تقويم الفيفا / توقفات دولية | غياب لاعبين / إرهاق | تقويم FIFA الرسمي |
| انتقالات / تسجيل | تغيّر جودة التشكيلة | تغذية المزود أو إعلانات رسمية |
| تغذية النادي الرسمية | تأكيد غيابات متأخرة | RSS / غرفة أخبار النادي |
| حركة الخطوط (line movement) | توافق/تعارض مع النموذج | The Odds API / Betfair Exchange |

**مرفوض صراحة:** TOR، أسواق مسروقة، scraped paywalls، Transfermarkt غير مرخّص، Understat scraping للإنتاج التجاري، أي بيانات غير عامة.

---

## 3) مصفوفة المزودين (ملخص قرار)

| المرحلة | الحزمة الموصى بها | التكلفة التقريبية |
|---------|-------------------|-------------------|
| بحث / نموذج أولي غير تجاري | football-data.org Free + StatsBomb Open + Football-Data.co.uk + Open-Meteo non-commercial | منخفضة / مجانية |
| MVP تجاري (1–5 دوريات) | **API-Football Pro** + **The Odds API** + Open-Meteo commercial + تغذية أندية رسمية | ~$50–80/شهر |
| إنتاج متقدم | Sportmonks أو Opta/Wyscout/StatsBomb تجاري + Odds Business و/أو Betfair | حسب العقد |

**قرار MVP المقترح لـ FIE:**  
`API-Football Pro` كمصدر أساسي للمباريات/التشكيلات/الإصابات + `The Odds API` للسوق + Elo داخلي أو ClubElo + حساب سياق (راحة/سفر) + Open-Meteo.

---

## 4) تصنيف الـ Features (محرك الذكاء)

### أ) قوة الفريق
- Elo / Glicko (إجمالي، منزل، خارج) مع decay زمني
- attack / defense ratings (log-space)
- strength of schedule
- فارق المدرب وتغيّره

### ب) هجوم / دفاع
- goals، xG، npxG، xGA لكل 90
- shot quality، big chances
- PPDA / ضغط دفاعي عند توفر البيانات
- set-piece xG for/against
- clean sheet rate، game-state splits

### ج) فورمة
- نوافذ 3 / 5 / 10 مع وزن أسّي
- form معدّل بقوة الخصم
- اتجاه الأداء (slope) وليس المتوسط فقط

### د) H2H
- وزن منخفض + decay قوي (إشارة ثانوية)
- أنماط أسلوب (ضغط عالٍ vs بناء لعب ضعيف)

### هـ) تشكيلة وغيابات
- احتمال مشاركة اللاعب
- `replacement_delta` = قيمة الغائب − البديل المتوقع
- تأثير غياب حارس / قلب دفاع / صانع لعب / رأس حربة
- formation probability وأداء الفريق بهذا التشكيل

### و) سياق
- home advantage خاص بالدوري/الملعب
- rest days، travel km، timezone offset
- أهمية المباراة (صدارة / هبوط / كأس)
- طقس، حكم (مع regularization)

### ز) سوق
- implied probs بعد إزالة الـ vig
- opening→current movement
- نموذج market-blind ونموذج market-aware منفصلان

### ح) استخبارات خارجية
- أخبار رسمية بـ confidence score
- expected lineup vs official lineup
- flags: تغيّر مدرب، نافذة انتقالات، توقف دولي

---

## 5) معمارية النماذج

```
Elo / Glicko  ──┐
                ├──► Dixon-Coles / Bivariate Poisson ──► scoreline matrix
xG + Features ──┤                                              │
                ├──► LightGBM / XGBoost (1X2, O/U, BTTS)       │
Market (opt) ───┘                    │                         │
                                     ▼                         ▼
                              Calibration (Isotonic / Platt)
                                     │
                                     ▼
                    Outputs: 1X2 · λ · scorelines · O/U · BTTS · confidence · SHAP
```

| الطبقة | الدور |
|--------|--------|
| Baseline | Elo + Dixon-Coles → λ_home / λ_away ومصفوفة نتائج |
| ML | LightGBM يصحّح/يتنبأ فوق مخرجات Baseline |
| Calibration | Isotonic عند كفاية العينات؛ Platt للأسواق الثنائية |
| Ensemble (لاحق) | stacking بعد عدة مواسم ودوريات |

**قواعد ذهبية**
- تقسيم زمني فقط (walk-forward) — ممنوع random split
- point-in-time: لا تسريب معلومات بعد kickoff
- السوق معيار قوي؛ لا تفترض «التفوق على الكlosing line» كشرط إطلاق

---

## 6) خط أنابيب البيانات

```
Ingest → Normalize & Entity Resolve → Validate
      → Feature Store (offline + online, PIT-correct)
      → Train / Calibrate → Model Registry
      → Serve (T-24h, T-6h, T-60m)
      → Feedback (نتائج، XI فعلي، closing odds) → Retrain
```

### جداول أساسية (Canonical Schema)

1. `competitions`, `seasons`, `teams`, `players`
2. `fixtures` (+ status, kickoff_utc, venue)
3. `results` (FT, HT)
4. `match_stats`, `match_events`, `xg_events`
5. `lineups`, `formations`
6. `absences` (injury/suspension)
7. `odds_snapshots` (book, market, ts)
8. `weather_snapshots`
9. `features_match` (نسخة feature + cutoff_ts)
10. `predictions` (model_version + outputs)
11. `id_map` (مزود → معرف داخلي)

---

## 7) منتجات الإخراج للمستخدم

| المنتج | الوصف |
|--------|--------|
| Preview بطاقة المباراة | احتمالات 1X2 + ثقة + أهم 3 عوامل |
| Expected goals | λ_home / λ_away |
| Top scorelines | أعلى 5 نتائج من المصفوفة |
| Markets | O/U 2.5، BTTS |
| Intelligence brief | غيابات مؤثرة + سياق + تحذير بيانات ناقصة |
| Model card | نسخة النموذج، cutoff، مصادر |

صيغة JSON المرجعية: `schemas/prediction.schema.json` و`data/samples/prediction.example.json`.

---

## 8) تقييم الجودة

| المقياس | الاستخدام |
|---------|-----------|
| Log-loss | أساسي لـ 1X2 / O/U / BTTS |
| Brier | تفسير جودة الاحتمال |
| ECE / Calibration curve | هل 60% ≈ 60% فعلاً؟ |
| RPS | 1X2 كترتيب |
| vs de-vigged market | معيار كفاءة |
| ROI vs closing (ثانوي) | مراقبة اقتصادية فقط مع افتراضات تنفيذ واقعية |

---

## 9) خارطة بناء مرحلية

### المرحلة 0 — هذا المستند + الهيكل
- مخطط البيانات، مصادر، نماذج، عقود API
- Schema JSON ومجلد `fie/`

### المرحلة 1 — MVP دوري واحد (Pre-match)
- دوري مستهدف مقترح: Premier League أو Saudi Pro League (حسب الجمهور)
- Ingest نتائج + fixtures + Elo + Odds تاريخية
- Dixon-Coles + Elo + LightGBM خفيف
- API بسيط + واجهة بطاقة مباراة
- لوحة calibration

### المرحلة 2 — غيابات وتشكيلات وسياق
- injuries/lineups قبل الانطلاق
- rest/travel/weather
- explanations (SHAP + عوامل Poisson)

### المرحلة 3 — متعدد الدوريات
- entity resolution عبر الدوريات
- hierarchical pooling للدوريات الصغيرة
- market-aware ensemble

### المرحلة 4 — Live / In-play
- event stream مرخّص
- إعادة تقدير λ حسب الدقيقة والحالة
- فصل نموذج pre-match عن in-play

---

## 10) وحدات المنتج التقنية (مستودع `fie/`)

```
fie/
├── docs/                 ← وثائق التخطيط
├── schemas/              ← عقود JSON
├── data/samples/         ← أمثلة
├── engine/
│   ├── ingest/           ← موصلات المزودين
│   ├── features/         ← هندسة الخصائص
│   └── models/           ← Elo, Dixon-Coles, ML
├── api/                  ← خدمة التوقعات
└── web/                  ← واجهة التحليل
```

### Stack مقترح للـ MVP
- **Backend:** Python 3.11+, FastAPI, PostgreSQL, Redis
- **ML:** pandas, scipy, scikit-learn, lightgbm
- **Jobs:** APScheduler أو Celery + cron للتحديثات T-24/T-6/T-60
- **Frontend:** React/Vite أو صفحة ثابتة أولاً لبطاقات المباريات
- **Observability:** سجل predictions + نتائج فعلية لمقارنة أسبوعية

---

## 11) مخاطر ومتطلبات قانونية

1. حقوق إعادة التوزيع والتدريب على بيانات المزود — راجع العقد قبل الإطلاق التجاري.
2. لا تنشر مقالات كاملة؛ اقتبس metadata + رابط.
3. الإفصاح: التوقعات احتمالات إحصائية وليست ضماناً.
4. حدود الدقة الواقعية في الدوريات الكبرى لـ 1X2 غالباً ~48–55% accuracy؛ القيمة في **المعايرة** والحافة مقابل السوق إن وُجدت.
5. الغيابات المتأخرة أكبر مصدر خطأ قبل الانطلاق بساعة.

---

## 12) قائمة التحقق لإطلاق MVP

- [ ] اختيار دوري واحد + مواسم تاريخية كافية
- [ ] مفاتيح API-Football + Odds + تخزين آمن
- [ ] جدول `id_map` مستقر
- [ ] Elo + Dixon-Coles يعملان offline على backtest
- [ ] walk-forward log-loss ≤ سوق de-vigged ± هامش مقبول
- [ ] endpoint `/predict/{fixture_id}`
- [ ] بطاقة مباراة تعرض probs + confidence + factors
- [ ] سياسة خصوصية وإخلاء مسؤولية

---

## 13) خلاصة القرار

| السؤال | الجواب |
|--------|--------|
| أغلى أصل؟ | بيانات نظيفة قبل الانطلاق + عدم تسريب مستقبلي |
| أقوى Baseline؟ | Elo + Dixon-Coles |
| أقوى ترقية MVP؟ | lineups/injuries + odds snapshots |
| أخطر فخ؟ | scrape غير قانوني أو الاعتماد على «دقة وهمية» بدون calibration |
| أول دوري؟ | واحد فقط حتى يثبت الـ pipeline |

**FIE لا يُبنى على «سر مظلم» — يُبنى على طبقة بيانات مرخّصة + نماذج معايرة + استخبارات سياقية قانونية في اللحظات التي يخطئ فيها السوق أو تتأخر فيها البيانات الرسمية.**
