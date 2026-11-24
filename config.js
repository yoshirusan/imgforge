/* ------------------------------------------------------------------
   ImgForge frontend config.

   The site is served BY the backend itself (same origin as the API), so
   API_BASE stays empty. Every request goes to the page's own origin:

     https://frenzied-negate-automated.ngrok-free.dev  ->  /api/...

   Do NOT put the tunnel URL here again. A hardcoded absolute URL is what
   broke the site repeatedly when a tunnel address changed. Empty is
   always correct for same-origin deployment.
   ------------------------------------------------------------------ */

window.IMGFORGE_CONFIG = {
  API_BASE: "",

  // Seconds the rewarded ad must stay visible before the claim button unlocks.
  // Match this to your ad network's minimum view duration.
  AD_MIN_SECONDS: 15,

  // Real Adsterra units are now inline in index.html, so nothing is a
  // placeholder any more.
  SHOW_PLACEHOLDER_ADS: false,

  /* Floating Adsterra units. These render as overlays and can cover the form
     on a phone. Turn any of them off by setting it to false - no HTML editing
     needed, just refresh. The banner and in-page push always stay, because
     they sit in the page flow and never overlap anything.

       socialBar  - floating bar pinned to the viewport. Usually the culprit
                    when the Generate button disappears behind an ad.
       popunder   - opens behind the page on click. Does not affect layout.
  */
  ADS: {
    socialBar: true,
    popunder: true
  }
};