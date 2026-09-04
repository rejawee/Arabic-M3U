/**
 * Data-state helpers — used by Match Intelligence.
 * Internal catalog lives at /internal/data-states.html (hidden from public nav).
 */
(function () {
  const STATES = {
    incomplete: {
      title: "بيانات ناقصة",
      detail: "إحصاءات أو أسعار سوق غير مكتملة — الثقة مخفّضة تلقائياً.",
      conf: "ثقة منخفضة · 42%",
    },
    "xi-unconfirmed": {
      title: "XI غير مؤكد",
      detail: "التشكيلة المتوقعة فقط — أعد التوليد عند إعلان التشكيلة الرسمية.",
      conf: "ثقة متوسطة · 58%",
    },
    "xi-confirmed": {
      title: "XI مؤكد",
      detail: "التشكيلة الرسمية مدمجة في التوقع قبل الانطلاق.",
      conf: "ثقة عالية · 78%",
    },
    degraded: {
      title: "وضع متدهور",
      detail: "مصدر تغذية متأخر أو غير متاح — العرض من آخر لقطة صالحة.",
      conf: "ثقة منخفضة · 35%",
    },
  };

  window.FIE_DATA_STATES = STATES;

  function applyState(stateKey) {
    const meta = STATES[stateKey];
    if (!meta) return;
    const slot = document.getElementById("state-slot");
    const title = document.getElementById("state-title");
    const detail = document.getElementById("state-detail");
    const chip = document.getElementById("conf-chip");
    if (!slot || !title || !detail) return;
    slot.hidden = false;
    slot.dataset.state = stateKey;
    title.textContent = meta.title;
    detail.textContent = meta.detail;
    if (chip) chip.textContent = meta.conf;
  }

  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get("state");
  if (fromQuery && STATES[fromQuery]) {
    applyState(fromQuery);
  }

  window.FIEApplyDataState = applyState;
})();
