import * as THREE from 'three';

// Shorthand — MeshToonMaterial is the Pixar/cel-shaded look
const toon = hex => new THREE.MeshToonMaterial({ color: hex });

const loader = new THREE.TextureLoader();
const loadTex = (path) => {
  const t = loader.load(path);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

export function buildPark(scene, renderer) {
  // ── Renderer quality ──────────────────────────────────────────
  renderer.toneMapping       = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.outputColorSpace  = THREE.SRGBColorSpace;
  renderer.shadowMap.type    = THREE.PCFSoftShadowMap;

  // Use the illustrated field panorama as the scene background
  const bgTex = loadTex('/textures/park_field.jpg');
  bgTex.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = bgTex;

  // Warm fog that matches the image's golden tones — blends 3D into the backdrop
  scene.fog = new THREE.FogExp2(0xC8A86B, 0.008);

  // ── Lighting ──────────────────────────────────────────────────
  // Warm sky / green ground hemisphere
  scene.add(new THREE.HemisphereLight(0xFFF2CC, 0x3A7A22, 0.9));

  // Main sun (golden hour, casts shadows)
  const sun = new THREE.DirectionalLight(0xFFD580, 2.4);
  sun.position.set(35, 55, 25);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left   = -60;  sun.shadow.camera.right = 60;
  sun.shadow.camera.top    =  60;  sun.shadow.camera.bottom = -60;
  sun.shadow.camera.far    = 200;
  sun.shadow.bias = -0.001;
  scene.add(sun);

  // Cool blue fill from the opposite side
  const fill = new THREE.DirectionalLight(0xA0C8FF, 0.5);
  fill.position.set(-25, 18, -15);
  scene.add(fill);

  // ── Field surface ─────────────────────────────────────────────
  // Outfield grass
  const grass = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), toon(0x2E7020));
  grass.rotation.x = -Math.PI / 2;
  grass.position.y = -0.02;
  grass.receiveShadow = true;
  scene.add(grass);

  // Outfield grass (lighter, slightly inside — creates mowing stripe effect)
  const grassLight = new THREE.Mesh(
    new THREE.RingGeometry(0, 28, 64, 1, Math.PI / 2, Math.PI),
    toon(0x3A8A2A)
  );
  grassLight.rotation.x = -Math.PI / 2;
  grassLight.position.y = -0.01;
  scene.add(grassLight);

  // Warning track
  const track = new THREE.Mesh(
    new THREE.RingGeometry(25.5, 28.5, 64, 1, Math.PI / 2, Math.PI),
    toon(0xAA8855)
  );
  track.rotation.x = -Math.PI / 2;
  track.position.y = 0.01;
  scene.add(track);

  // Infield dirt
  const dirt = new THREE.Mesh(new THREE.CircleGeometry(8.2, 64), toon(0xC89A6A));
  dirt.rotation.x = -Math.PI / 2;
  dirt.receiveShadow = true;
  scene.add(dirt);

  // Infield grass (diamond cutout inside dirt)
  // CircleGeometry with 4 segments = square; rotation aligns with bases
  const infieldGrass = new THREE.Mesh(new THREE.CircleGeometry(4.8, 4), toon(0x3A8C27));
  infieldGrass.rotation.x = -Math.PI / 2;
  infieldGrass.position.y = 0.005;
  scene.add(infieldGrass);

  // Batter's boxes
  for (const x of [-0.9, 0.9]) {
    const box = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 1.3), toon(0xD8AA78));
    box.rotation.x = -Math.PI / 2;
    box.position.set(x, 0.01, 5);
    scene.add(box);
  }

  // Foul lines (chalk)
  for (const sign of [-1, 1]) {
    const line = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 34), toon(0xFFFFFF));
    line.rotation.x = -Math.PI / 2;
    line.rotation.z = -sign * Math.PI / 4;
    line.position.set(sign * 12, 0.02, 12);
    scene.add(line);
  }

  // ── Bases & mound ─────────────────────────────────────────────
  const baseGeo = new THREE.BoxGeometry(0.65, 0.14, 0.65);
  const baseMat = toon(0xF8F8F2);
  for (const [x, z] of [[0, 5], [5, 0], [0, -5], [-5, 0]]) {
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.set(x, 0.07, z);
    base.castShadow = true;
    scene.add(base);
  }

  const mound = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 1.3, 0.38, 16), toon(0xC89A6A)
  );
  mound.position.set(0, 0.19, 0);
  mound.castShadow = true;
  scene.add(mound);

  const rubber = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.14), toon(0xFFFFFF));
  rubber.position.set(0, 0.4, 0);
  scene.add(rubber);

  // ── Outfield wall ─────────────────────────────────────────────
  // Vertical semi-circular wall, navy blue
  // thetaStart=π/2 → right foul line (x=28, z=0)
  // thetaLength=π  → sweeps through center field to left foul line (x=-28, z=0)
  const wallMain = new THREE.Mesh(
    new THREE.CylinderGeometry(28, 28, 4, 96, 1, true, Math.PI / 2, Math.PI),
    toon(0x002D62)
  );
  wallMain.position.y = 2;
  scene.add(wallMain);

  // Gold padding strip at base of wall
  const wallPad = new THREE.Mesh(
    new THREE.CylinderGeometry(28.1, 28.1, 1.1, 96, 1, true, Math.PI / 2, Math.PI),
    toon(0xFEC325)
  );
  wallPad.position.y = 0.55;
  scene.add(wallPad);

  // Dark cap at top of wall
  const wallCap = new THREE.Mesh(
    new THREE.CylinderGeometry(28.2, 28.2, 0.35, 96, 1, true, Math.PI / 2, Math.PI),
    toon(0x001535)
  );
  wallCap.position.y = 4.18;
  scene.add(wallCap);

  // ── Foul poles ────────────────────────────────────────────────
  const poleMat = toon(0xFFE600);
  for (const x of [-28, 28]) {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.14, 16, 8), poleMat
    );
    pole.position.set(x, 8, 0);
    scene.add(pole);
    // Horizontal flag guide at top
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 2.5), poleMat);
    bar.position.set(x, 15.9, -1.1);
    scene.add(bar);
  }

  // ── Stands bowl ───────────────────────────────────────────────
  // Lower bowl — angled outward (inner radius smaller at bottom)
  const lowerBowl = new THREE.Mesh(
    new THREE.CylinderGeometry(38, 30, 10, 96, 1, true, Math.PI / 2, Math.PI),
    toon(0x999999)
  );
  lowerBowl.position.y = 5;
  scene.add(lowerBowl);

  // Upper deck
  const upperDeck = new THREE.Mesh(
    new THREE.CylinderGeometry(46, 38, 8, 96, 1, true, Math.PI / 2, Math.PI),
    toon(0x7A7A7A)
  );
  upperDeck.position.y = 13;
  scene.add(upperDeck);

  // Seat color bands — Petco Park has navy/dark teal rows
  const SEAT_BANDS = [
    { r: 30.5, y: 1.5,  color: 0x1A3A8F },  // field level blue
    { r: 32.5, y: 3.0,  color: 0x002D62 },  // terrace navy
    { r: 34.5, y: 4.8,  color: 0x1A3A8F },  // club level
    { r: 36.5, y: 6.4,  color: 0x002D62 },  // upper reserve
    { r: 39,   y: 9.5,  color: 0x1A3A8F },  // upper deck lower
    { r: 43,   y: 13.5, color: 0x002D62 },  // upper deck upper
  ];
  for (const { r, y, color } of SEAT_BANDS) {
    const seats = new THREE.Mesh(
      new THREE.CylinderGeometry(r, r, 0.45, 96, 1, true, Math.PI / 2, Math.PI),
      toon(color)
    );
    seats.position.y = y;
    scene.add(seats);
  }

  // Stand top rim (concrete fascia)
  const rim = new THREE.Mesh(
    new THREE.CylinderGeometry(47, 47, 0.6, 96, 1, true, Math.PI / 2, Math.PI),
    toon(0x888888)
  );
  rim.position.y = 17.3;
  scene.add(rim);

  // ── Backstop ──────────────────────────────────────────────────
  // Half-cylinder wrapping behind home plate
  const backstop = new THREE.Mesh(
    new THREE.CylinderGeometry(7, 7, 7, 32, 1, true, -Math.PI / 2, Math.PI),
    toon(0x666666)
  );
  backstop.position.set(0, 3.5, 8);
  scene.add(backstop);

  // ── Light towers (6) ─────────────────────────────────────────
  for (let i = 0; i < 6; i++) {
    const θ = Math.PI / 2 + (i / 5) * Math.PI;
    const r = 50;
    addLightTower(scene, r * Math.sin(θ), r * Math.cos(θ));
  }

  // ── Western Metal Supply Co. building ─────────────────────────
  buildWMS(scene);

  // ── Scoreboard ────────────────────────────────────────────────
  buildScoreboard(scene);

  // ── Small park details ────────────────────────────────────────
  // Padres logo circle (center field batter's eye)
  const battersEye = new THREE.Mesh(
    new THREE.BoxGeometry(8, 6, 0.5), toon(0x002D62)
  );
  battersEye.position.set(0, 3, -28.2);
  scene.add(battersEye);
  const battersEyeTrim = new THREE.Mesh(
    new THREE.BoxGeometry(8.4, 6.4, 0.3), toon(0xFEC325)
  );
  battersEyeTrim.position.set(0, 3, -28);
  scene.add(battersEyeTrim);

  // ── Illustrated Pixar backdrops ───────────────────────────────
  buildBackdrops(scene);

  // ── Pitcher character ─────────────────────────────────────────
  buildPitcher(scene);

  // ── Crowd ─────────────────────────────────────────────────────
  buildCrowd(scene);
}

