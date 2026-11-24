/* ------------------------------------------------------------------
   Edit this file after you deploy. It is the only thing that needs to
   point at your laptop.

   Local testing:  API_BASE = ""            (same origin, served by the backend)
   Live:           API_BASE = "https://your-tunnel.trycloudflare.com"

   Always https:// for the live value — mixed content will be blocked.
   ------------------------------------------------------------------ */

window.IMGFORGE_CONFIG = {
  API_BASE: "https://2ceef5c0576e08d5-210-212-239-181.serveousercontent.com",

  // Seconds the rewarded ad must stay visible before the claim button unlocks.
  // Match this to your ad network's minimum view duration.
  AD_MIN_SECONDS: 15,

  // Set to false once you wire a real network; leaves the slots empty.
  SHOW_PLACEHOLDER_ADS: true
};