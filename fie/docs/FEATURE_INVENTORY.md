# FIE Feature Inventory (v0)

قائمة خصائص قابلة للتنفيذ. كل صف يجب أن يملك مصدرًا قبل الانطلاق (point-in-time).

| feature_id | group | description | depends_on | mvp |
|------------|-------|-------------|------------|-----|
| elo_home | strength | Elo قبل المباراة للفريق المضيف | results history | yes |
| elo_away | strength | Elo قبل المباراة للضيف | results history | yes |
| elo_diff | strength | elo_home - elo_away | elo_* | yes |
| attack_home | attack_defense | قوة هجوم مضيف (log) | goals/xG history | yes |
| defense_home | attack_defense | قوة دفاع مضيف | goals/xG history | yes |
| attack_away | attack_defense | قوة هجوم ضيف | goals/xG history | yes |
| defense_away | attack_defense | قوة دفاع ضيف | goals/xG history | yes |
| lambda_home_dc | model | λ من Dixon-Coles | attack/defense + HA | yes |
| lambda_away_dc | model | λ من Dixon-Coles | attack/defense + HA | yes |
| form_pts_5_home | form | نقاط آخر 5 (وزن أسّي) | results | yes |
| form_pts_5_away | form | نقاط آخر 5 للضيف | results | yes |
| form_xg_diff_5_home | form | فرق xG آخر 5 | xG | later |
| rest_days_home | context | أيام منذ آخر مباراة | fixtures | yes |
| rest_days_away | context | أيام منذ آخر مباراة | fixtures | yes |
| travel_km_away | context | مسافة تقريبية للضيف | venues | later |
| home_advantage_league | context | HA خاص بالدوري | historical HA | yes |
| h2h_points_decay | h2h | H2H بوزن زمني منخفض | H2H results | later |
| absence_impact_home | lineup | مجموع replacement_delta | injuries + player contrib | later |
| absence_impact_away | lineup | مجموع replacement_delta | injuries + player contrib | later |
| formation_home_prior | lineup | أداء التشكيل المتوقع | lineups history | later |
| weather_precip_prob | context | احتمال هطول عند الانطلاق | Open-Meteo | later |
| referee_cards_avg | context | متوسط بطاقات الحكم | events | later |
| market_1x2_home | market | implied بعد de-vig | odds snapshot | yes |
| market_1x2_draw | market | implied draw | odds snapshot | yes |
| market_1x2_away | market | implied away | odds snapshot | yes |
| market_move_home | market | Δ implied منذ opening | odds history | later |
| stakes_flag | context | صدارة/هبوط/كأس | standings + competition | later |
| intl_break_flag | context | بعد توقف دولي | FIFA calendar | later |

## قواعد الجودة

1. كل feature تُخزَّن مع `as_of_ts`.
2. ممنوع استخدام نتيجة المباراة نفسها أو أحداثها في تدريب صف تلك المباراة.
3. الغيابات غير المؤكدة تُمرَّر كـ probability ∈ [0,1] وليس boolean صلب.
4. إشارات السوق اختيارية في مسار `market-blind` وإجبارية في مسار `market-aware`.
