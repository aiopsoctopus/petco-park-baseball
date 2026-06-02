import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // sky blue

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Infield dirt
const dirtGeo = new THREE.CircleGeometry(8, 32);
const dirtMat = new THREE.MeshBasicMaterial({ color: 0xC2956C });
const dirt = new THREE.Mesh(dirtGeo, dirtMat);
dirt.rotation.x = -Math.PI / 2;
scene.add(dirt);

// Grass
const grassGeo = new THREE.PlaneGeometry(40, 40);
const grassMat = new THREE.MeshBasicMaterial({ color: 0x2D5A1B });
const grass = new THREE.Mesh(grassGeo, grassMat);
grass.rotation.x = -Math.PI / 2;
grass.position.y = -0.01;
scene.add(grass);

// Bases
const baseGeo = new THREE.BoxGeometry(0.6, 0.1, 0.6);
const baseMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });

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
const moundMat = new THREE.MeshBasicMaterial({ color: 0xC2956C });
const mound = new THREE.Mesh(moundGeo, moundMat);
mound.position.set(0, 0.15, 0);
scene.add(mound);

// Outfield wall
const wallShape = new THREE.RingGeometry(28, 29.5, 32, 1, 0, Math.PI);
const wallMat = new THREE.MeshBasicMaterial({ color: 0x002D62, side: THREE.DoubleSide });
const wall = new THREE.Mesh(wallShape, wallMat);
wall.rotation.x = -Math.PI / 2;
wall.position.y = 0.01;
scene.add(wall);

// Stands
const standsShape = new THREE.RingGeometry(29.5, 38, 32, 1, 0, Math.PI);
const standsMat = new THREE.MeshBasicMaterial({ color: 0x8B8B8B, side: THREE.DoubleSide });
const stands = new THREE.Mesh(standsShape, standsMat);
stands.rotation.x = -Math.PI / 2;
stands.position.y = 0.01;
scene.add(stands);

// Foul lines
const lineMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
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
const wmsMat = new THREE.MeshBasicMaterial({ color: 0x8B4513 }); // brick brown
const wmsBuilding = new THREE.Mesh(wmsGeo, wmsMat);
wmsBuilding.position.set(-26, 4, 10);
scene.add(wmsBuilding);

// WMS rooftop seating (flat top)
const roofGeo = new THREE.BoxGeometry(4.5, 0.3, 4.5);
const roofMat = new THREE.MeshBasicMaterial({ color: 0x555555 });
const roof = new THREE.Mesh(roofGeo, roofMat);
roof.position.set(-26, 8.15, 10);
scene.add(roof);

// Scoreboard (center field)
const boardGeo = new THREE.BoxGeometry(8, 5, 0.5);
const boardMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
const scoreboard = new THREE.Mesh(boardGeo, boardMat);
scoreboard.position.set(0, 4, -29);
scene.add(scoreboard);

// Scoreboard screen (gold)
const screenGeo = new THREE.BoxGeometry(6.5, 3.5, 0.6);
const screenMat = new THREE.MeshBasicMaterial({ color: 0xFEC325 });
const screen = new THREE.Mesh(screenGeo, screenMat);
screen.position.set(0, 4.2, -29);
scene.add(screen);

camera.position.set(0, 15, 20);
camera.lookAt(0, 0, 0);

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();