// ── Illustrated backdrops ─────────────────────────────────────────
function buildBackdrops(scene) {
  // Crowd — sits just behind the 3D upper deck, blending illustrated fans with geometry
  const crowdTex = loadTex('/textures/park_crowd.jpg');
  const crowdPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(90, 28),
    new THREE.MeshBasicMaterial({ map: crowdTex, transparent: true, opacity: 0.92 })
  );
  crowdPlane.position.set(0, 17, -52);
  scene.add(crowdPlane);

  // Exterior — left field wall, visible behind WMS building
  const extTex = loadTex('/textures/park_exterior.jpg');
  const extPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 18),
    new THREE.MeshBasicMaterial({ map: extTex, transparent: true, opacity: 0.88 })
  );
  extPlane.position.set(-44, 9, -2);
  extPlane.rotation.y = Math.PI / 2;
  scene.add(extPlane);
}

// ── Pitcher ───────────────────────────────────────────────────────
function buildPitcher(scene) {
  const pitcher = new THREE.Group();

  // Body
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.38, 0.3, 1.0, 8), toon(0x002D62)
  );
  body.position.y = 0.5;
  pitcher.add(body);

  // Head
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 16, 16), toon(0xC68642)
  );
  head.position.y = 1.3;
  pitcher.add(head);

  // Helmet
  const helmet = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 16, 16, 0, Math.PI * 2, 0, Math.PI / 1.8), toon(0x002D62)
  );
  helmet.position.y = 1.3;
  pitcher.add(helmet);

  // Glove arm (raised, ready to pitch)
  const gloveArm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.09, 0.75, 8), toon(0xC68642)
  );
  gloveArm.position.set(-0.5, 0.65, 0);
  gloveArm.rotation.z = Math.PI / 3;
  pitcher.add(gloveArm);

  // Glove
  const glove = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 10, 10), toon(0x7A3A10)
  );
  glove.position.set(-0.78, 1.05, 0);
  pitcher.add(glove);

  // Throwing arm (windup position — extended back)
  const throwArm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.09, 0.75, 8), toon(0x002D62)
  );
  throwArm.position.set(0.5, 0.7, 0.2);
  throwArm.rotation.z = -Math.PI / 4;
  throwArm.rotation.x = -Math.PI / 5;
  pitcher.add(throwArm);

  // Legs
  const legGeo = new THREE.CylinderGeometry(0.13, 0.11, 0.8, 8);
  const leftLeg = new THREE.Mesh(legGeo, toon(0xFFFFFF));
  leftLeg.position.set(-0.18, -0.1, 0);
  pitcher.add(leftLeg);

  // Kick leg (front leg raised slightly — windup)
  const kickLeg = new THREE.Mesh(legGeo, toon(0xFFFFFF));
  kickLeg.position.set(0.18, -0.05, -0.2);
  kickLeg.rotation.x = -Math.PI / 8;
  pitcher.add(kickLeg);

  // Place on mound, facing home plate (z+)
  pitcher.position.set(0, 0.58, 0);
  pitcher.rotation.y = Math.PI; // face home plate
  pitcher.castShadow = true;
  scene.add(pitcher);

  // Gentle idle sway animation stored on the group
  pitcher.userData.idleTime = 0;
  pitcher.userData.animate = (dt) => {
    pitcher.userData.idleTime += dt;
    const sway = Math.sin(pitcher.userData.idleTime * 1.2) * 0.015;
    pitcher.rotation.z = sway;
    glove.position.y = 1.05 + Math.sin(pitcher.userData.idleTime * 1.8) * 0.04;
  };

  return pitcher;
}

