/**
 * FIE web config
 * Internal methodology + data-states routes stay hidden from public nav.
 * Unlock with ?internal=1 or localStorage FIE_INTERNAL=1
 */
window.FIE = {
  version: "0.1.0",
  showInternalNav: false,
  internalParam: "internal",
  isInternalUnlocked() {
    try {
      const q = new URLSearchParams(window.location.search);
      if (q.get(this.internalParam) === "1") {
        localStorage.setItem("FIE_INTERNAL", "1");
        return true;
      }
      return localStorage.getItem("FIE_INTERNAL") === "1";
    } catch (_) {
      return false;
    }
  },
  guardInternalPage() {
    if (this.isInternalUnlocked()) {
      document.documentElement.dataset.fieInternal = "open";
      return true;
    }
    document.documentElement.dataset.fieInternal = "locked";
    return false;
  },
};
