# مصادر البيانات — بطاقات قرار سريعة

## 1) API-Football (api-sports)

- **الاستخدام:** fixtures, results, standings, lineups, injuries, stats, predictions المرجعية
- **MVP:** Pro (~$19/mo) بسبب حد 100 طلب/يوم في المجاني
- **نقاط حرجة:** `/fixtures`, `/fixtures/lineups`, `/fixtures/statistics`, `/injuries`, `/standings`, `/odds`
- **ملاحظة:** تحقق من `coverage.*` لكل دوري قبل الالتزام

## 2) football-data.org

- **الاستخدام:** نتائج نظيفة لدوريات كبرى بتكلفة منخفضة
- **مجاني:** 12 مسابقة، delayed
- **مدفوع:** lineups أعمق مع Deep Data

## 3) Football-Data.co.uk

- **الاستخدام:** backtest تاريخي + opening/closing odds
- **الشكل:** CSV/XLS
- **تحذير:** راجع الشروط قبل الأتمتة التجارية

## 4) StatsBomb Open Data

- **الاستخدام:** بحث xG وأحداث — ليس تغذية حية
- **الالتزام:** User Agreement + attribution
- **الترقية:** عقد StatsBomb/Wyscout/Opta للإنتاج العميق

## 5) The Odds API

- **الاستخدام:** implied probabilities، line movement
- **احسب التكلفة:** regions × markets لكل طلب
- **استخدم ETag:** استجابات 304 مجانية غالباً

## 6) ClubElo / Elo داخلي

- **ClubElo:** مرجع قوة نوادي تاريخي
- **داخلي:** أفضل للتحكم في decay والـ home split

## 7) Open-Meteo

- **الاستخدام:** طقس عند kickoff
- **تجاري:** يحتاج خطة مدفوعة

## 8) Sportmonks (ترقية)

- **متى:** عندما تصبح التشكيلات المتوقعة والـ sidelined حرجة
- **ميزة:** تغطية دوريات أوسع وكيانات حكم/غيابات أوضح

## 9) Betfair Exchange (اختياري متقدم)

- **الاستخدام:** سيولة وحركة أسعار حقيقية
- **يتطلب:** حساب/مفتاح تطبيق وصلاحية قضائية

## 10) مصادر رسمية (RSS / غرف أخبار)

- مواقع الأندية والدوريات والاتحادات
- خزّن عنوان + رابط + وقت — لا تعِد نشر المقال كاملاً

---

### ما لا يُستخدم

| المصدر | السبب |
|--------|--------|
| Dark Web / TOR dumps | غير قانوني وغير موثوق |
| Understat scraping للإنتاج | لا API رسمي؛ robots تمنع الزحف |
| Transfermarkt غير مرخّص | لا endpoint عام مدعوم للمنتجات |
| كسر paywalls لـ Opta/Wyscout | انتهاك عقد وترخيص |
