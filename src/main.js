import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createAvatar } from './avatar.js';
import { createUI } from './ui.js';
import { createFieldingDrill } from './drill_fielding.js';
import { createHittingDrill } from './drill_hitting.js';
import { createBaseRunningDrill } from './drill_baserunning.js';
import { createMainMenu } from './menu.js';
import { createScoring } from './scoring.js';

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
  const scoring = createScoring();
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

controls.maxPolarAngle = Math.PI / 2.2; // prevents going underground
controls.minDistance = 10;
controls.maxDistance = 80;
controls.target.set(0, 0, 0);

// Infield dirt
const dirtGeo = new THREE.CircleGeometry(8, 32);
const dirtMat = new THREE.MeshLambertMaterial({ color: 0xC2956C });
const dirt = new THREE.Mesh(dirtGeo, dirtMat);
dirt.rotation.x = -Math.PI / 2;
scene.add(dirt);

// Grass
const grassGeo = new THREE.PlaneGeometry(40, 40);
const grassMat = new THREE.MeshLambertMaterial({ color: 0x2D5A1B });
const grass = new THREE.Mesh(grassGeo, grassMat);
grass.rotation.x = -Math.PI / 2;
grass.position.y = -0.01;
scene.add(grass);

// Bases
const baseGeo = new THREE.BoxGeometry(0.6, 0.1, 0.6);
const baseMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });

const homeBase = new THREE.Mesh(baseGeo, baseMat);
homeBase.position.set(0, 0, 5);
scene.add(homeBase);

const firstBase = new THREE.Mesh(baseGeo, baseMat);
firstBase.position.set(5, 0, 0);
scene.add(firstBase);

const secondBase = new THREE.Mesh(baseGeo, baseMat);
secondBase.position.set(0, 0, -5);
scene.add(secondBase);

const thirdBase = new THREE.Mesh(baseGeo, baseMat);
thirdBase.position.set(-5, 0, 0);
scene.add(thirdBase);

// Pitcher's mound
const moundGeo = new THREE.CylinderGeometry(1, 1.2, 0.3, 16);
const moundMat = new THREE.MeshLambertMaterial({ color: 0xC2956C });
const mound = new THREE.Mesh(moundGeo, moundMat);
mound.position.set(0, 0.15, 0);
scene.add(mound);

// Outfield wall
const wallShape = new THREE.RingGeometry(28, 29.5, 32, 1, 0, Math.PI);
const wallMat = new THREE.MeshLambertMaterial({ color: 0x002D62, side: THREE.DoubleSide });
const wall = new THREE.Mesh(wallShape, wallMat);
wall.rotation.x = -Math.PI / 2;
wall.position.y = 0.01;
scene.add(wall);

// Stands
const standsShape = new THREE.RingGeometry(29.5, 38, 32, 1, 0, Math.PI);
const standsMat = new THREE.MeshLambertMaterial({ color: 0x8B8B8B, side: THREE.DoubleSide });
const stands = new THREE.Mesh(standsShape, standsMat);
stands.rotation.x = -Math.PI / 2;
stands.position.y = 0.01;
scene.add(stands);

// Foul lines
const lineMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
const lineGeo = new THREE.PlaneGeometry(0.15, 28);

const leftFoul = new THREE.Mesh(lineGeo, lineMat);
leftFoul.rotation.x = -Math.PI / 2;
leftFoul.rotation.z = Math.PI / 4;
leftFoul.position.set(-9.9, 0.02, 9.9);
scene.add(leftFoul);

const rightFoul = new THREE.Mesh(lineGeo, lineMat);
rightFoul.rotation.x = -Math.PI / 2;
rightFoul.rotation.z = -Math.PI / 4;
rightFoul.position.set(9.9, 0.02, 9.9);
scene.add(rightFoul);

// Western Metal Supply Building (left field corner)
const wmsGeo = new THREE.BoxGeometry(4, 8, 4);
const wmsMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // brick brown
const wmsBuilding = new THREE.Mesh(wmsGeo, wmsMat);
wmsBuilding.position.set(-26, 4, 10);
scene.add(wmsBuilding);

// WMS rooftop seating (flat top)
const roofGeo = new THREE.BoxGeometry(4.5, 0.3, 4.5);
const roofMat = new THREE.MeshLambertMaterial({ color: 0x555555 });
const roof = new THREE.Mesh(roofGeo, roofMat);
roof.position.set(-26, 8.15, 10);
scene.add(roof);

// Scoreboard (center field)
const boardGeo = new THREE.BoxGeometry(8, 5, 0.5);
const boardMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
const scoreboard = new THREE.Mesh(boardGeo, boardMat);
scoreboard.position.set(0, 4, -29);
scene.add(scoreboard);

// Scoreboard screen (gold)
const screenGeo = new THREE.BoxGeometry(6.5, 3.5, 0.6);
const screenMat = new THREE.MeshLambertMaterial({ color: 0xFEC325 });
const screen = new THREE.Mesh(screenGeo, screenMat);
screen.position.set(0, 4.2, -29);
scene.add(screen);

// Ambient light (soft base)
const ambientLight = new THREE.AmbientLight(0xffeedd, 0.6);
scene.add(ambientLight);

// Sun (golden hour angle)
const sunLight = new THREE.DirectionalLight(0xFFD580, 1.2);
sunLight.position.set(20, 30, 10);
scene.add(sunLight);

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

function animate() {
  requestAnimationFrame(animate);
  controls.update();
if (activeDrill) activeDrill.update();
  renderer.render(scene, camera);
}

animate();