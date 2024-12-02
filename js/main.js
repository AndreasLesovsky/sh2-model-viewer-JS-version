import { loadModel } from "./three-renderer.js";

const swiper = new Swiper(".swiper", {
  speed: 500, // Geschwindigkeit des Übergangs
  effect: "slide", // Standard Slide-Effekt
  slidesPerView: 1,
  spaceBetween: 10,

  autoHeight: true,

  simulateTouch: false,
  grabCursor: false,
  allowTouchMove: false,

  keyboard: {
    enabled: true,
    onlyInViewport: false,
  },
  direction: "horizontal",
  preventClicks: true,
  preventClicksPropagation: true,
  pagination: {
    el: ".swiper-pagination",
    type: "fraction",
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },

  on: {
    slideChange: function () {
      // Entferne die "active"-Klasse von allen Slides
      document.querySelectorAll(".swiper-slide").forEach((slide) => {
        slide.classList.remove("active");
      });

      // Füge die "active"-Klasse zum aktuellen Slide hinzu
      this.slides[this.activeIndex].classList.add("active");
    },
  },
});

document.querySelectorAll("button[data-category]").forEach((button) => {
  button.addEventListener("click", async () => {
    const category = button.dataset.category;
    const models = await fetchModels(category);
    updateSwiperSlides(models);

    swiper.slideTo(0);

    document.querySelector(".category-heading").innerHTML = button.innerHTML;
  });
});

async function fetchModels(category) {
  const response = await fetch("data/models.json");
  const data = await response.json();
  return data[category] || [];
}

function updateSwiperSlides(models) {
  const swiperWrapper = document.querySelector(".swiper-wrapper");
  swiperWrapper.innerHTML = "";

  // Lösche alle aktiven WebGL-Kontexte
  const canvases = document.querySelectorAll(".swiper-slide canvas");
  canvases.forEach((canvas) => {
    const gl = canvas.getContext("webgl") || canvas.getContext("webgl2");
    if (gl) {
      const loseContextExtension = gl.getExtension("WEBGL_lose_context");
      if (loseContextExtension) {
        loseContextExtension.loseContext();
      }
    }
  });

  // Erstelle neue Slides basierend auf den übergebenen Modellen
  models.forEach((model) => {
    const slide = document.createElement("div");
    slide.className = "swiper-slide";

    // Erstelle einen Container für die Beschreibung (h3 und p)
    const descriptionContainer = document.createElement("div");
    descriptionContainer.className = "description-container";

    // Erstelle das h3 für den Titel
    const heading = document.createElement("h3");
    heading.textContent = model["description-heading"];
    descriptionContainer.appendChild(heading);

    // Erstelle das p für den Beschreibungstext
    const paragraph = document.createElement("p");
    paragraph.innerHTML = model["description-text"];
    descriptionContainer.appendChild(paragraph);

    // Füge den Beschreibungskontainer zum Slide hinzu
    slide.appendChild(descriptionContainer);

    // Erstelle einen Container für das Canvas
    const canvasContainer = document.createElement("div");
    canvasContainer.className = "canvas-container";

    // Erstelle das Canvas für das Modell
    const canvas = document.createElement("canvas");
    canvas.setAttribute("data-model-id", model.id);
    canvasContainer.appendChild(canvas);

    // Füge den Canvas-Container zum Slide hinzu
    slide.appendChild(canvasContainer);

    // Füge das Slide dem Wrapper hinzu
    swiperWrapper.appendChild(slide);

    // Lade das Modell in Three.js
    loadModel(canvas, model);
  });

  swiper.update(); // Aktualisiere Swiper
}

// Menü Button Click Event
const nav = document.querySelector("nav");
const menuBtn = document.querySelector("#menu-btn");

if (menuBtn) {
  menuBtn.addEventListener("click", () => {
    const isMenuVisible =
      menuBtn.getAttribute("aria-expanded") === "true" ||
      menuBtn.getAttribute("data-state") === "opened";

    if (!isMenuVisible) {
      // Menü öffnen
      nav.classList.remove("menu-hidden");
      nav.classList.add("menu-visible");
      menuBtn.setAttribute("data-state", "opened");
      menuBtn.setAttribute("aria-expanded", "true");
    } else {
      // Menü schließen
      nav.classList.remove("menu-visible");
      nav.classList.add("menu-hidden");
      menuBtn.setAttribute("data-state", "closed");
      menuBtn.setAttribute("aria-expanded", "false");
    }
  });
}

// Funktion zur Überprüfung der Viewport-Größe und des Menüzustands
function checkViewportAndMenuState() {
  const isMenuOpened = menuBtn.getAttribute("data-state") === "opened";
  const viewportWidth = window.innerWidth;

  if (viewportWidth < 1024) {
    // 64rem in px (bei 16px Basisgröße), entspricht der media query medium in der media.css und der grid.css
    if (!isMenuOpened) {
      nav.classList.add("menu-hidden");
      nav.classList.remove("menu-visible");
    }
  } else {
    nav.classList.remove("menu-hidden");
  }
}

// Initialprüfung beim Laden der Seite
checkViewportAndMenuState();

// Klicken des ersten Navigationsbuttons beim Laden der Seite
const firstButton = document.querySelector("button[data-category]");
if (firstButton) {
  firstButton.click();
}

// Versteckter Bereich
const toggleBtn = document.getElementById("toggle-info");
const hiddenInfo = document.getElementById("hidden-info");

toggleBtn.addEventListener("click", () => {
  // Toggle die "active"-Klasse
  hiddenInfo.classList.toggle("active");

  // Ändere den Button-Text
  if (hiddenInfo.classList.contains("active")) {
    toggleBtn.textContent = "Weitere rechtliche Infos ausblenden";

    // Warte, bis die Transition (CSS-Animation) abgeschlossen ist, und scrolle dann
    setTimeout(() => {
      hiddenInfo.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 500); // Timeout sollte mit der Transition-Dauer in CSS übereinstimmen
  } else {
    toggleBtn.textContent = "Weitere rechtliche Infos anzeigen";
  }
});
