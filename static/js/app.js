document.addEventListener("DOMContentLoaded", () => {
    initSplitTitle();
    initReveal();
    initTimer();
    initCursorLight();
    initScrollMotion();
    initRsvpForm();
});

function initSplitTitle() {
    const title = document.querySelector("[data-split]");

    if (!title) {
        return;
    }

    const text = title.textContent.trim();
    title.textContent = "";

    [...text].forEach((letter, index) => {
        const span = document.createElement("span");
        span.textContent = letter === " " ? "\u00A0" : letter;
        span.style.animationDelay = `${index * 0.045}s`;
        title.appendChild(span);
    });
}

function initReveal() {
    const elements = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("reveal--visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.16,
            rootMargin: "0px 0px -8% 0px",
        }
    );

    elements.forEach((element) => observer.observe(element));
}

function initTimer() {
    const timer = document.querySelector(".timer");

    if (!timer) {
        return;
    }

    const target = new Date(timer.dataset.date).getTime();
    const days = timer.querySelector("[data-days]");
    const hours = timer.querySelector("[data-hours]");
    const minutes = timer.querySelector("[data-minutes]");
    const seconds = timer.querySelector("[data-seconds]");

    const update = () => {
        const distance = Math.max(target - Date.now(), 0);

        days.textContent = Math.floor(distance / (1000 * 60 * 60 * 24));
        hours.textContent = String(Math.floor((distance / (1000 * 60 * 60)) % 24)).padStart(2, "0");
        minutes.textContent = String(Math.floor((distance / (1000 * 60)) % 60)).padStart(2, "0");
        seconds.textContent = String(Math.floor((distance / 1000) % 60)).padStart(2, "0");
    };

    update();
    setInterval(update, 1000);
}

function initCursorLight() {
    const light = document.querySelector(".cursor-light");

    if (!light || window.matchMedia("(pointer: coarse)").matches) {
        return;
    }

    window.addEventListener("mousemove", (event) => {
        light.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
    });
}

function initScrollMotion() {
    const heroImage = document.querySelector(".hero__bg img");
    const cinemaImage = document.querySelector(".cinema__image img");
    const gallery = document.querySelector(".gallery-track");

    const update = () => {
        const scrollY = window.scrollY || 0;

        if (heroImage) {
            heroImage.style.transform = `scale(${1.06 + Math.min(scrollY / 7000, 0.08)}) translateY(${scrollY * 0.025}px)`;
        }

        if (cinemaImage) {
            const rect = cinemaImage.getBoundingClientRect();
            const progress = Math.max(-1, Math.min(1, rect.top / window.innerHeight));
            cinemaImage.style.transform = `scale(${1.03 - progress * 0.02}) rotate(${progress * -1.2}deg)`;
        }

        if (gallery && window.innerWidth > 760) {
            const rect = gallery.getBoundingClientRect();
            const shift = Math.max(-220, Math.min(220, (window.innerHeight - rect.top) * 0.16));
            gallery.style.transform = `translateX(${-shift}px)`;
        }
    };

    window.addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
    update();
}

function initRsvpForm() {
    const form = document.querySelector(".rsvp-form");

    if (!form) {
        return;
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        form.classList.add("rsvp-form--sent");
    });
}
