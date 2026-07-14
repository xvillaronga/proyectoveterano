"use strict";

const tracks = [
  { title: "La chica del verano", file: "01-La chica del verano.mp3", duration: "2:58" },
  { title: "Te volviste loca", file: "02-Te volviste loca.mp3", duration: "2:58" },
  { title: "En pijama", file: "03-La chica en pijama.mp3", duration: "3:33" },
  { title: "Una Estrella", file: "04-Esa Estrella Eres Tu.mp3", duration: "2:44" },
  { title: "Nueve de Mayo", file: "05-Nueve de Mayo.mp3", duration: "3:30" },
  { title: "Una mañana", file: "06-Una mañana.mp3", duration: "3:28" },
  { title: "Pájaro Herido", file: "07-Pajaro Herido.mp3", duration: "2:58" },
  { title: "Tampoco pido tanto", file: "08-Tampoco pido tanto.mp3", duration: "2:58" },
  { title: "Mar de Dudas", file: "09-Mar de Dudas.mp3", duration: "2:09" },
  { title: "Quiero decirte", file: "10-Quiero decirte.mp3", duration: "3:11" },
  { title: "Hace poco", file: "11-Hace poco.mp3", duration: "2:42" },
  { title: "La Puerta Secreta", file: "12-La puerta secreta.mp3", duration: "3:41" },
  { title: "Calles Mojadas", file: "13-Calles mojadas.mp3", duration: "3:41" },
  { title: "Sinceros", file: "14-Sinceros.mp3", duration: "2:54" },
  { title: "Tan solo una canción", file: "15-Tan solo una cancion.mp3", duration: "3:03" }
];

const audio = document.querySelector("#audio");
const trackLists = [...document.querySelectorAll("[data-track-list]")];
const playButtons = [...document.querySelectorAll('[data-action="play"]')];
const previousButtons = [...document.querySelectorAll('[data-action="previous"]')];
const nextButtons = [...document.querySelectorAll('[data-action="next"]')];
const continuousButtons = [...document.querySelectorAll('[data-action="continuous"]')];
const seekInputs = [...document.querySelectorAll("[data-seek]")];
const currentTitleLabels = [...document.querySelectorAll("[data-current-title]")];
const currentTimeLabels = [...document.querySelectorAll("[data-current-time]")];
const durationLabels = [...document.querySelectorAll("[data-duration]")];
const statusLabels = [...document.querySelectorAll("[data-player-status]")];

