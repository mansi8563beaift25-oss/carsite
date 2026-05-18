const pages = document.querySelectorAll(".page");
const pageLinks = document.querySelectorAll("[data-page-link]");
const navLinks = document.getElementById("navLinks");
const menuToggle = document.querySelector(".menu-toggle");
const favoriteButtons = document.querySelectorAll(".favorite");
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const serviceCards = document.querySelectorAll("[data-service-tab]");
const serviceTitle = document.getElementById("serviceTitle");
const serviceText = document.getElementById("serviceText");
const serviceList = document.getElementById("serviceList");
const serviceTime = document.getElementById("serviceTime");
const statCounters = document.querySelectorAll("[data-count]");
const budgetSelect = document.getElementById("budgetSelect");
const findMatchButton = document.getElementById("findMatch");
const inventoryResult = document.getElementById("inventoryResult");
const inventoryCards = document.querySelectorAll("#inventory .car-card");
const interestSelect = contactForm?.querySelector("[name='interest']");
const carChoiceSelect = document.getElementById("carChoice");
const customModelInput = document.getElementById("customModel");
const servicePanel = document.querySelector(".service-panel");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let statsAnimated = false;
let revealObserver;

const services = {
    review: {
        title: "Video Review",
        text: "Get a detailed remote walkaround before you visit, including exterior, interior, start-up, and road feel notes.",
        time: "30 min",
        points: [
            "4K exterior and interior walkaround",
            "Cold start and dashboard check",
            "Advisor comments on condition"
        ]
    },
    inspection: {
        title: "Inspection",
        text: "We verify condition, documents, history, mileage, paint, tires, and service quality before you move forward.",
        time: "2 hours",
        points: [
            "Technical diagnostics and legal history",
            "Paint and body condition review",
            "Service records and ownership check"
        ]
    },
    finance: {
        title: "Credit & Leasing",
        text: "A finance plan is shaped around your deposit, preferred term, monthly target, and ownership style.",
        time: "1 day",
        points: [
            "Credit and leasing comparison",
            "Deposit and monthly payment planning",
            "Partner bank offer preparation"
        ]
    },
    trade: {
        title: "Trade-in",
        text: "Send details of your current vehicle and receive a clear trade-in estimate that can be applied to your next car.",
        time: "45 min",
        points: [
            "Market valuation and condition review",
            "Trade-in offer summary",
            "Smooth handover with your new car"
        ]
    }
};

function closeMenu() {
    if (!navLinks || !menuToggle) {
        return;
    }

    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    document.body.classList.remove("menu-open");
}

function showPage(pageId) {
    if (!document.getElementById(pageId)) {
        pageId = "home";
    }

    pages.forEach((page) => {
        page.classList.toggle("active", page.id === pageId);
    });

    document.querySelectorAll(".nav-link").forEach((link) => {
        link.classList.toggle("active-link", link.dataset.pageLink === pageId);
    });

    document.body.classList.toggle("on-home", pageId === "home");
    closeMenu();
    window.scrollTo({ top: 0, behavior: "smooth" });
    refreshRevealAnimations(pageId);

    if (pageId === "about") {
        animateStats();
    }
}

function navigateTo(pageId) {
    showPage(pageId);
    history.replaceState(null, "", `#${pageId}`);
}

function getCarSummary(card) {
    if (!card) {
        return "";
    }

    const name = card.querySelector("h3")?.textContent?.trim() || "";
    const price = card.querySelector(".price-row strong")?.textContent?.trim() || "";

    return [name, price].filter(Boolean).join(" - ");
}

function populateCarChoices() {
    if (!carChoiceSelect) {
        return;
    }

    const cars = [...inventoryCards]
        .map(getCarSummary)
        .filter(Boolean);

    cars.forEach((car) => {
        const option = document.createElement("option");
        option.value = car;
        option.textContent = car;
        carChoiceSelect.append(option);
    });

    const otherOption = document.createElement("option");
    otherOption.value = "Other";
    otherOption.textContent = "Other model";
    carChoiceSelect.append(otherOption);
}

