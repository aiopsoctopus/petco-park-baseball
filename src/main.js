import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // sky blue

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

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

camera.position.set(0, 15, 20);
camera.lookAt(0, 0, 0);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();