let currentIndex = 0;
let continuousPlayback = true;
let activeSeekInput = null;
let statusTimer = null;
let progressAnimationFrame = null;

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remaining}`;
}

function setText(elements, text) {
  elements.forEach((element) => {
    element.textContent = text;
  });
}

function setStatus(message = "", autoClear = true) {
  window.clearTimeout(statusTimer);
  setText(statusLabels, message);
  if (message && autoClear) {
    statusTimer = window.setTimeout(() => setText(statusLabels, ""), 5000);
  }
}

function setSeekVisual(input, value) {
  const numericValue = Math.min(1000, Math.max(0, Number(value) || 0));
  input.value = String(numericValue);
  input.style.setProperty("--seek-progress", `${numericValue / 10}%`);
  input.setAttribute("aria-valuetext", `${formatTime(audio.currentTime)} de ${formatTime(audio.duration)}`);
}

function syncSeekInputs(value) {
  seekInputs.forEach((input) => setSeekVisual(input, value));
}

function syncProgressFromAudio() {
  if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;

  setText(currentTimeLabels, formatTime(audio.currentTime));
  if (activeSeekInput) return;

  const value = Math.round((audio.currentTime / audio.duration) * 1000);
  syncSeekInputs(value);
}

function stopProgressAnimation() {
  if (progressAnimationFrame !== null) {
    window.cancelAnimationFrame(progressAnimationFrame);
    progressAnimationFrame = null;
  }
}

function startProgressAnimation() {
  stopProgressAnimation();

  const tick = () => {
    syncProgressFromAudio();
    if (!audio.paused && !audio.ended) {
      progressAnimationFrame = window.requestAnimationFrame(tick);
    } else {
      progressAnimationFrame = null;
    }
  };

  progressAnimationFrame = window.requestAnimationFrame(tick);
}

function seekToInputValue(input) {
  if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;

  const ratio = Math.min(1, Math.max(0, Number(input.value) / 1000));
  audio.currentTime = ratio * audio.duration;
  syncProgressFromAudio();
}

function renderTrackLists() {
  trackLists.forEach((list) => {
    const isDesktop = list.classList.contains("desktop-track-list");
    const fragment = document.createDocumentFragment();

    tracks.forEach((track, index) => {
      const item = document.createElement("li");
      item.dataset.index = String(index);
      item.dataset.playIndex = String(index);

      if (isDesktop) {
        item.className = "desktop-track-row";
        item.innerHTML = `
          <button
            class="desktop-track-hit"
            type="button"
            data-play-index="${index}"
            aria-label="Reproducir ${track.title}">
          </button>`;
      } else {
        item.className = "mobile-track-row";
        item.innerHTML = `
          <span class="mobile-track-number">${String(index + 1).padStart(2, "0")}</span>
          <span class="mobile-track-title">${track.title}</span>
          <span class="mobile-track-duration" data-track-duration="${index}">${track.duration}</span>
          <button
            class="mobile-track-play"
            type="button"
            data-play-index="${index}"
            aria-label="Reproducir ${track.title}">▶</button>`;
      }

      fragment.appendChild(item);
    });

    list.replaceChildren(fragment);
  });
}

function updateActiveTrack() {
  document.querySelectorAll("[data-index]").forEach((row) => {
    const rowIndex = Number(row.dataset.index);
    const isActive = rowIndex === currentIndex;
    row.classList.toggle("is-active", isActive);

    const button = row.querySelector("[data-play-index]");
    if (!button) return;

    const isPlaying = isActive && !audio.paused;
    button.setAttribute("aria-label", isPlaying ? `Pausar ${tracks[rowIndex].title}` : `Reproducir ${tracks[rowIndex].title}`);

    if (button.classList.contains("mobile-track-play")) {
      button.textContent = isPlaying ? "❚❚" : "▶";
    }
  });
}

function updateNowPlaying(index) {
  const track = tracks[index];
  setText(currentTitleLabels, track.title);
  setText(durationLabels, track.duration);
}

function updatePlayButtons() {
  playButtons.forEach((button) => {
    button.classList.toggle("is-playing", !audio.paused);
    button.setAttribute("aria-label", audio.paused ? "Reproducir" : "Pausar");
  });
}

function updateContinuousButtons() {
  continuousButtons.forEach((button) => {
    button.classList.toggle("is-active", continuousPlayback);
    button.setAttribute("aria-pressed", String(continuousPlayback));
  });
}

function updateMediaSession(track) {
  if (!("mediaSession" in navigator) || typeof MediaMetadata === "undefined") return;

  navigator.mediaSession.metadata = new MediaMetadata({
    title: track.title,
    artist: "Proyecto Veterano",
    album: "Proyecto Veterano",
    artwork: [
      { src: "assets/img/favicon.png", sizes: "128x128", type: "image/png" },
      { src: "assets/img/logo-proyecto-veterano.png", sizes: "700x700", type: "image/png" }
    ]
  });
}

async function loadTrack(index, shouldPlay = true) {
  if (!Number.isInteger(index) || index < 0 || index >= tracks.length) return;

  currentIndex = index;
  const track = tracks[index];
  audio.src = `assets/audio/${track.file}`;
  audio.load();

  updateNowPlaying(index);
  setText(currentTimeLabels, "0:00");
  syncSeekInputs(0);
  updateActiveTrack();
  updateMediaSession(track);
  setStatus("");

  if (!shouldPlay) return;

  try {
    await audio.play();
  } catch (error) {
    if (error.name !== "AbortError") {
      setStatus(`No se encuentra el audio: assets/audio/${track.file}`);
    }
  }
}

async function togglePlayback() {
  if (!audio.src) {
    await loadTrack(currentIndex, true);
    return;
  }

  if (audio.paused) {
    try {
      await audio.play();
    } catch {
      setStatus(`No se ha podido reproducir “${tracks[currentIndex].title}”.`);
    }
  } else {
    audio.pause();
  }
}

function goToNext() {
  const nextIndex = currentIndex + 1;
  if (nextIndex < tracks.length) {
    loadTrack(nextIndex, true);
  } else if (continuousPlayback) {
    loadTrack(0, true);
  } else {
    audio.pause();
    audio.currentTime = 0;
  }
}

function goToPrevious() {
  if (audio.currentTime > 4) {
    audio.currentTime = 0;
    return;
  }

  const previousIndex = currentIndex > 0 ? currentIndex - 1 : tracks.length - 1;
  loadTrack(previousIndex, true);
}

trackLists.forEach((list) => {
  list.addEventListener("click", (event) => {
    const target = event.target.closest("[data-play-index]");
    if (!target || !list.contains(target)) return;

    const index = Number(target.dataset.playIndex);
    if (!Number.isInteger(index)) return;

    if (index === currentIndex && audio.src) {
      togglePlayback();
    } else {
      loadTrack(index, true);
    }
  });
});

playButtons.forEach((button) => button.addEventListener("click", togglePlayback));
previousButtons.forEach((button) => button.addEventListener("click", goToPrevious));
nextButtons.forEach((button) => button.addEventListener("click", goToNext));
continuousButtons.forEach((button) => {
  button.addEventListener("click", () => {
    continuousPlayback = !continuousPlayback;
    updateContinuousButtons();
    setStatus(continuousPlayback ? "Reproducción continua activada." : "Reproducción continua desactivada.");
  });
});

seekInputs.forEach((input) => {
  setSeekVisual(input, input.value);

  const previewSeek = () => {
    activeSeekInput = input;
    const value = Number(input.value);
    setSeekVisual(input, value);

    seekInputs.forEach((other) => {
      if (other !== input) setSeekVisual(other, value);
    });

    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      const previewTime = (value / 1000) * audio.duration;
      setText(currentTimeLabels, formatTime(previewTime));
    }
  };

  const commitSeek = () => {
    seekToInputValue(input);
    activeSeekInput = null;
  };

  input.addEventListener("input", previewSeek);
  input.addEventListener("change", commitSeek);
  input.addEventListener("pointerup", commitSeek);
  input.addEventListener("pointercancel", () => {
    activeSeekInput = null;
    syncProgressFromAudio();
  });
  input.addEventListener("blur", () => {
    if (activeSeekInput === input) commitSeek();
  });
});

audio.addEventListener("play", () => {
  updatePlayButtons();
  updateActiveTrack();
  setStatus("");
  startProgressAnimation();
});

audio.addEventListener("pause", () => {
  updatePlayButtons();
  updateActiveTrack();
  stopProgressAnimation();
  syncProgressFromAudio();
});

audio.addEventListener("loadedmetadata", () => {
  if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;

  // La duración visible se toma siempre del objeto tracks de app.js.
  // La duración real del MP3 solo se usa internamente para calcular el avance.
  setText(durationLabels, tracks[currentIndex].duration);
  syncProgressFromAudio();
});

audio.addEventListener("durationchange", syncProgressFromAudio);
audio.addEventListener("timeupdate", syncProgressFromAudio);
audio.addEventListener("seeking", syncProgressFromAudio);
audio.addEventListener("seeked", syncProgressFromAudio);

audio.addEventListener("ended", goToNext);
audio.addEventListener("error", () => {
  setStatus(`Falta el archivo assets/audio/${tracks[currentIndex].file}`);
});

// Menú móvil.
const mobileMenuButton = document.querySelector("[data-mobile-menu-button]");
const mobileMenu = document.querySelector("#mobile-menu");

function closeMobileMenu() {
  if (!mobileMenuButton || !mobileMenu) return;
  mobileMenuButton.classList.remove("is-open");
  mobileMenuButton.setAttribute("aria-expanded", "false");
  mobileMenu.classList.remove("is-open");
}

mobileMenuButton?.addEventListener("click", () => {
  const opening = !mobileMenu.classList.contains("is-open");
  mobileMenuButton.classList.toggle("is-open", opening);
  mobileMenuButton.setAttribute("aria-expanded", String(opening));
  mobileMenu.classList.toggle("is-open", opening);
});

mobileMenu?.addEventListener("click", (event) => {
  if (event.target.closest("a, button")) closeMobileMenu();
});

document.querySelectorAll("[data-scroll-playlist]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = window.matchMedia("(max-width: 860px)").matches
      ? document.querySelector("#mobile-tracks")
      : document.querySelector(".desktop-track-area");

    target?.scrollIntoView({ behavior: "smooth", block: "center" });
    target?.querySelector("button")?.focus({ preventScroll: true });
  });
});

// Diálogos.
document.querySelectorAll("[data-open-modal]").forEach((button) => {
  button.addEventListener("click", () => {
    closeMobileMenu();
    document.getElementById(button.dataset.openModal)?.showModal();
  });
});

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", () => button.closest("dialog")?.close());
});

document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    const rect = dialog.getBoundingClientRect();
    const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
    if (outside) dialog.close();
  });
});

// Atajos de teclado para escritorio.
document.addEventListener("keydown", (event) => {
  const tag = event.target.tagName;
  if (["INPUT", "TEXTAREA", "BUTTON", "A", "SELECT"].includes(tag)) return;

  if (event.code === "Space") {
    event.preventDefault();
    togglePlayback();
  } else if (event.code === "ArrowRight") {
    audio.currentTime = Math.min(audio.currentTime + 5, audio.duration || audio.currentTime + 5);
  } else if (event.code === "ArrowLeft") {
    audio.currentTime = Math.max(audio.currentTime - 5, 0);
  }
});

if ("mediaSession" in navigator) {
  navigator.mediaSession.setActionHandler("play", () => audio.play());
  navigator.mediaSession.setActionHandler("pause", () => audio.pause());
  navigator.mediaSession.setActionHandler("previoustrack", goToPrevious);
  navigator.mediaSession.setActionHandler("nexttrack", goToNext);
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopProgressAnimation();
  } else if (!audio.paused && !audio.ended) {
    startProgressAnimation();
  }
});

renderTrackLists();
updateNowPlaying(0);
updateActiveTrack();
updatePlayButtons();
updateContinuousButtons();
