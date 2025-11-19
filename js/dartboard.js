const container = document.getElementById("dartboardContainer");

container.innerHTML = `
<svg id="dartboardSVG" viewBox="0 0 500 500">
    <circle cx="250" cy="250" r="250" fill="#000" />

    <!-- Simple ring layout for now -->
    <circle cx="250" cy="250" r="200" fill="#222" />
    <circle cx="250" cy="250" r="160" fill="#111" />
    <circle cx="250" cy="250" r="120" fill="#222" />
    <circle cx="250" cy="250" r="60" fill="#111" />
    <circle cx="250" cy="250" r="30" fill="green" />
    <circle cx="250" cy="250" r="15" fill="red" />
</svg>
`;

const svg = document.getElementById("dartboardSVG");
const output = document.getElementById("dartboardOutput");
const pulsingEnabled = document.getElementById("pulsingToggle");

svg.addEventListener("click", e => {
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left - 250;
    const y = e.clientY - rect.top - 250;
    const dist = Math.sqrt(x * x + y * y);

    let segment = "";

    if (dist < 15) segment = "Inner Bull (50)";
    else if (dist < 30) segment = "Outer Bull (25)";
    else if (dist < 60) segment = "Single (Inner)";
    else if (dist < 120) segment = "Treble";
    else if (dist < 160) segment = "Single (Outer)";
    else if (dist < 200) segment = "Double";
    else segment = "Miss";

    output.textContent = "You hit: " + segment;

    if (pulsingEnabled.checked) {
        svg.classList.add("pulse");
        setTimeout(() => svg.classList.remove("pulse"), 800);
    }
});