// ── Crowd ─────────────────────────────────────────────────────────
function buildCrowd(scene) {
  const FAN_COLORS  = [0x002D62, 0xFEC325, 0xFFFFFF, 0xC8102E, 0x1A3A8F, 0xFFA500];
  const SKIN_TONES  = [0xF1C27D, 0xC68642, 0x8D5524, 0xFFDBAC, 0xD4A574];

  const rng = seed => { const x = Math.sin(seed) * 43758.5453; return x - Math.floor(x); };

  // Each tier: r = arc radius, y = seat height, rows, fansPerRow
  const TIERS = [
    { r: 30.5, y: 1.8,  rows: 3, fansPerRow: 44 },
    { r: 36,   y: 6.2,  rows: 3, fansPerRow: 54 },
    { r: 42,   y: 11.5, rows: 2, fansPerRow: 62 },
  ];

  let idx = 0;
  for (const tier of TIERS) {
    for (let row = 0; row < tier.rows; row++) {
      const r = tier.r + row * 1.5;
      // y rises with radius to follow the bowl slope: ~0.7 units per 1.5r step
      const y = tier.y + row * 0.75;

      for (let f = 0; f < tier.fansPerRow; f++) {
        const t     = f / (tier.fansPerRow - 1);
        const angle = Math.PI / 2 + t * Math.PI; // right → left foul line

        const fan = new THREE.Group();

        // Body
        const bodyColor = FAN_COLORS[Math.floor(rng(idx * 7.3) * FAN_COLORS.length)];
        const body = new THREE.Mesh(
          new THREE.CylinderGeometry(0.2, 0.2, 0.5, 6),
          toon(bodyColor)
        );
        body.position.y = 0.25; // sits on group origin
        fan.add(body);

        // Head
        const skinColor = SKIN_TONES[Math.floor(rng(idx * 3.7) * SKIN_TONES.length)];
        const head = new THREE.Mesh(
          new THREE.SphereGeometry(0.17, 8, 8),
          toon(skinColor)
        );
        head.position.y = 0.67; // on top of body
        fan.add(head);

        // Occasional raised arm
        if (rng(idx * 1.9) > 0.8) {
          const arm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.055, 0.055, 0.38, 6),
            toon(bodyColor)
          );
          arm.position.set(rng(idx) > 0.5 ? 0.22 : -0.22, 0.65, 0);
          arm.rotation.z = (rng(idx) > 0.5 ? 1 : -1) * Math.PI / 4;
          fan.add(arm);
        }

        // Place group: x/z on arc, y = seat height, face inward toward field
        fan.position.set(
          r * Math.cos(angle),
          y,
          r * Math.sin(angle)
        );
        fan.rotation.y = angle + Math.PI; // face toward center

        scene.add(fan);
        idx++;
      }
    }
  }
}

