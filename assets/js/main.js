(() => {
  "use strict";

  const select = (el, all = false) => {
    el = el.trim();
    return all ? [...document.querySelectorAll(el)] : document.querySelector(el);
  };

  /**
   * Calculate age in full years from data-birthday="YYYY-MM-DD"
   */
  const ageEl = select("#age-years");
  if (ageEl) {
    const birthday = ageEl.getAttribute("data-birthday");
    const birthDate = birthday ? new Date(`${birthday}T00:00:00`) : null;

    if (birthDate && !Number.isNaN(birthDate.getTime())) {
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const hadBirthdayThisYear =
        today.getMonth() > birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() &&
          today.getDate() >= birthDate.getDate());

      if (!hadBirthdayThisYear) age -= 1;
      ageEl.textContent = String(age);
    }
  }

  /**
   * Mobile nav toggle (iPortfolio header pattern)
   */
  const headerToggle = select(".header-toggle");
  const header = select("#header");

  const toggleHeader = () => {
    header?.classList.toggle("header-show");
    headerToggle?.classList.toggle("bi-list");
    headerToggle?.classList.toggle("bi-x");
  };

  headerToggle?.addEventListener("click", toggleHeader);
  headerToggle?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleHeader();
    }
  });

  /**
   * Hide mobile nav on same-page link click
   */
  select("#navmenu a", true).forEach((link) => {
    link.addEventListener("click", () => {
      if (header?.classList.contains("header-show")) toggleHeader();
    });
  });

  /**
   * Scroll top button
   */
  const scrollTop = select(".scroll-top");
  const toggleScrollTop = () => {
    if (!scrollTop) return;
    window.scrollY > 100
      ? scrollTop.classList.add("active")
      : scrollTop.classList.remove("active");
  };

  scrollTop?.addEventListener("click", (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("load", toggleScrollTop);
  document.addEventListener("scroll", toggleScrollTop);

  /**
   * AOS — scroll animations (iPortfolio reference)
   */
  window.addEventListener("load", () => {
    if (typeof AOS !== "undefined") {
      AOS.init({
        duration: 600,
        easing: "ease-in-out",
        once: true,
        mirror: false,
      });
    }
  });

  /**
   * Typed.js
   */
  const typedEl = select(".typed");
  if (typedEl && typeof Typed !== "undefined") {
    const items = (typedEl.getAttribute("data-typed-items") || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (items.length) {
      typedEl.removeAttribute("data-typed-items");
      new Typed(".typed", {
        strings: items,
        loop: true,
        typeSpeed: 100,
        backSpeed: 50,
        backDelay: 2000,
      });
    }
  }

  /**
   * Init Swiper from JSON config (iPortfolio testimonials pattern)
   */
  select(".init-swiper", true).forEach((swiperElement) => {
    const configEl = swiperElement.querySelector(".swiper-config");
    if (!configEl || typeof Swiper === "undefined") return;

    try {
      const config = JSON.parse(configEl.textContent.trim());
      new Swiper(swiperElement, config);
    } catch (error) {
      console.error("Swiper config error:", error);
    }
  });

  /**
   * Industry experience rounded to nearest year (Dec 2024 → present)
   */
  const experienceEl = select("#experience-years");
  if (experienceEl) {
    const started = experienceEl.getAttribute("data-started") || "2024-12-01";
    const startDate = new Date(`${started}T00:00:00`);

    if (!Number.isNaN(startDate.getTime())) {
      const today = new Date();
      let totalMonths =
        (today.getFullYear() - startDate.getFullYear()) * 12 +
        (today.getMonth() - startDate.getMonth());

      if (today.getDate() < startDate.getDate()) totalMonths -= 1;
      if (totalMonths < 0) totalMonths = 0;

      const years = Math.max(0, Math.round(totalMonths / 12));
      experienceEl.setAttribute("data-purecounter-end", String(years));
    }
  }

  /**
   * Stats counters (PureCounter)
   */
  if (typeof PureCounter !== "undefined") {
    new PureCounter();
  }

  /**
   * Skills progress animation
   */
  const skillsAnimation = select(".skills-animation");
  if (skillsAnimation) {
    const animateSkills = () => {
      select(".progress .progress-bar", true).forEach((bar) => {
        bar.style.width = `${bar.getAttribute("aria-valuenow")}%`;
      });
    };

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateSkills();
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      observer.observe(skillsAnimation);
    } else {
      animateSkills();
    }
  }

  /**
   * Nav active state on scroll
   */
  const navLinks = select("#navmenu a", true).filter((a) => a.hash);
  const sections = navLinks
    .map((link) => select(link.hash))
    .filter(Boolean);

  const navmenuScrollspy = () => {
    const position = window.scrollY + 200;
    let current = sections[0];

    sections.forEach((section) => {
      if (position >= section.offsetTop) current = section;
    });

    navLinks.forEach((link) => {
      link.classList.toggle("active", link.hash === `#${current.id}`);
    });
  };

  window.addEventListener("load", navmenuScrollspy);
  document.addEventListener("scroll", navmenuScrollspy);

  /**
   * Contact form (Formspree)
   */
  const form = select("#contact-form");
  if (form) {
    const loading = form.querySelector(".loading");
    const errorMessage = form.querySelector(".error-message");
    const sentMessage = form.querySelector(".sent-message");

    const show = (el) => el && (el.style.display = "block");
    const hide = (el) => el && (el.style.display = "none");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      hide(errorMessage);
      hide(sentMessage);

      const action = form.getAttribute("action") || "";
      if (action.includes("YOUR_FORM_ID")) {
        if (errorMessage) {
          errorMessage.textContent =
            "Replace YOUR_FORM_ID with your Formspree endpoint, or email me directly.";
          show(errorMessage);
        }
        return;
      }

      show(loading);
      try {
        const response = await fetch(action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });
        hide(loading);
        if (!response.ok) throw new Error("Request failed");
        form.reset();
        show(sentMessage);
      } catch {
        hide(loading);
        if (errorMessage) {
          errorMessage.textContent =
            "Could not send right now. Please email me instead.";
          show(errorMessage);
        }
      }
    });
  }
})();
