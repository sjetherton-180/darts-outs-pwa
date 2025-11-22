/* board.js
   Draws a dartboard on a canvas, detects clicks, and returns the correct
   sector number and ring ("inner-bull","outer-bull","triple","double","single","miss").

   Drop-in replacement for an incorrect clickable dartboard.
   Tweak DEFAULT_RADII if your image/artwork has different proportions.
*/

(function () {
  // Standard dartboard sector order (clockwise, 20 at top)
  const SECTOR_ORDER = [20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5];

  // How the board is visually represented — fractions of HALF_SIZE (radius)
  // Tweak these values to match your art. Default values are reasonable for a drawn board.
  const DEFAULT_RADII = {
    innerBull: 0.05,        // inner bull (50)
    outerBull: 0.12,        // outer bull (25)
    tripleRingInner: 0.40,  // inner edge of triple ring
    tripleRingOuter: 0.47,  // outer edge of triple ring
    doubleRingInner: 0.85,  // inner edge of double ring
    doubleRingOuter: 0.95   // outer edge of double ring (board edge)
  };

  // Colors for alternating sectors: outer single will alternate these; inner single uses muted variants
  const COLORS = {
    black: "#10121a",
    white: "#e9edf2",
    red: "#c92a2a",
    green: "#0f8f4f"
  };

  // Elements
  const canvas = document.getElementById("dartboard");
  const resultEl = document.getElementById("result");
  const debugToggle = document.getElementById("debugToggle");

  // Context and sizing
  let ctx, size, half, DPR;
  let radii = Object.assign({}, DEFAULT_RADII);

  // state for highlight
  let lastHit = null; // {sector, ring, angle, r}

  // Initialize
  function init() {
    if (!canvas) {
      console.error("No canvas element with id 'dartboard' found.");
      return;
    }
    ctx = canvas.getContext("2d");
    setupCanvasSize();
    window.addEventListener("resize", setupCanvasSize);
    canvas.addEventListener("pointerdown", onPointerDown);
    debugToggle.addEventListener("change", () => render());
    render();
  }

  // Handle high-DPI scaling and responsive size
  function setupCanvasSize() {
    // CSS size (what the canvas should appear as)
    const rect = canvas.getBoundingClientRect();
    // choose square size based on CSS layout (use width)
    const cssSize = Math.min(rect.width, rect.height);
    canvas.style.width = cssSize + "px";
    canvas.style.height = cssSize + "px";

    DPR = Math.max(1, window.devicePixelRatio || 1);
    size = Math.floor(cssSize * DPR);
    canvas.width = size;
    canvas.height = size;
    half = size / 2;
    // re-render visuals
    render();
  }

  // Main render function — draws board and highlight
  function render() {
    if (!ctx) return;
    // clear
    ctx.clearRect(0,0,size,size);

    // draw background circle
    ctx.save();
    ctx.translate(half, half);

    drawSectors();
    drawRings();
    drawNumbers();
    if (lastHit) drawHighlight(lastHit);
    ctx.restore();

    // draw debug info (overlay)
    if (debugToggle && debugToggle.checked) {
      drawDebug();
    }
  }

  // draw 20 sectors (simple alternating color pattern)
  function drawSectors() {
    const sectorAngle = (2 * Math.PI) / 20;
    const outer = radii.doubleRingOuter * half;
    const inner = radii.outerBull * half; // start inner from outer bull outward
    for (let i = 0; i < 20; i++) {
      const start = -Math.PI/2 + i * sectorAngle; // -90deg so sector 0 is at top
      const end = start + sectorAngle;

      // choose color for single outer band (alternating)
      const isDark = i % 2 === 0;
      // Draw outer single wedge (from triple outer to double inner)
      drawWedge(start, end, radii.tripleRingOuter * half, radii.doubleRingOuter * half, isDark ? COLORS.black : COLORS.white);

      // Draw inner single wedge (from outerBull to triple inner)
      drawWedge(start, end, radii.outerBull * half, radii.tripleRingInner * half, isDark ? COLORS.white : COLORS.black);
    }
  }

  // Draw triple and double rings and bulls
  function drawRings() {
    // double ring
    drawRing(radii.doubleRingInner * half, radii.doubleRingOuter * half, COLORS.red, COLORS.green);

    // triple ring
    drawRing(radii.tripleRingInner * half, radii.tripleRingOuter * half, COLORS.green, COLORS.red);

    // outer bull (25) and inner bull (50)
    // outer bull ring
    ctx.beginPath();
    ctx.arc(0,0, radii.outerBull * half, 0, Math.PI*2);
    ctx.fillStyle = COLORS.white;
    ctx.fill();

    // inner bull
    ctx.beginPath();
    ctx.arc(0,0, radii.innerBull * half, 0, Math.PI*2);
    ctx.fillStyle = COLORS.red;
    ctx.fill();
  }

  // draw alternating colored ring between innerRadius and outerRadius; sectors alternate color
  function drawRing(innerRadius, outerRadius, colorA, colorB) {
    const sectorAngle = (2 * Math.PI) / 20;
    for (let i = 0; i < 20; i++) {
      const start = -Math.PI/2 + i * sectorAngle;
      const end = start + sectorAngle;
      const isEven = i % 2 === 0;
      drawWedge(start, end, innerRadius, outerRadius, isEven ? colorA : colorB);
    }
  }

  // draw a wedge between two radii and angles at the centered origin
  function drawWedge(startAngle, endAngle, innerR, outerR, fillStyle) {
    ctx.beginPath();
    ctx.moveTo(innerR * Math.cos(startAngle), innerR * Math.sin(startAngle));
    ctx.lineTo(outerR * Math.cos(startAngle), outerR * Math.sin(startAngle));
    ctx.arc(0, 0, outerR, startAngle, endAngle);
    ctx.lineTo(innerR * Math.cos(endAngle), innerR * Math.sin(endAngle));
    ctx.arc(0, 0, innerR, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }

  // draw numbers around the board
  function drawNumbers() {
    const sectorAngle = (2 * Math.PI) / 20;
    const labelRadius = radii.doubleRingOuter * half + 18 * DPR;
    ctx.font = `${14 * DPR}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#e6eef7";
    for (let i = 0; i < 20; i++) {
      const ang = -Math.PI/2 + (i + 0.5) * sectorAngle; // center of sector
      const num = SECTOR_ORDER[i];
      const x = labelRadius * Math.cos(ang);
      const y = labelRadius * Math.sin(ang);
      ctx.fillText(String(num), x, y);
    }
  }

  // draw a highlight for the last hit
  function drawHighlight(hit) {
    const {sector, ring, _angle, _r} = hit;
    if (!sector) return;
    const sectorIdx = SECTOR_ORDER.indexOf(sector);
    const sectorAngle = (2 * Math.PI) / 20;
    const start = -Math.PI/2 + sectorIdx * sectorAngle;
    const end = start + sectorAngle;
    let innerR, outerR;
    if (ring === "inner-bull") {
      ctx.beginPath();
      ctx.arc(0,0, radii.innerBull * half + 6*DPR, 0, Math.PI*2);
      ctx.fillStyle = "rgba(255,230,128,0.95)";
      ctx.fill();
      return;
    } else if (ring === "outer-bull") {
      ctx.beginPath();
      ctx.arc(0,0, radii.outerBull * half + 6*DPR, 0, Math.PI*2);
      ctx.fillStyle = "rgba(255,230,128,0.85)";
      ctx.fill();
      return;
    } else if (ring === "triple") {
      innerR = radii.tripleRingInner * half - 2*DPR;
      outerR = radii.tripleRingOuter * half + 2*DPR;
    } else if (ring === "double") {
      innerR = radii.doubleRingInner * half - 2*DPR;
      outerR = radii.doubleRingOuter * half + 2*DPR;
    } else if (ring === "single") {
      innerR = radii.outerBull * half;
      outerR = radii.tripleRingInner * half;
    } else {
      // miss or outside
      return;
    }
    // draw semi-transparent wedge overlay
    ctx.beginPath();
    ctx.moveTo(innerR * Math.cos(start), innerR * Math.sin(start));
    ctx.lineTo(outerR * Math.cos(start), outerR * Math.sin(start));
    ctx.arc(0, 0, outerR, start, end);
    ctx.lineTo(innerR * Math.cos(end), innerR * Math.sin(end));
    ctx.arc(0, 0, innerR, end, start, true);
    ctx.closePath();
    ctx.fillStyle = "rgba(255,230,128,0.55)";
    ctx.fill();

    // small marker dot at clicked radius and angle
    const dotR = Math.min(Math.max(_r, innerR + 6*DPR), outerR - 6*DPR);
    const dotX = dotR * Math.cos(_angle);
    const dotY = dotR * Math.sin(_angle);
    ctx.beginPath();
    ctx.arc(dotX, dotY, 6*DPR, 0, Math.PI*2);
    ctx.fillStyle = "#ff7700";
    ctx.fill();
  }

  // Draw debug overlay text in top-left of canvas (in canvas pixels)
  function drawDebug() {
    if (!lastHit) return;
    const text = `angle: ${Math.round(lastHit._angleDeg)}°\nsectorIdx: ${lastHit._sectorIndex}\nsector: ${lastHit.sector}\ndistance: ${Math.round(lastHit._r)}px\nring: ${lastHit.ring}`;
    const lines = text.split("\n");
    ctx.save();
    ctx.translate(-half + 12 * DPR, -half + 12 * DPR);
    ctx.font = `${11 * DPR}px monospace`;
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(-6 * DPR, -6 * DPR, 160 * DPR, (lines.length * 14 + 8) * DPR);
    ctx.fillStyle = "#fff";
    lines.forEach((l, i) => ctx.fillText(l, 0, i * 14 * DPR));
    ctx.restore();
  }

  // Pointer handler to get click coords and compute hit
  function onPointerDown(ev) {
    ev.preventDefault();
    const rect = canvas.getBoundingClientRect();
    // client coords -> canvas pixel coords (account for DPR)
    const x = (ev.clientX - rect.left) * DPR;
    const y = (ev.clientY - rect.top) * DPR;
    const hit = getDartboardHit(x, y, size, radii);
    lastHit = {
      sector: hit.sector,
      ring: hit.ring,
      _angle: hit._angleRad,
      _angleDeg: hit._angleDeg,
      _r: hit._distance,
      _sectorIndex: hit._sectorIndex
    };
    updateResultDisplay(hit);
    render();
  }

  // Show result in overlay element
  function updateResultDisplay(hit) {
    if (!hit.sector) {
      resultEl.textContent = "Miss";
      return;
    }
    if (hit.ring === "inner-bull") {
      resultEl.textContent = "50 (Inner Bull)";
    } else if (hit.ring === "outer-bull") {
      resultEl.textContent = "25 (Outer Bull)";
    } else {
      resultEl.textContent = `${hit.ring.toUpperCase()} x ${hit.sector} = ${scoreFor(hit)}`;
    }
  }

  // compute numeric score for ring & sector
  function scoreFor(hit) {
    if (!hit.sector) return 0;
    if (hit.ring === "double") return hit.sector * 2;
    if (hit.ring === "triple") return hit.sector * 3;
    if (hit.ring === "single") return hit.sector;
    return 0;
  }

  /**
   * Convert click coordinates to sector and ring.
   * @param {Number} clickX - x in canvas pixels (0..size)
   * @param {Number} clickY - y in canvas pixels (0..size)
   * @param {Number} canvasSize - canvas full pixel size (width == height)
   * @param {Object} radiiFractions - fractions for ring positions (same as DEFAULT_RADII)
   * @returns {Object} {sector: Number|null, ring: String, _angleRad, _angleDeg, _distance, _sectorIndex}
   */
  function getDartboardHit(clickX, clickY, canvasSize, radiiFractions) {
    const cx = canvasSize / 2;
    const cy = canvasSize / 2;
    const dx = clickX - cx;
    const dy = clickY - cy;
    const r = Math.sqrt(dx*dx + dy*dy);
    let theta = Math.atan2(dy, dx); // radians, 0 at +X, CCW positive
    // Convert to angle where 0 is top (12 o'clock), clockwise positive
    let deg = theta * 180 / Math.PI; // -180..180, 0 = +X
    deg = (deg + 90 + 360) % 360; // shift so 0=top, normalize to [0,360)
    const radClock = deg * Math.PI / 180; // angle in radians from top clockwise
    // sector index (0..19)
    const sectorIndex = Math.floor(deg / 18) % 20;
    const sectorNumber = SECTOR_ORDER[sectorIndex];

    const half = canvasSize / 2;
    const conf = radiiFractions || DEFAULT_RADII;

    // pixel radii
    const rInnerBull = conf.innerBull * half;
    const rOuterBull = conf.outerBull * half;
    const rTripleInner = conf.tripleRingInner * half;
    const rTripleOuter = conf.tripleRingOuter * half;
    const rDoubleInner = conf.doubleRingInner * half;
    const rDoubleOuter = conf.doubleRingOuter * half;

    let ring = "miss";
    if (r <= rInnerBull) {
      ring = "inner-bull";
    } else if (r <= rOuterBull) {
      ring = "outer-bull";
    } else if (r >= rDoubleInner && r <= rDoubleOuter) {
      ring = "double";
    } else if (r >= rTripleInner && r <= rTripleOuter) {
      ring = "triple";
    } else if (r < rDoubleInner) {
      ring = "single";
    } else {
      ring = "miss";
    }

    // Max allowed radius for being "on board"
    const maxBoardRadius = rDoubleOuter;
    return {
      sector: (r <= maxBoardRadius) ? sectorNumber : null,
      ring,
      _angleRad: radClock,
      _angleDeg: Math.round(deg*100)/100,
      _distance: Math.round(r),
      _sectorIndex: sectorIndex
    };
  }

  // expose for debug in console
  window.__darts = {
    getDartboardHit,
    redraw: render,
    setRadii: function(newRadii){ radii = Object.assign({}, radii, newRadii); render(); }
  };

  // init on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
