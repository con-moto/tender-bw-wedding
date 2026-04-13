// COUNTDOWN
(function () {
  const targetDate = new Date("2026-07-25T00:00:00+03:00").getTime();

  const daysEl = document.getElementById("cd-days");
  const hoursEl = document.getElementById("cd-hours");
  const minutesEl = document.getElementById("cd-minutes");
  const secondsEl = document.getElementById("cd-seconds");

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  function pad(num) {
    return num.toString().padStart(2, "0");
  }

  function updateCountdown() {
    const now = Date.now();
    let diff = targetDate - now;

    if (diff <= 0) {
      daysEl.textContent = "00";
      hoursEl.textContent = "00";
      minutesEl.textContent = "00";
      secondsEl.textContent = "00";
      clearInterval(timerId);
      return;
    }

    const seconds = Math.floor(diff / 1000);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    daysEl.textContent = pad(days);
    hoursEl.textContent = pad(hours);
    minutesEl.textContent = pad(minutes);
    secondsEl.textContent = pad(secs);
  }

  updateCountdown();
  const timerId = setInterval(updateCountdown, 1000);
})();

// TIMELINE ORDER ON MOBILE (<=902px)
(function () {
  const BREAKPOINT = 902;
  const timeline = document.querySelector(".timeline");
  if (!timeline) return;

  const leftCol = timeline.querySelector(".timeline__col--left");
  const rightCol = timeline.querySelector(".timeline__col--right");
  if (!leftCol || !rightCol) return;

  const itemsOrderDesktop = {
    left: Array.from(leftCol.children),
    right: Array.from(rightCol.children),
  };

  const MOBILE_ORDER = ["12:00", "15:00", "16:30", "21:00", "23:30"];

  let isMobileApplied = false;

  function applyMobileOrder() {
    if (isMobileApplied) return;
    isMobileApplied = true;

    const allItems = [...itemsOrderDesktop.left, ...itemsOrderDesktop.right];

    const ordered = MOBILE_ORDER.map((time) => {
      return allItems.find((item) =>
        item
          .querySelector(".timeline__text")
          ?.textContent.trim()
          .startsWith(time)
      );
    }).filter(Boolean);

    leftCol.innerHTML = "";
    rightCol.innerHTML = "";

    ordered.forEach((item) => {
      leftCol.appendChild(item);
    });
  }

  function restoreDesktopOrder() {
    if (!isMobileApplied) return;
    isMobileApplied = false;

    leftCol.innerHTML = "";
    rightCol.innerHTML = "";

    itemsOrderDesktop.left.forEach((item) => leftCol.appendChild(item));
    itemsOrderDesktop.right.forEach((item) => rightCol.appendChild(item));
  }

  function onResize() {
    if (window.innerWidth <= BREAKPOINT) {
      applyMobileOrder();
    } else {
      restoreDesktopOrder();
    }
  }

  window.addEventListener("resize", onResize);
  onResize();
})();

/// FORM HANDLERS (Vercel backend)
(function () {
  function attachFormHandler(formId, statusId) {
    const form = document.getElementById(formId);
    if (!form) return;

    const statusEl = statusId ? document.getElementById(statusId) : null;

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (statusEl) statusEl.textContent = "Отправляем...";

      const formData = new FormData(form);
      const plain = {};

      formData.forEach((value, key) => {
        if (plain[key]) {
          // если несколько значений с одним ключом (alcohol[])
          if (!Array.isArray(plain[key])) {
            plain[key] = [plain[key]];
          }
          plain[key].push(value);
        } else {
          plain[key] = value;
        }
      });

      fetch(form.action, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(plain),
      })
        .then((response) => response.json())
        .then((data) => {
          if (statusEl) {
            if (data.success) {
              statusEl.textContent =
                data.message || "Спасибо! Форма отправлена.";
              form.reset();
            } else {
              statusEl.textContent =
                "Произошла ошибка. Попробуйте позже.";
            }
          }
        })
        .catch((error) => {
          console.error(error);
          if (statusEl) {
            statusEl.textContent =
              "Произошла ошибка. Попробуйте позже.";
          }
        });
    });
  }

  attachFormHandler("details-form", "details-status");
  attachFormHandler("rsvp-form", "rsvp-status");
})();