// ── Light tower helper ────────────────────────────────────────────
function addLightTower(scene, x, z) {
  // Base plate
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(2, 0.5, 2), toon(0x555555)
  );
  base.position.set(x, 0.25, z);
  scene.add(base);

  // Main pole (tapers slightly)
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.38, 26, 8), toon(0xAAAAAA)
  );
  pole.position.set(x, 13, z);
  pole.castShadow = true;
  scene.add(pole);

  // Arm extending toward field
  const arm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 4, 6), toon(0x999999)
  );
  arm.rotation.z = Math.PI / 2;
  // Orient arm to point toward center of field (origin)
  arm.rotation.y = Math.atan2(x, z);
  arm.position.set(x, 25.8, z);
  scene.add(arm);

  // Light bank bar
  const bank = new THREE.Mesh(
    new THREE.BoxGeometry(6, 0.5, 0.9), toon(0xBBBBBB)
  );
  bank.position.set(x, 26.2, z);
  bank.rotation.y = Math.atan2(x, z); // face the field
  scene.add(bank);

  // Light fixtures on bank
  const bankAngle = Math.atan2(x, z);
  const bankDir = new THREE.Vector3(Math.sin(bankAngle + Math.PI / 2), 0, Math.cos(bankAngle + Math.PI / 2));
  for (let f = -2; f <= 2; f++) {
    const fixture = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.5, 0.35), toon(0xFFF8E0)
    );
    fixture.position.set(
      x + bankDir.x * f * 1.0,
      26.0,
      z + bankDir.z * f * 1.0
    );
    scene.add(fixture);
  }
}

