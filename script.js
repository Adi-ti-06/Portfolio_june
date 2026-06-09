/* ===== THREE.JS BACKGROUND ===== */
(function () {
  const canvas = document.getElementById('bg-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 30;

  /* Particle field */
  const particleCount = 1800;
  const positions = new Float32Array(particleCount * 3);
  const colors    = new Float32Array(particleCount * 3);
  const sizes     = new Float32Array(particleCount);

  const palette = [
    new THREE.Color('#a78bfa'),
    new THREE.Color('#60a5fa'),
    new THREE.Color('#22d3ee'),
    new THREE.Color('#f472b6'),
    new THREE.Color('#818cf8'),
  ];

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 120;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 120;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
    const c = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3]     = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
    sizes[i] = Math.random() * 2 + 0.5;
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
  geom.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

  const mat = new THREE.PointsMaterial({
    size: 0.18,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particles = new THREE.Points(geom, mat);
  scene.add(particles);

  /* Floating geometric shapes */
  const shapes = [];
  function addShape(geometry, color, x, y, z) {
    const m = new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.08 });
    const mesh = new THREE.Mesh(geometry, m);
    mesh.position.set(x, y, z);
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    scene.add(mesh);
    shapes.push({ mesh, speed: Math.random() * 0.003 + 0.001, axis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize() });
  }

  addShape(new THREE.IcosahedronGeometry(6, 1),  0xa78bfa, -25,  10, -20);
  addShape(new THREE.OctahedronGeometry(4, 0),   0x60a5fa,  20,  -8, -15);
  addShape(new THREE.TetrahedronGeometry(5, 0),  0x22d3ee,   5,  18, -25);
  addShape(new THREE.IcosahedronGeometry(3, 0),  0xf472b6, -15, -15, -10);
  addShape(new THREE.OctahedronGeometry(5, 1),   0x818cf8,  28,  15, -30);

  /* Neural network lines */
  const lineGroup = new THREE.Group();
  scene.add(lineGroup);
  const nodePos = [];
  for (let i = 0; i < 20; i++) {
    nodePos.push(new THREE.Vector3(
      (Math.random() - 0.5) * 80,
      (Math.random() - 0.5) * 60,
      (Math.random() - 0.5) * 40 - 20
    ));
  }
  for (let i = 0; i < nodePos.length; i++) {
    for (let j = i + 1; j < nodePos.length; j++) {
      const dist = nodePos[i].distanceTo(nodePos[j]);
      if (dist < 25) {
        const lm = new THREE.LineBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.04 * (1 - dist / 25), blending: THREE.AdditiveBlending });
        lineGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([nodePos[i], nodePos[j]]), lm));
      }
    }
  }

  /* Mouse parallax */
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
  });

  let scrollY = 0;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.005;
    particles.rotation.y = t * 0.05 + mouseX * 0.03;
    particles.rotation.x = mouseY * 0.02;
    shapes.forEach(({ mesh, speed, axis }) => mesh.rotateOnAxis(axis, speed));
    lineGroup.rotation.y = t * 0.02;
    camera.position.x += (mouseX * 2 - camera.position.x) * 0.02;
    camera.position.y += (mouseY * 1.5 - camera.position.y) * 0.02;
    camera.position.z  = 30 + scrollY * 0.01;
    renderer.render(scene, camera);
  }
  animate();
})();

/* ===== NAVBAR SCROLL ===== */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 50));

/* ===== HAMBURGER MENU ===== */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

/* ===== TYPEWRITER ===== */
const phrases = [
  'Building AI Products',
  'CNN & Deep Learning',
  'Product Intern @ Neoflo AI',
  'VP @ Linpack Club',
  'Turning Ideas into Reality',
];

const el = document.getElementById('typewriter');
let phraseIdx = 0, charIdx = 0, deleting = false;

function type() {
  const phrase = phrases[phraseIdx];
  if (!deleting) {
    el.textContent = phrase.slice(0, ++charIdx);
    if (charIdx === phrase.length) { setTimeout(() => { deleting = true; type(); }, 2000); return; }
  } else {
    el.textContent = phrase.slice(0, --charIdx);
    if (charIdx === 0) { deleting = false; phraseIdx = (phraseIdx + 1) % phrases.length; }
  }
  setTimeout(type, deleting ? 50 : 80);
}
type();

/* ===== COUNTER ANIMATION ===== */
function animateCounters() {
  document.querySelectorAll('.stat-num[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target);
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 40));
    const interval = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current;
      if (current >= target) clearInterval(interval);
    }, 40);
  });
}

/* ===== SCROLL REVEAL ===== */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.glass-card, .skill-item, .project-card, .timeline-item, .contact-item, .detail-card, .cert-card').forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

/* ===== SKILL BAR ANIMATION ===== */
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.skill-fill').forEach(fill => { fill.style.width = fill.dataset.width + '%'; });
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.skills-content').forEach(el => skillObserver.observe(el));

/* ===== COUNTER TRIGGER ===== */
const heroObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => { if (entry.isIntersecting) { animateCounters(); heroObserver.unobserve(entry.target); } });
}, { threshold: 0.5 });

const statsEl = document.querySelector('.hero-stats');
if (statsEl) heroObserver.observe(statsEl);

/* ===== TABS ===== */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + tab).classList.add('active');
    document.getElementById('tab-' + tab).querySelectorAll('.skill-fill').forEach(fill => {
      fill.style.width = '0';
      setTimeout(() => { fill.style.width = fill.dataset.width + '%'; }, 50);
    });
  });
});

/* ===== CONTACT FORM ===== */
document.getElementById('contact-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.textContent = 'Sent! ✓';
  btn.style.background = 'linear-gradient(135deg, #22d3ee, #60a5fa)';
  setTimeout(() => { btn.textContent = 'Send Message ↗'; btn.style.background = ''; e.target.reset(); }, 3000);
});

/* ===== PROJECT CARD GLOW FOLLOW MOUSE ===== */
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const glow = card.querySelector('.project-glow');
    if (glow) glow.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(167,139,250,0.08), transparent 60%)`;
  });
});

/* ===== ACTIVE NAV LINK ON SCROLL ===== */
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-links a');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navItems.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => navObserver.observe(s));
