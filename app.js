/* ImgForge frontend. Plain ES2017+, no build step, no dependencies. */
(function () {
  "use strict";

  var cfg = window.IMGFORGE_CONFIG || {};
  var API = String(cfg.API_BASE || "").replace(/\/+$/, "");
  var AD_SECONDS = Number(cfg.AD_MIN_SECONDS) || 15;

  var $ = function (id) { return document.getElementById(id); };
  var state = { credits: 0, polling: null, adTimer: null, busy: false };

  // ---------------------------------------------------------------- fetch
  function api(path, options) {
    options = options || {};
    options.credentials = "include";
    options.headers = Object.assign({ "Content-Type": "application/json" }, options.headers || {});
    return fetch(API + path, options).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (body) {
        if (!res.ok) {
          var err = new Error(body.error || ("HTTP " + res.status));
          err.hint = body.hint;
          err.status = res.status;
          throw err;
        }
        return body;
      });
    });
  }

  function setCredits(n) {
    state.credits = n;
    $("credit-count").textContent = n;
    $("earn-btn").disabled = false;
  }

  function showStatus(kind, html) {
    var el = $("status");
    el.hidden = false;
    el.className = "status status-" + kind;
    el.innerHTML = html;
  }

  function hideStatus() { $("status").hidden = true; }

  // ------------------------------------------------------------------ me
  function refreshMe() {
    return api("/api/me").then(function (me) {
      setCredits(me.credits);
      $("limits").textContent =
        "Up to " + me.generations_per_hour + " images/hour · " +
        me.ads_per_hour + " ad rewards/hour · " + me.credits_per_ad +
        " credits per ad.";
      return me;
    }).catch(function (err) {
      $("credit-count").textContent = "!";
      showStatus("error",
        "<strong>Cannot reach the generator.</strong><br>" +
        escapeHtml(err.message) +
        "<br><span class='muted small'>If you just deployed, check API_BASE in config.js.</span>");
    });
  }

  // ------------------------------------------------------------ generate
  function generate() {
    if (state.busy) return;
    var prompt = $("prompt").value.trim();
    if (prompt.length < 3) {
      showStatus("error", "Write a prompt first (at least a few words).");
      return;
    }
    if (state.credits <= 0) {
      openAdModal();
      return;
    }

    var size = ($("size").value || "1024x1024").split("x");
    var seedVal = $("seed").value.trim();

    state.busy = true;
    $("generate").disabled = true;
    $("generate").querySelector(".btn-label").textContent = "Working…";
    showStatus("working", "Submitting…");

    api("/api/generate", {
      method: "POST",
      body: JSON.stringify({
        prompt: prompt,
        width: parseInt(size[0], 10),
        height: parseInt(size[1], 10),
        seed: seedVal === "" ? null : parseInt(seedVal, 10)
      })
    }).then(function (res) {
      setCredits(res.credits);
      pollJob(res.job_id, Date.now());
    }).catch(function (err) {
      state.busy = false;
      $("generate").disabled = false;
      $("generate").querySelector(".btn-label").textContent = "Generate";
      if (err.status === 402) {
        hideStatus();
        openAdModal();
        return;
      }
      showStatus("error", escapeHtml(err.message) +
        (err.hint ? "<br><span class='muted small'>" + escapeHtml(err.hint) + "</span>" : ""));
    });
  }

  function pollJob(jobId, startedAt) {
    api("/api/job/" + jobId).then(function (job) {
      if (job.status === "done") {
        finish(job);
        return;
      }
      if (job.status === "error") {
        state.busy = false;
        $("generate").disabled = false;
        $("generate").querySelector(".btn-label").textContent = "Generate";
        showStatus("error", "<strong>Generation failed.</strong><br>" +
          escapeHtml(job.error || "unknown error"));
        return;
      }
      var secs = Math.round((Date.now() - startedAt) / 1000);
      var where = job.status === "queued"
        ? "Queued" + (job.queue_position > 1 ? " (position " + job.queue_position + ")" : "")
        : "Generating";
      showStatus("working", where + "… <span class='muted'>" + secs + "s</span>");
      setTimeout(function () { pollJob(jobId, startedAt); }, 2000);
    }).catch(function (err) {
      state.busy = false;
      $("generate").disabled = false;
      $("generate").querySelector(".btn-label").textContent = "Generate";
      showStatus("error", escapeHtml(err.message));
    });
  }

  function finish(job) {
    state.busy = false;
    $("generate").disabled = false;
    $("generate").querySelector(".btn-label").textContent = "Generate";
    hideStatus();
    addToGallery(job);
    $("gallery-empty") && ($("gallery-empty").hidden = true);
  }

  function addToGallery(job) {
    var url = API + job.url;
    var figure = document.createElement("figure");
    figure.className = "shot";
    figure.innerHTML =
      '<a href="' + url + '" target="_blank" rel="noopener">' +
        '<img src="' + url + '" alt="' + escapeAttr(job.prompt) + '" loading="lazy">' +
      "</a>" +
      '<figcaption title="' + escapeAttr(job.prompt) + '">' +
        escapeHtml(job.prompt.slice(0, 90)) + "</figcaption>";
    var gallery = $("gallery");
    gallery.insertBefore(figure, gallery.firstChild);
  }

  function loadGallery() {
    api("/api/gallery").then(function (res) {
      if (!res.items || !res.items.length) return;
      $("gallery-empty").hidden = true;
      res.items.slice().reverse().forEach(function (job) {
        if (job.filename) addToGallery({ url: "/img/" + job.filename, prompt: job.prompt });
      });
    }).catch(function () { /* gallery is best-effort */ });
  }

  // ------------------------------------------------------------- ad gate
  function openAdModal() {
    var modal = $("ad-modal");
    modal.hidden = false;
    $("modal-credits").textContent = state.credits_per_ad || 2;
    $("claim-btn").disabled = true;
    $("ad-progress").style.width = "0%";

    var remaining = AD_SECONDS;
    $("claim-label").textContent = "Watching… " + remaining + "s";

    clearInterval(state.adTimer);
    state.adTimer = setInterval(function () {
      remaining -= 1;
      var pct = Math.min(100, ((AD_SECONDS - remaining) / AD_SECONDS) * 100);
      $("ad-progress").style.width = pct + "%";
      if (remaining > 0) {
        $("claim-label").textContent = "Watching… " + remaining + "s";
      } else {
        clearInterval(state.adTimer);
        $("claim-label").textContent = "Claim " + (state.credits_per_ad || 2) + " credits";
        $("claim-btn").disabled = false;
      }
    }, 1000);

    // Tell the ad network a rewarded impression started (if one is wired up).
    if (window.ImgForgeAds && window.ImgForgeAds.onRewardedStart) {
      try { window.ImgForgeAds.onRewardedStart(); } catch (e) { /* ignore */ }
    }
  }

  function closeAdModal() {
    clearInterval(state.adTimer);
    $("ad-modal").hidden = true;
  }

  function claimCredits() {
    $("claim-btn").disabled = true;
    $("claim-label").textContent = "Claiming…";
    api("/api/ad/reward", { method: "POST", body: "{}" })
      .then(function (res) {
        setCredits(res.credits);
        closeAdModal();
        showStatus("ok", "Added " + res.granted + " credits. You have " +
          res.credits + " now.");
        setTimeout(hideStatus, 3500);
      })
      .catch(function (err) {
        $("claim-label").textContent = "Try again";
        $("claim-btn").disabled = false;
        showStatus("error", escapeHtml(err.message) +
          (err.hint ? "<br><span class='muted small'>" + escapeHtml(err.hint) + "</span>" : ""));
      });
  }

  // -------------------------------------------------------------- escape
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function escapeAttr(s) { return escapeHtml(s); }

  // ---------------------------------------------------------------- wire
  function init() {
    $("prompt").addEventListener("input", function () {
      $("prompt-count").textContent = this.value.length;
    });
    $("generate").addEventListener("click", generate);
    $("earn-btn").addEventListener("click", openAdModal);
    $("claim-btn").addEventListener("click", claimCredits);
    $("close-modal").addEventListener("click", closeAdModal);
    $("ad-modal").addEventListener("click", function (e) {
      if (e.target === this) closeAdModal();
    });
    $("prompt").addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") generate();
    });

    ["tos-link", "privacy-link"].forEach(function (id) {
      var el = $(id);
      if (el) el.addEventListener("click", function (e) { e.preventDefault(); });
    });

    refreshMe();
    loadGallery();
  }

  // expose for ads.js
  window.ImgForge = { api: api, get credits() { return state.credits; } };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();