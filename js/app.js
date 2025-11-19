// Page Navigation
const pages = document.querySelectorAll(".page");
const navButtons = document.querySelectorAll(".nav-btn");

navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const target = btn.dataset.page;
        pages.forEach(p => p.classList.remove("active"));
        document.getElementById(target).classList.add("active");
    });
});

// Trainer logic (uses checkout.js)
document.getElementById("startTrainer").onclick = () => {
    const target = getRandomCheckout();
    window.currentCheckout = target;
    document.getElementById("trainerDisplay").textContent =
        "Your target: " + target.score;
};

document.getElementById("showAnswer").onclick = () => {
    if (!window.currentCheckout) return;
    document.getElementById("trainerDisplay").textContent =
        "Route: " + window.currentCheckout.route.join(" → ");
};
