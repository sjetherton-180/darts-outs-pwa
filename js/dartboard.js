
// dartboard.js - full interactive SVG dartboard with clickable S/T/D segments and bulls
(function(){
  const ORDER = [20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5];
  const ns = "http://www.w3.org/2000/svg";

  const container = document.getElementById('dartboard-root') || document.body;

  // Create SVG
  const SVG_SIZE = 1000; // large for crisp scaling
  const cx = SVG_SIZE/2, cy = SVG_SIZE/2;
  const svg = document.createElementNS(ns,'svg');
  svg.setAttribute('id','interactive-dartboard');
  svg.setAttribute('viewBox',`0 0 ${SVG_SIZE} ${SVG_SIZE}`);
  svg.setAttribute('width','100%');
  svg.setAttribute('height','auto');
  svg.setAttribute('role','img');
  svg.setAttribute('aria-label','Interactive dartboard');

  // Radii (tweak visually if needed)
  const R_OUTER = SVG_SIZE*0.48;         // outermost edge
  const R_DOUBLE_IN = R_OUTER * 0.88;
  const R_DOUBLE_OUT = R_OUTER;
  const R_SINGLE_OUTER_IN = R_DOUBLE_IN;
  const R_SINGLE_OUTER_OUT = R_OUTER * 0.72;
  const R_TRIPLE_IN = R_OUTER * 0.56;
  const R_TRIPLE_OUT = R_OUTER * 0.64;
  const R_SINGLE_INNER_IN = R_TRIPLE_IN;
  const R_SINGLE_INNER_OUT = R_TRIPLE_OUT;
  const R_BULL_OUTER = R_OUTER * 0.12;  // outer bull radius
  const R_BULL_INNER = R_OUTER * 0.05;  // inner bull radius

  function pt(angleDeg, radius){
    const a = (angleDeg - 90) * Math.PI/180;
    return { x: cx + Math.cos(a)*radius, y: cy + Math.sin(a)*radius };
  }

  function makeWedgePath(rIn, rOut, angA, angB){
    const p1 = pt(angA, rOut);
    const p2 = pt(angB, rOut);
    const p3 = pt(angB, rIn);
    const p4 = pt(angA, rIn);
    const large = (angB - angA) > 180 ? 1 : 0;
    return `M ${p1.x} ${p1.y} A ${rOut} ${rOut} 0 ${large} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${rIn} ${rIn} 0 ${large} 0 ${p4.x} ${p4.y} Z`;
  }

  function createPath(d, attrs){
    const p = document.createElementNS(ns,'path');
    p.setAttribute('d', d);
    for(const k in attrs) p.setAttribute(k, attrs[k]);
    return p;
  }

  const g = document.createElementNS(ns,'g');
  g.setAttribute('transform', `translate(0,0)`);
  svg.appendChild(g);

  // background
  const bg = document.createElementNS(ns,'circle');
  bg.setAttribute('cx', cx);
  bg.setAttribute('cy', cy);
  bg.setAttribute('r', R_OUTER);
  bg.setAttribute('fill', '#07121a');
  g.appendChild(bg);

  const wedgeAngle = 360 / 20;
  for(let i=0;i<20;i++){
    const angA = i * wedgeAngle;
    const angB = (i+1) * wedgeAngle;
    const num = ORDER[i];

    // DOUBLE ring (outer)
    const dDouble = makeWedgePath(R_DOUBLE_IN, R_DOUBLE_OUT, angA, angB);
    const colorDouble = (i % 2 === 0) ? '#c92b2b' : '#0b8a3d';
    const elD = createPath(dDouble, {
      fill: colorDouble,
      stroke: '#07121a',
      'stroke-width': 2,
      'data-name': 'D' + num,
      'data-value': String(2 * num),
      'data-isdouble': '1',
      class: 'segment double-seg'
    });
    g.appendChild(elD);

    // Single outer
    const dSout = makeWedgePath(R_SINGLE_OUTER_IN, R_SINGLE_OUTER_OUT, angA, angB);
    const colorSout = (i % 2 === 0) ? '#f3f3f3' : '#0f1111';
    const elSO = createPath(dSout, {
      fill: colorSout,
      stroke: '#07121a',
      'stroke-width': 1,
      'data-name': 'S' + num,
      'data-value': String(num),
      'data-isdouble': '0',
      class: 'segment single-outer-seg'
    });
    g.appendChild(elSO);

    // Triple ring
    const dTriple = makeWedgePath(R_TRIPLE_IN, R_TRIPLE_OUT, angA, angB);
    const colorTriple = (i % 2 === 0) ? '#c92b2b' : '#0b8a3d';
    const elT = createPath(dTriple, {
      fill: colorTriple,
      stroke: '#07121a',
      'stroke-width': 1,
      'data-name': 'T' + num,
      'data-value': String(3 * num),
      'data-isdouble': '0',
      class: 'segment triple-seg'
    });
    g.appendChild(elT);

    // Single inner
    const dSin = makeWedgePath(R_SINGLE_INNER_IN, R_SINGLE_INNER_OUT, angA, angB);
    const colorSin = (i % 2 === 0) ? '#f3f3f3' : '#0f1111';
    const elSI = createPath(dSin, {
      fill: colorSin,
      stroke: '#07121a',
      'stroke-width': 1,
      'data-name': 'S' + num,
      'data-value': String(num),
      'data-isdouble': '0',
      class: 'segment single-inner-seg'
    });
    g.appendChild(elSI);
  }

  // Bulls
  const sb = document.createElementNS(ns,'circle');
  sb.setAttribute('cx', cx);
  sb.setAttribute('cy', cy);
  sb.setAttribute('r', R_BULL_OUTER);
  sb.setAttribute('fill','#0b8a3d');
  sb.setAttribute('data-name','SB');
  sb.setAttribute('data-value','25');
  sb.setAttribute('data-isdouble','0');
  sb.setAttribute('class','segment sbull');
  g.appendChild(sb);

  const db = document.createElementNS(ns,'circle');
  db.setAttribute('cx', cx);
  db.setAttribute('cy', cy);
  db.setAttribute('r', R_BULL_INNER);
  db.setAttribute('fill','#c92b2b');
  db.setAttribute('data-name','DB');
  db.setAttribute('data-value','50');
  db.setAttribute('data-isdouble','1');
  db.setAttribute('class','segment dbull');
  g.appendChild(db);

  // Numbers
  const numGroup = document.createElementNS(ns,'g');
  numGroup.setAttribute('class','numbers');
  g.appendChild(numGroup);
  const labelRadius = R_OUTER * 1.03;
  for(let i=0;i<20;i++){
    const ang = (i + 0.5) * wedgeAngle;
    const pos = pt(ang, labelRadius);
    const text = document.createElementNS(ns,'text');
    text.setAttribute('x', pos.x);
    text.setAttribute('y', pos.y);
    text.setAttribute('text-anchor','middle');
    text.setAttribute('dominant-baseline','central');
    text.setAttribute('font-size', String(Math.round(SVG_SIZE*0.045)));
    text.setAttribute('fill','#ffffff');
    text.setAttribute('pointer-events','none');
    text.textContent = ORDER[i];
    numGroup.appendChild(text);
  }

  // Event delegation for clicks
  svg.addEventListener('click', function(evt){
    // find ancestor with data-name
    let el = evt.target;
    while(el && !el.getAttribute('data-name')){
      if(el === svg) { el = null; break; }
      el = el.parentNode;
    }
    if(!el) return;
    const name = el.getAttribute('data-name');
    const value = parseInt(el.getAttribute('data-value') || '0', 10) || 0;
    const isDouble = el.getAttribute('data-isdouble') === '1';

    // visual feedback: highlight clicked element briefly, fade others
    // remove existing highlights
    svg.querySelectorAll('.highlight').forEach(h=>h.classList.remove('highlight'));
    svg.querySelectorAll('.faded').forEach(f=>f.classList.remove('faded'));

    el.classList.add('highlight');
    // fade siblings for clarity
    svg.querySelectorAll('.segment').forEach(s=>{ if(s!==el) s.classList.add('faded'); });

    setTimeout(()=>{
      el.classList.remove('highlight');
      svg.querySelectorAll('.faded').forEach(f=>f.classList.remove('faded'));
    }, 700);

    // call host pickThrow if available
    if(typeof window.pickThrow === 'function'){
      try{ window.pickThrow(name, value, isDouble); } catch(e){ console.warn('pickThrow error', e); }
    } else {
      console.log('Clicked', name, value, isDouble);
    }
  }, {passive:true});

  // Append SVG
  container.appendChild(svg);

  // Expose function to rebuild if needed
  window.rebuildInteractiveBoard = function(){ container.removeChild(svg); /* could recreate - left intentionally minimal */ };
})(); 
