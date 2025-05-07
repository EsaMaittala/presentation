document.addEventListener("DOMContentLoaded", () => {
    const slides = document.querySelectorAll(".slide");
    const progressBar = document.getElementById("scroll-progress-bar");
    const sideNavUl = document.querySelector(".side-nav ul");
    let holidayChartInstance = null;
    let chartRendered = false;
  
    const rootStyles = getComputedStyle(document.documentElement);
  
    function getCssVariable(variableName, fallbackColor = "black") {
      const value = rootStyles.getPropertyValue(variableName).trim();
      return value || fallbackColor;
    }
  
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.4,
    };
  
    const animationObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          updateSideNav(entry.target.id);
  
          if (entry.target.id === "slide-holiday-journey" && !chartRendered) {
            renderHolidayChart();
            chartRendered = true;
          }
        }
      });
    }, observerOptions);
  
    slides.forEach((slide) => {
      animationObserver.observe(slide);
  
      const slideName =
        slide.dataset.slideName ||
        slide.id.replace("slide-", "").replace("-", " ");
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `#${slide.id}`;
      a.setAttribute("aria-label", `Go to ${slideName} section`);
      a.title = slideName;
      a.dataset.targetId = slide.id;
      li.appendChild(a);
      sideNavUl.appendChild(li);
    });
  
    const sideNavLinks = sideNavUl.querySelectorAll("a");
  
    function updateSideNav(activeSlideId) {
      sideNavLinks.forEach((link) => {
        link.classList.toggle(
          "active-nav",
          link.dataset.targetId === activeSlideId
        );
      });
    }
  
    sideNavUl.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        e.preventDefault();
        const targetId = e.target.getAttribute("href");
        document.querySelector(targetId).scrollIntoView({
          behavior: "smooth",
        });
      }
    });
  
    function updateProgressBar() {
      const scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scrolled = (scrollTop / scrollHeight) * 100;
      progressBar.style.width = scrolled + "%";
    }
    window.addEventListener("scroll", updateProgressBar);
  
    function renderHolidayChart() {
      const ctx = document.getElementById("holidayChart");
      if (!ctx) return;
  
      const accentColor = getCssVariable("--accent-color", "#FFD700");
      const textColor = getCssVariable("--text-color", "#F0F0F0");
      const textDarkColor = getCssVariable("--text-dark", "#333333");
      const primaryColor = getCssVariable("--primary-color", "#0A2A43");
      const secondaryColor = getCssVariable("--secondary-color", "#B22234");
  
      let datasetBgColor = "rgba(178, 34, 52, 0.2)";
      if (/^#([0-9A-F]{3}){1,2}$/i.test(secondaryColor)) {
        const r = parseInt(secondaryColor.slice(1, 3), 16);
        const g = parseInt(secondaryColor.slice(3, 5), 16);
        const b = parseInt(secondaryColor.slice(5, 7), 16);
        datasetBgColor = `rgba(${r}, ${g}, ${b}, 0.2)`;
      }
  
      if (holidayChartInstance) {
        holidayChartInstance.destroy();
      }
      holidayChartInstance = new Chart(ctx.getContext("2d"), {
        type: "line",
        data: {
          labels: ["Late 1700s", "1820s", "1826", "1870", "1938-41", "Present"],
          datasets: [
            {
              label: "Significance",
              data: [10, 35, 50, 75, 90, 95],
              borderColor: secondaryColor,
              backgroundColor: datasetBgColor,
              tension: 0.3,
              fill: true,
              pointBackgroundColor: primaryColor,
              pointBorderColor: accentColor,
              pointHoverRadius: 8,
              pointHoverBorderWidth: 2,
              pointRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                color: textDarkColor,
                callback: function (value) {
                  return value + "%";
                },
              },
              grid: { color: "rgba(0,0,0,0.1)" },
            },
            x: {
              ticks: { color: textDarkColor },
              grid: { display: false },
            },
          },
          plugins: {
            legend: {
              labels: {
                color: textDarkColor,
                font: { size: 14 },
              },
            },
            tooltip: {
              backgroundColor: "rgba(0,0,0,0.85)",
              titleColor: accentColor,
              bodyColor: textColor,
              padding: 12,
              callbacks: {
                label: function (context) {
                  return `${context.dataset.label || ""}: ${context.parsed.y}%`;
                },
              },
            },
          },
          animation: {
            duration: 1500,
            easing: "easeInOutQuart",
          },
        },
      });
    }
  
    updateProgressBar();
    setTimeout(() => {
      slides.forEach((slide) => {
        const rect = slide.getBoundingClientRect();
        if (
          rect.top < window.innerHeight &&
          rect.bottom >= 0 &&
          !slide.classList.contains("is-visible")
        ) {
          animationObserver.unobserve(slide);
          animationObserver.observe(slide);
        }
      });
      if (
        slides[0] &&
        slides[0].getBoundingClientRect().top >= 0 &&
        slides[0].getBoundingClientRect().top < window.innerHeight * 0.5
      ) {
        updateSideNav(slides[0].id);
      }
    }, 100);
  });