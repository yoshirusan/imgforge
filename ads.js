/* ------------------------------------------------------------------
   Ad integration. This is the ONLY frontend file you edit to put real
   ads on the site.

   The page already has four slots with data-ad attributes:
     top-leaderboard   (728x90, above the fold)
     below-generate    (336x280, in content)
     sidebar           (300x600)
     rewarded          (the modal that grants credits)

   To go live:
     1. Get your network's loader <script>, paste it in index.html
        (just before <script src="ads.js"> ... actually before app.js).
     2. Fill SLOT_IDS below with your unit IDs.
     3. Set enabled: true.
     4. Set SHOW_PLACEHOLDER_ADS: false in config.js.

   THE IMPORTANT PART: credits granted by the modal are only as trustworthy
   as your verification. See docs/ADS-SETUP.md.
   ------------------------------------------------------------------ */
(function () {
  "use strict";

  var SLOT_IDS = {
    "top-leaderboard": "",
    "below-generate": "",
    "sidebar": "",
    "rewarded": ""
  };

  var enabled = false;   // flip to true once SLOT_IDS are filled and the loader is in index.html

  function placeholderVisible(on) {
    document.querySelectorAll(".ad-slot .ad-body").forEach(function (el) {
      el.style.visibility = on ? "visible" : "hidden";
    });
  }

  /** Replace a slot's inner markup with whatever the network needs. */
  function mount(name, html) {
    var slot = document.querySelector('[data-ad="' + name + '"]');
    if (!slot) return null;
    var body = slot.querySelector(".ad-body");
    if (body) body.innerHTML = html;
    return slot;
  }

  window.ImgForgeAds = {
    /**
     * Called the moment the rewarded modal opens.
     * Put your network's "show rewarded ad" call here.
     * Example (varies by network):
     *   MyNetwork.showRewarded(SLOT_IDS.rewarded, {
     *     onComplete: function () { ImgForgeAds.rewardFinished(); }
     *   });
     */
    onRewardedStart: function () {
      // no network yet - the modal's local countdown stands in for the ad
    },

    /**
     * Only needed if your network can verify server-side. When it can,
     * do NOT let the browser claim credits: switch the backend to
     * IMGFORGE_AD_MODE=ssv and point the network's postback at /api/ad/ssv.
     */
    rewardFinished: function () {
      var btn = document.getElementById("claim-btn");
      if (btn) btn.disabled = false;
    },

    /** Render all slot units once the page is ready. */
    mountSlots: function () {
      if (!enabled) {
        placeholderVisible(true);
        return;
      }
      placeholderVisible(false);

      // --- example wiring; adapt to your network's API ---
      // mount("top-leaderboard", '<div id="ad-top"></div>');
      // MyNetwork.display("ad-top", { unit: SLOT_IDS["top-leaderboard"] });
      //
      // mount("below-generate", '<div id="ad-mid"></div>');
      // MyNetwork.display("ad-mid", { unit: SLOT_IDS["below-generate"] });
      //
      // mount("sidebar", '<div id="ad-side"></div>');
      // MyNetwork.display("ad-side", { unit: SLOT_IDS.sidebar });
    },

    mount: mount,
    slotIds: SLOT_IDS
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      window.ImgForgeAds.mountSlots();
    });
  } else {
    window.ImgForgeAds.mountSlots();
  }
})();