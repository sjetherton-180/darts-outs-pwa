window.renderDartboard = function(containerId) {
    const container = document.getElementById(containerId);

    container.innerHTML = `
        <svg id="dartboard" viewBox="0 0 500 500">
            <circle cx="250" cy="250" r="240" fill="#000"></circle>

            <!-- OUTER SINGLE -->
            ${createRing(170, false)}

            <!-- TREBLE -->
            ${createRing(110, true)}

            <!-- INNER SINGLE -->
            ${createRing(70, false)}

            <!-- DOUBLE -->
            ${createRing(210, true)}

            <!-- BULL -->
            <circle cx="250" cy="250" r="30" fill="#4b0000"
                class="segment" data-name="Bull" data-score="25"></circle>

            <circle cx="250" cy="250" r="15" fill="#ff3333"
                class="segment" data-name="Bullseye" data-score="50"></circle>
        </svg>
    `;

    // Add events
    container.querySelectorAll(".segment").forEach(seg => {
        seg.addEventListener("click", () => {
            const name = seg.dataset.name;
            const score = parseInt(seg.dataset.score);
            const isDouble = name.startsWith("D");

            window.pickThrow(name, score, isDouble);
        });
    });
};

function createRing(radius, isMultiplierRing) {
    let html = "";
    const numbers = [
        20, 1, 18, 4, 13, 6, 10, 15, 2, 17,
        3, 19, 7, 16, 8, 11, 14, 9, 12, 5
    ];

    const ringWidth = 20;
    const multiplier = isMultiplierRing ? 3 : 1;

    for (let i = 0; i < 20; i++) {
        const angle1 = (i * 18 - 90) * (Math.PI / 180);
        const angle2 = ((i + 1) * 18 - 90) * (Math.PI / 180);

        const x1 = 250 + radius * Math.cos(angle1);
        const y1 = 250 + radius * Math.sin(angle1);
        const x2 = 250 + radius * Math.cos(angle2);
        const y2 = 250 + radius * Math.sin(angle2);

        const label = numbers[i];
        const score = label * multiplier;
        const name = (isMultiplierRing ? "T" : radius > 150 ? "D" : "S") + label;

        html += `
            <path d="
                M 250 250
                L ${x1} ${y1}
                A ${radius} ${radius} 0 0 1 ${x2} ${y2}
                Z"
                fill="${i % 2 === 0 ? '#222' : '#444'}"
                class="segment"
                data-name="${name}"
                data-score="${score}">
            </path>
        `;
    }

    return html;
}
