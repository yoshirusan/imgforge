/* Ad network integration point.

The site ships with visible placeholder slots and a working rewarded gate, so it
works end to end before any network approves you. When you are accepted:

1. Put the network's loader <script> in index.html (before app.js).
2. Fill in the functions below.

Nothing else in the app needs to change - app.js already calls
window.ImgForgeAds.onRewardedStart() when the modal opens.

IMPORTANT about credits: the client is not trustworthy. `claim` mode (the
default) trusts the browser to say "I watched it", which anyone can fake. Once
your network supports a server-to-server postback, switch the backend to SSV:

    IMGFORGE_AD_MODE=ssv
    IMGFORGE_SSV_SECRET=<from your network>

and point the network's callback URL at:

    https://<your-tunnel>/api/ad/ssv?sid=<session>&credits=<n>&txid=<id>&sig=<hmac>

where sig = HMAC_SHA256(secret, "sid|credits|txid"). The backend then grants
credits without trusting the browser at all.
*/
(function () {
  "use strict";

  window.ImgForgeAds = {
    /** Called when the rewarded modal opens. Ad networks that support
     *  explicit rewarded impressions want their show() call here. */
    onRewardedStart: function () {
      // Example:
      //   window.myAdNetwork.showRewarded({
      //     onComplete: function (txid) { /* optional: your own verification */ }
      //   });
    },

    /** Called if you want to swap placeholder boxes for real units. */
    mountSlots: function () {
      // Example:
      //   document.querySelectorAll('[data-ad="sidebar"]').forEach(function (el) {
      //     window.myAdNetwork.display(el, { unit: '300600' });
      //   });
    }
  };

  if (window.IMGFORGE_CONFIG && window.IMGFORGE_CONFIG.SHOW_PLACEHOLDER_ADS) {
    document.querySelectorAll(".ad-slot .ad-body").forEach(function (el) {
      el.style.opacity = "1";
    });
  }
})();