// ── Western Metal Supply Co. ──────────────────────────────────────
function buildWMS(scene) {
  const pos = { x: -27, z: 13 };
  const H = 16; // building height

  // Main brick body
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(7, H, 5.5), toon(0x8B4010)
  );
  body.position.set(pos.x, H / 2, pos.z);
  body.castShadow = true;
  scene.add(body);

  // Horizontal brick course lines (4 floors)
  for (let f = 1; f <= 4; f++) {
    const course = new THREE.Mesh(
      new THREE.BoxGeometry(7.15, 0.28, 5.65), toon(0x6B2E08)
    );
    course.position.set(pos.x, f * (H / 4) - 0.14, pos.z);
    scene.add(course);
  }

  // Windows facing the field (front face: z = pos.z - 2.75)
  const frontZ = pos.z - 2.76;
  for (let f = 0; f < 4; f++) {
    for (let c = -1; c <= 1; c++) {
      // Glass
      const glass = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 1.6, 0.12), toon(0x90C8E0)
      );
      glass.position.set(pos.x + c * 2.1, 3.5 + f * 4, frontZ);
      scene.add(glass);
      // Dark frame
      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(1.45, 1.85, 0.08), toon(0x3A1A00)
      );
      frame.position.set(pos.x + c * 2.1, 3.5 + f * 4, frontZ + 0.03);
      scene.add(frame);
    }
  }

  // Roof deck (flat)
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(7.5, 0.4, 6), toon(0x444444)
  );
  roof.position.set(pos.x, H + 0.2, pos.z);
  scene.add(roof);

  // Roof railing
  const railing = new THREE.Mesh(
    new THREE.BoxGeometry(7.5, 1.1, 0.14), toon(0x222222)
  );
  railing.position.set(pos.x, H + 0.95, frontZ + 0.07);
  scene.add(railing);

  // WMS sign (gold bar across top)
  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(5, 1.4, 0.2), toon(0xFEC325)
  );
  sign.position.set(pos.x, H - 1.2, frontZ);
  scene.add(sign);

  // Corner pilasters
  for (const cx of [-3.5, 3.5]) {
    const pilaster = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, H, 0.4), toon(0x7A3508)
    );
    pilaster.position.set(pos.x + cx, H / 2, frontZ - 0.2);
    scene.add(pilaster);
  }
}

// ── Scoreboard ───────────────────────────────────────────────────
function buildScoreboard(scene) {
  const pos = { x: 8, z: -30 }; // right-center field, angled toward home

  // Main structure back wall
  const back = new THREE.Mesh(
    new THREE.BoxGeometry(14, 11, 1.2), toon(0x111111)
  );
  back.position.set(pos.x, 8, pos.z);
  back.rotation.y = -0.2; // slight angle toward home plate
  back.castShadow = true;
  scene.add(back);

  // Main video screen
  const screen = new THREE.Mesh(
    new THREE.BoxGeometry(10, 5.5, 0.5), toon(0x050E25)
  );
  screen.position.set(pos.x, 9, pos.z + 0.6);
  screen.rotation.y = -0.2;
  scene.add(screen);

  // Screen border glow (gold)
  const screenBorder = new THREE.Mesh(
    new THREE.BoxGeometry(10.5, 6, 0.4), toon(0xFEC325)
  );
  screenBorder.position.set(pos.x, 9, pos.z + 0.45);
  screenBorder.rotation.y = -0.2;
  scene.add(screenBorder);

  // Score/info strip below screen
  const infoStrip = new THREE.Mesh(
    new THREE.BoxGeometry(10, 1.4, 0.5), toon(0x002D62)
  );
  infoStrip.position.set(pos.x, 5.7, pos.z + 0.6);
  infoStrip.rotation.y = -0.2;
  scene.add(infoStrip);

  // Top logo box
  const logoBox = new THREE.Mesh(
    new THREE.BoxGeometry(5, 1.6, 0.5), toon(0xFEC325)
  );
  logoBox.position.set(pos.x, 13.8, pos.z + 0.6);
  logoBox.rotation.y = -0.2;
  scene.add(logoBox);

  // Support legs
  for (const dx of [-5.5, 5.5]) {
    const leg = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 5, 0.9), toon(0x333333)
    );
    leg.position.set(pos.x + dx * Math.cos(-0.2), 2.5, pos.z + dx * Math.sin(-0.2));
    leg.rotation.y = -0.2;
    scene.add(leg);
  }
}
