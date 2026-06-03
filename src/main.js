import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createAvatar } from './avatar.js';
import { createUI } from './ui.js';
import { createFieldingDrill } from './drill_fielding.js';
import { createHittingDrill } from './drill_hitting.js';
import { createBaseRunningDrill } from './drill_baserunning.js';
import { createMainMenu } from './menu.js';
import { createScoring } from './scoring.js';
import { buildPark } from './scene_park.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

const { avatar, headMat, bodyMat } = createAvatar(scene);
createUI(headMat, bodyMat);

// Drill switcher
let activeDrill = null;

// Drill selector buttons
const hittingBtn = document.createElement('button');
hittingBtn.textContent = 'Hitting';
hittingBtn.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%) translateX(-160px);padding:10px 20px;font-size:0.95em;font-weight:bold;background:#002D62;color:#FEC325;border:2px solid #FEC325;border-radius:8px;cursor:pointer;z-index:200;';
document.body.appendChild(hittingBtn);

const basesBtn = document.createElement('button');
basesBtn.textContent = 'Base Running';
basesBtn.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);padding:10px 20px;font-size:0.95em;font-weight:bold;background:#002D62;color:#FEC325;border:2px solid #FEC325;border-radius:8px;cursor:pointer;z-index:200;';
document.body.appendChild(basesBtn);

const fieldingBtn = document.createElement('button');
fieldingBtn.textContent = 'Fielding';
fieldingBtn.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%) translateX(160px);padding:10px 20px;font-size:0.95em;font-weight:bold;background:#002D62;color:#FEC325;border:2px solid #FEC325;border-radius:8px;cursor:pointer;z-index:200;';
document.body.appendChild(fieldingBtn);

hittingBtn.addEventListener('click', () => { window.location.search = '?drill=hitting'; });
basesBtn.addEventListener('click',   () => { window.location.search = '?drill=bases'; });
fieldingBtn.addEventListener('click', () => { window.location.search = '?drill=fielding'; });

const params = new URLSearchParams(window.location.search);
const drillParam = params.get('drill'); // null on main menu

if (drillParam) {
  const scoring = createScoring(drillParam);
  scoring.load();
  window.addEventListener('beforeunload', () => scoring.save());
  activeDrill = drillParam === 'fielding'  ? createFieldingDrill(scene, avatar, scoring)
             : drillParam === 'bases'     ? createBaseRunningDrill(scene, avatar, scoring)
             : createHittingDrill(scene, scoring);
} else {
  // Main menu — hide drill nav buttons, they're in the menu panel instead
  hittingBtn.style.display = 'none';
  basesBtn.style.display   = 'none';
  fieldingBtn.style.display = 'none';
  activeDrill = createMainMenu(scene, avatar);
}

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

controls.maxPolarAngle = Math.PI / 2.2;
controls.maxDistance = 80;

buildPark(scene, renderer);

if (drillParam) {
  camera.position.set(0, 8, 12);
  controls.target.set(0, 0, 0);
  controls.minDistance = 10;
} else {
  // Angle slightly left so avatar sits in the right half of viewport
  camera.position.set(-2, 2, 7.5);
  controls.target.set(2.5, 1.2, 3);
  controls.minDistance = 3;
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  if (activeDrill) activeDrill.update();
  renderer.render(scene, camera);
}

animate();