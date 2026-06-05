document.addEventListener("DOMContentLoaded", () => {
    initSplitTitle();
    initReveal();
    initTimer();
    initCursorLight();
    initScrollMotion();
    initRsvpForm();
    initBackgroundMusic();
});

function initSplitTitle() {
    const title = document.querySelector("[data-split]");

    if (!title) {
        return;
    }

    const text = title.textContent.trim();
    const words = text.split(/\s+/);
    title.textContent = "";

    words.forEach((word, index) => {
        const span = document.createElement("span");
        span.textContent = word;
        span.style.animation = "letterIn 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards";
        span.style.animationDelay = `${index * 0.14}s`;
        title.appendChild(span);

        if (index !== words.length - 1) {
            title.appendChild(document.createTextNode(" "));
        }
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

        days.textContent = String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, "0");
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
    const gallery = document.querySelector(".gallery-track");

    const update = () => {
        const scrollY = window.scrollY || 0;

        if (heroImage) {
            heroImage.style.transform = `scale(${1.02 + Math.min(scrollY / 9000, 0.04)}) translateY(${scrollY * 0.018}px)`;
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

function initBackgroundMusic() {
    const audio = document.querySelector("#backgroundMusic");

    if (!audio) {
        return;
    }

    audio.volume = 0.45;

    const playMusic = () => {
        const promise = audio.play();

        if (promise && typeof promise.catch === "function") {
            promise.catch(() => {});
        }
    };

    playMusic();

    ["click", "touchstart", "keydown"].forEach((eventName) => {
        document.addEventListener(eventName, playMusic, { once: true, passive: true });
    });
}

function initRsvpForm() {
    const form = document.querySelector(".rsvp-form");

    if (!form) {
        return;
    }

    const message = form.querySelector(".form-success");
    const button = form.querySelector("button");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        form.classList.remove("rsvp-form--sent", "rsvp-form--error");
        form.classList.add("rsvp-form--loading");

        if (button) {
            button.textContent = "отправляем";
        }

        const formData = new FormData(form);
        const payload = {
            name: String(formData.get("name") || "").trim(),
            status: String(formData.get("status") || "").trim(),
            comment: String(formData.get("comment") || "").trim(),
        };

        try {
            const response = await fetch("/api/rsvp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("request failed");
            }

            form.classList.add("rsvp-form--sent");

            if (message) {
                message.textContent = "Спасибо! Ответ отправлен.";
            }

            form.reset();
        } catch (error) {
            form.classList.add("rsvp-form--error");

            if (message) {
                message.textContent = "Не получилось отправить ответ. Попробуйте ещё раз.";
            }
        } finally {
            form.classList.remove("rsvp-form--loading");

            if (button) {
                button.textContent = "отправить ответ";
            }
        }
    });
}
