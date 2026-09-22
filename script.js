"use strict";

// Desktop reviews rotate existing cards; mobile uses a sliding track.
document.querySelectorAll("[data-carousel]").forEach((section) => {
  const track = section.querySelector(".carousel-track");
  const viewport = section.querySelector(".carousel-window");
  const cards = [...track.children];
  const dots = section.querySelector(".dots");
  const status = section.querySelector("[data-status]");

  let index = 0;
  let touchStart = null;

  const dotButtons = cards.map((_, number) => {
    const button = document.createElement("button");

    button.type = "button";

    button.setAttribute(
      "aria-label",
      `${section.dataset.carousel === "steps" ? "Schritt" : "Bewertung"} ${number + 1}`,
    );

    button.addEventListener("click", () => update(number));

    dots.append(button);

    return button;
  });

  function update(next, announce = true) {
    index = (next + cards.length) % cards.length;

    const mobileBreakpoint =
      section.dataset.carousel === "steps" ? 540 : 900;

    const mobile = matchMedia(
      `(max-width: ${mobileBreakpoint}px)`,
    ).matches;

    if (mobile) {
      cards.forEach((card) => {
        card.style.order = "";
      });

      const gap = parseFloat(getComputedStyle(track).gap) || 0;

      track.style.transform = `translateX(-${
        index * (cards[0].getBoundingClientRect().width + gap)
      }px)`;
    } else {
      track.style.transform = "";

      cards.forEach((card, number) => {
        card.style.order =
          section.dataset.carousel === "reviews"
            ? (number - index + cards.length) % cards.length
            : "";
      });
    }

    dotButtons.forEach((button, number) => {
      button.setAttribute(
        "aria-current",
        String(number === index),
      );
    });

    if (announce) {
      status.textContent = `${
        section.dataset.carousel === "steps"
          ? "Schritt"
          : "Bewertung"
      } ${index + 1} von ${cards.length}`;
    }
  }

  section
    .querySelector("[data-prev]")
    .addEventListener("click", () => update(index - 1));

  section
    .querySelector("[data-next]")
    .addEventListener("click", () => update(index + 1));

  viewport.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;

    event.preventDefault();

    update(index + (event.key === "ArrowRight" ? 1 : -1));
  });

  viewport.addEventListener(
    "touchstart",
    (event) => {
      touchStart = {
        x: event.changedTouches[0].clientX,
        y: event.changedTouches[0].clientY,
      };
    },
    { passive: true },
  );

  viewport.addEventListener(
    "touchend",
    (event) => {
      if (!touchStart) return;

      const x =
        event.changedTouches[0].clientX - touchStart.x;

      const y =
        event.changedTouches[0].clientY - touchStart.y;

      if (Math.abs(x) > 40 && Math.abs(x) > Math.abs(y)) {
        update(index + (x < 0 ? 1 : -1));
      }

      touchStart = null;
    },
    { passive: true },
  );

  new ResizeObserver(() =>
    update(index, false),
  ).observe(viewport);

  update(0, false);
});