function updateCarChoiceRequirement() {
    if (!interestSelect || !carChoiceSelect) {
        return;
    }

    const needsCar = interestSelect.value === "Car selection";
    const needsCustomModel = needsCar && carChoiceSelect.value === "Other";

    carChoiceSelect.required = needsCar;
    carChoiceSelect.disabled = !needsCar;
    carChoiceSelect.toggleAttribute("aria-required", needsCar);

    if (customModelInput) {
        customModelInput.hidden = !needsCustomModel;
        customModelInput.disabled = !needsCustomModel;
        customModelInput.required = needsCustomModel;
        customModelInput.toggleAttribute("aria-required", needsCustomModel);

        if (!needsCustomModel) {
            customModelInput.value = "";
        }
    }

    if (!needsCar) {
        carChoiceSelect.value = "";
    }
}

function prefillContactCar(card) {
    if (!interestSelect || !carChoiceSelect) {
        return;
    }

    const car = getCarSummary(card);

    if (!car) {
        return;
    }

    interestSelect.value = "Car selection";
    updateCarChoiceRequirement();
    carChoiceSelect.value = car;
}

pageLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();

        if (link.dataset.pageLink === "contact") {
            prefillContactCar(link.closest(".car-card"));
        }

        navigateTo(link.dataset.pageLink);
    });
});

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
        document.body.classList.toggle("menu-open", isOpen);
    });
}

favoriteButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const isSaved = button.classList.toggle("is-saved");
        button.textContent = isSaved ? "OK" : "+";
    });
});

function updateService(serviceId) {
    const selectedService = services[serviceId];

    if (!selectedService || !serviceTitle || !serviceText || !serviceList || !serviceTime) {
        return;
    }

    serviceTitle.textContent = selectedService.title;
    serviceText.textContent = selectedService.text;
    serviceTime.textContent = selectedService.time;
    serviceList.innerHTML = selectedService.points.map((point) => `<li>${point}</li>`).join("");
    animateServicePanel();

    serviceCards.forEach((card) => {
        const isActive = card.dataset.serviceTab === serviceId;
        const button = card.querySelector("button");

        card.classList.toggle("is-active", isActive);
        card.setAttribute("aria-selected", String(isActive));

        if (button) {
            button.textContent = isActive ? "Selected" : "View details";
        }
    });
}

function animateServicePanel() {
    if (!servicePanel || prefersReducedMotion) {
        return;
    }

    servicePanel.classList.remove("is-changing");
    void servicePanel.offsetWidth;
    servicePanel.classList.add("is-changing");

    window.setTimeout(() => {
        servicePanel.classList.remove("is-changing");
    }, 380);
}

function setupRevealAnimations() {
    const revealSelectors = [
        ".hero-copy",
        ".steps-grid article",
        ".advantage-grid article",
        ".section-title-row",
        ".inventory-tools",
        ".car-card",
        ".faq-heading",
        ".faq-list details",
        ".speed-banner",
        ".service-panel",
        ".service-card",
        ".process-strip div",
        ".about-story",
        ".stats-panel",
        ".about-grid article",
        ".timeline div",
        ".contact-copy",
        ".contact-cards article",
        ".showroom-card",
        ".contact-panel",
        ".footer > div"
    ];

    const revealItems = document.querySelectorAll(revealSelectors.join(","));

    revealItems.forEach((item, index) => {
        item.classList.add("reveal-on-scroll");
        item.style.setProperty("--reveal-index", index % 7);
    });

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
        revealItems.forEach((item) => item.classList.add("is-visible"));
        return;
    }

    revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
        });
    }, {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.12
    });

    revealItems.forEach((item) => revealObserver.observe(item));
}

