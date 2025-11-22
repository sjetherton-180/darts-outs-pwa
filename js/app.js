let trainerInput = [];

window.pickThrow = function(name, score, isDouble) {
    document.getElementById("lastHit").textContent = name;
    trainerInput.push(name);
    updateCurrentInputDisplay();
};

function updateCurrentInputDisplay() {
    document.getElementById("currentInput").textContent =
        trainerInput.length ? trainerInput.join(" → ") : "No darts selected";
}

document.getElementById("checkRouteBtn").addEventListener("click", () => {
    const correctRoute = ["T20", "T20", "D20"]; // example for 120
    const result = JSON.stringify(trainerInput) === JSON.stringify(correctRoute);

    document.getElementById("trainerResult").textContent =
        result ? "✅ Correct checkout!" : "❌ Not the optimal finish.";

    trainerInput = [];
    updateCurrentInputDisplay();
});
