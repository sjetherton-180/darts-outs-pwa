// Simple checkout list
const checkoutRoutes = {
    170: ["T20", "T20", "Bull"],
    167: ["T20", "T19", "Bull"],
    164: ["T20", "T18", "Bull"],
    161: ["T20", "T17", "Bull"]
};

export function getRandomCheckout() {
    const keys = Object.keys(checkoutRoutes);
    const pick = keys[Math.floor(Math.random() * keys.length)];
    return { score: pick, route: checkoutRoutes[pick] };
}

window.getRandomCheckout = getRandomCheckout;
