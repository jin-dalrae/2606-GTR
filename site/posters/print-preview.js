/**
 * Print-preview host for tabloid posters.
 * Keeps the poster at fixed physical size (in / pt); scales the whole sheet
 * to fit the viewport so on-screen matches print layout — no reflow.
 */
(function () {
  function fit() {
    const poster = document.querySelector(".poster");
    if (!poster) return;

    let stage = poster.closest(".print-stage");
    if (!stage) {
      stage = document.createElement("div");
      stage.className = "print-stage";
      poster.parentNode.insertBefore(stage, poster);
      stage.appendChild(poster);
    }

    // Reset before measuring natural size
    poster.style.transform = "none";
    stage.style.width = "";
    stage.style.height = "";

    const isEmbedded = window.self !== window.top;
    const chrome = document.querySelector(".chrome");
    if (isEmbedded && chrome) {
      chrome.style.display = "none";
    }

    const pad = isEmbedded ? 0 : 32;
    const chromeH = isEmbedded ? 0 : (chrome ? chrome.getBoundingClientRect().height + 24 : 24);
    const availW = Math.max(200, window.innerWidth - pad);
    const availH = Math.max(200, window.innerHeight - chromeH - pad);

    const rect = poster.getBoundingClientRect();
    const pw = rect.width || poster.offsetWidth;
    const ph = rect.height || poster.offsetHeight;
    if (!pw || !ph) return;

    const maxScale = isEmbedded ? Infinity : 1;
    const scale = Math.min(maxScale, availW / pw, availH / ph);

    poster.style.transformOrigin = "top center";
    poster.style.transform = scale < 0.999 ? "scale(" + scale + ")" : "none";

    // Reserve layout space for the visually scaled sheet
    stage.style.width = Math.ceil(pw * scale) + "px";
    stage.style.height = Math.ceil(ph * scale) + "px";
  }

  // Avoid scaling during print / print preview dialog
  const mq = window.matchMedia("print");
  function onChange() {
    if (mq.matches) {
      const poster = document.querySelector(".poster");
      const stage = document.querySelector(".print-stage");
      if (poster) poster.style.transform = "none";
      if (stage) {
        stage.style.width = "";
        stage.style.height = "";
      }
    } else {
      fit();
    }
  }

  window.addEventListener("resize", fit);
  window.addEventListener("load", fit);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(fit).catch(function () {});
  }
  // KaTeX / late layout
  setTimeout(fit, 100);
  setTimeout(fit, 500);
  mq.addEventListener?.("change", onChange);

  document.addEventListener("DOMContentLoaded", fit);
})();
