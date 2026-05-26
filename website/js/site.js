/**
 * Realm Games — site interactions
 * Mobile nav toggle + smooth scroll for anchor links
 */
(function () {
  "use strict";

  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.querySelector(".site-nav");

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!expanded));
      siteNav.classList.toggle("is-open", !expanded);
      document.body.style.overflow = !expanded ? "hidden" : "";
    });

    siteNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        if (window.matchMedia("(max-width: 768px)").matches) {
          navToggle.setAttribute("aria-expanded", "false");
          siteNav.classList.remove("is-open");
          document.body.style.overflow = "";
        }
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && siteNav.classList.contains("is-open")) {
        navToggle.setAttribute("aria-expanded", "false");
        siteNav.classList.remove("is-open");
        document.body.style.overflow = "";
        navToggle.focus();
      }
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    const id = anchor.getAttribute("href");
    if (!id || id === "#") return;

    anchor.addEventListener("click", function (e) {
      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      const header = document.querySelector(".site-header");
      const offset = header ? header.offsetHeight + 8 : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top: top, behavior: "smooth" });
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  });
})();