function refreshRevealAnimations(pageId) {
    if (!revealObserver) {
        return;
    }

    const activePage = document.getElementById(pageId);

    if (!activePage) {
        return;
    }

    requestAnimationFrame(() => {
        activePage.querySelectorAll(".reveal-on-scroll:not(.is-visible)").forEach((item) => {
            revealObserver.observe(item);
        });
    });
}

serviceCards.forEach((card) => {
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");

    card.addEventListener("click", () => {
        updateService(card.dataset.serviceTab);
    });

    card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            updateService(card.dataset.serviceTab);
        }
    });

    const button = card.querySelector("button");

    if (button) {
        button.addEventListener("click", (event) => {
            event.stopPropagation();
            updateService(card.dataset.serviceTab);
        });
    }
});

if (serviceCards.length) {
    updateService("review");
}

function animateStats() {
    if (statsAnimated) {
        return;
    }

    statsAnimated = true;

    statCounters.forEach((counter) => {
        const target = Number(counter.dataset.count);
        const suffix = counter.dataset.suffix || "";
        const duration = 900;
        const startedAt = performance.now();

        function tick(currentTime) {
            const progress = Math.min((currentTime - startedAt) / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const value = Math.round(target * easedProgress);

            counter.textContent = `${value}${suffix}`;

            if (progress < 1) {
                requestAnimationFrame(tick);
            }
        }

        requestAnimationFrame(tick);
    });
}

function getCardPrice(card) {
    const priceText = card.querySelector(".price-row strong")?.textContent || "";
    return Number(priceText.replace(/[^0-9]/g, ""));
}

function findInventoryMatch() {
    if (!budgetSelect || !inventoryResult) {
        return;
    }

    const budget = Number(budgetSelect.value);
    const matches = [...inventoryCards]
        .map((card) => ({ card, price: getCardPrice(card) }))
        .filter((item) => item.price && item.price <= budget)
        .sort((a, b) => b.price - a.price);

    inventoryCards.forEach((card) => card.classList.remove("is-featured"));

    if (!matches.length) {
        inventoryResult.textContent = "No match in that range yet. Choose a higher budget or request a custom search.";
        return;
    }

    const bestMatch = matches[0].card;
    const name = bestMatch.querySelector("h3")?.textContent || "this automobile";
    const price = bestMatch.querySelector(".price-row strong")?.textContent || "";

    bestMatch.classList.add("is-featured");
    inventoryResult.textContent = `Best match: ${name} at ${price}.`;
    bestMatch.scrollIntoView({ behavior: "smooth", block: "center" });
}

if (findMatchButton) {
    findMatchButton.addEventListener("click", findInventoryMatch);
}

populateCarChoices();
updateCarChoiceRequirement();

if (interestSelect) {
    interestSelect.addEventListener("change", updateCarChoiceRequirement);
}

if (carChoiceSelect) {
    carChoiceSelect.addEventListener("change", updateCarChoiceRequirement);
}

if (contactForm && formStatus) {
    contactForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(contactForm);
        const name = formData.get("name") || "there";
        const interest = formData.get("interest") || "your request";
        const carChoice = formData.get("carChoice");
        const customModel = formData.get("customModel")?.toString().trim();

        if (interest === "Car selection" && !carChoice) {
            formStatus.textContent = "Please choose an automobile before sending a car selection request.";
            carChoiceSelect?.focus();
            return;
        }

        if (interest === "Car selection" && carChoice === "Other" && !customModel) {
            formStatus.textContent = "Please enter the model you want us to source.";
            customModelInput?.focus();
            return;
        }

        formStatus.textContent = `Thank you, ${name}. Your ${interest} request is ready for a LuxeAuto advisor.`;
        contactForm.reset();
        updateCarChoiceRequirement();
    });
}

setupRevealAnimations();

const initialPage = window.location.hash.replace("#", "") || "home";
showPage(initialPage);

window.addEventListener("hashchange", () => {
    const pageId = window.location.hash.replace("#", "") || "home";
    showPage(pageId);
});
