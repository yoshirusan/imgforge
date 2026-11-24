/* ------------------------------------------------------------------
   Adsterra units. All four are placed INLINE in index.html on purpose -
   read "Why nothing is injected from here" below before moving anything.

   Property approved: frenzied-negate-automated.ngrok-free.dev
   Ad unit set ID   : 6223855

   UNIT MAP
   --------
   468x60 iframe banner  -> index.html, top-leaderboard slot
        key bc1q762src4mwu26w8mfch5kdss7ddf6r8kzutdd2n
        src bauval.org/22/...

   in-page push         -> index.html, sidebar slot
        container id container-bf7c12a71cd75874d5313c64de2cbf20
        src bauval.org/21/...

   popunder             -> end of <body>
        src abscloud.org/1/781e16e3c776cf93ab069084a41b0a67

   social bar           -> end of <body>
        src bauval.org/14/db41dc9177217428f03c97c12711e06c

   direct link (unused) -> araplhn.org/4/bb22b8ae9b7eac670948049226f7ede4
        Not placed anywhere. See the warning at the bottom.

   WHY NOTHING IS INJECTED FROM HERE
   ----------------------------------
   The 468x60 banner snippet uses document.write. A banner script inserted
   with document.write AFTER the page has finished loading will blank the
   entire document. So it has to be parsed inline with the HTML - never
   created dynamically, and never moved into a template/innerHTML.

   The in-page push unit is async and targets a container by id, so it is
   also inline, with its exact container id preserved.

   REWARDED ADS: Adsterra does not offer one. There is no rewarded-video
   format, and no server callback that says "this user earned a reward".
   That is why the modal is a timed bonus rather than "watch this ad".
   ------------------------------------------------------------------ */
(function () {
  "use strict";

  var REWARDED_HOOKS = {
    /**
     * Called when the bonus modal opens. No ad to show on Adsterra, so this
     * is where a future network's rewarded unit would be started.
     */
    onRewardedStart: function () {
      /* no-op: Adsterra has no rewarded format */
    },

    /** Called by the network when a walled ad completes, if that ever exists. */
    rewardFinished: function () {
      var btn = document.getElementById("claim-btn");
      if (btn) btn.disabled = false;
    }
  };

  window.ImgForgeAds = {
    onRewardedStart: REWARDED_HOOKS.onRewardedStart,
    rewardFinished: REWARDED_HOOKS.rewardFinished,

    /** Public URLs, handy for support tickets with the network. */
    units: {
      banner468: "https://bauval.org/22/bc1q762src4mwu26w8mfch5kdss7ddf6r8kzutdd2n",
      inPagePush: "https://bauval.org/21/bf7c12a71cd75874d5313c64de2cbf20",
      popunder: "https://abscloud.org/1/781e16e3c776cf93ab069084a41b0a67",
      socialBar: "https://bauval.org/14/db41dc9177217428f03c97c12711e06c",
      directLink: "https://araplhn.org/4/bb22b8ae9b7eac670948049226f7ede4"
    }
  };

  /* ------------------------------------------------------------------
     WARNING about the direct link
     ------------------------------------------------------------------
     "Earn credits -> open the direct link" is incentivised clicking.
     Adsterra (like most CPM networks) treats artificially prompted clicks
     and impressions as invalid traffic. Do not wire the direct link to the
     credit button. It is here only so the URL is documented.

     If you want credits to be verifiable at all, the only honest options
     are:
       1. Drop credits entirely and rate-limit generations per hour.
       2. Move to a network that has a real rewarded format + server
          postback (see docs/ADS.md, ssv mode).
     ------------------------------------------------------------------ */
})();