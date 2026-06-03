import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const assetPath = '/CSE-160/asgn5/';

// SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x02040f);
scene.fog = new THREE.Fog(0x02040f, 10, 38);

// TEXTURES
const textureLoader = new THREE.TextureLoader();

const grassTexture = textureLoader.load(`${assetPath}textures/grass.jpg`);
grassTexture.wrapS = THREE.RepeatWrapping;
grassTexture.wrapT = THREE.RepeatWrapping;
grassTexture.repeat.set(40, 40);

const woodTexture = textureLoader.load(`${assetPath}textures/wood.png`);
woodTexture.wrapS = THREE.RepeatWrapping;
woodTexture.wrapT = THREE.RepeatWrapping;
woodTexture.repeat.set(2, 1);

// CAMERA
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(8, 5.5, 10);

// RENDERER
const renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

document.body.style.margin = 0;
document.body.style.overflow = 'hidden';
document.body.appendChild(renderer.domElement);

// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1, 0);
controls.maxPolarAngle = Math.PI / 2.1;
controls.minDistance = 4;
controls.maxDistance = 22;

// LIGHTS
const ambientLight = new THREE.AmbientLight(0x8899bb, 0.1);
scene.add(ambientLight);

const moonLight = new THREE.DirectionalLight(0xaaccff, 0.65);
moonLight.position.set(6, 12, 8);
moonLight.castShadow = true;
scene.add(moonLight);

const hemisphereLight = new THREE.HemisphereLight(0x99bbff, 0x223311, 0.3);
scene.add(hemisphereLight);

const fireLight = new THREE.PointLight(0xff6600, 45, 18);
fireLight.position.set(0, 2, 0);
scene.add(fireLight);

// GROUND
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(80, 80),
  new THREE.MeshStandardMaterial({
    map: grassTexture,
    roughness: 0.95
  })
);

ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// MOON
const moon = new THREE.Mesh(
  new THREE.SphereGeometry(2, 32, 32),
  new THREE.MeshBasicMaterial({
    color: 0xe6f3ff
  })
);

moon.position.set(-40, 35, -60);
scene.add(moon);

// CAMPFIRE
const fire = new THREE.Mesh(
  new THREE.ConeGeometry(0.32, 1.5, 7),
  new THREE.MeshStandardMaterial({
    color: 0xff5522,
    emissive: 0xff2200,
    emissiveIntensity: 1.6
  })
);

fire.position.set(0, 0.75, 0);
fire.castShadow = true;
scene.add(fire);

const smallFire = new THREE.Mesh(
  new THREE.ConeGeometry(0.18, 1.1, 6),
  new THREE.MeshStandardMaterial({
    color: 0xffcc33,
    emissive: 0xffaa00,
    emissiveIntensity: 1.3
  })
);

smallFire.position.set(0, 0.65, 0);
smallFire.castShadow = true;
scene.add(smallFire);

// FIRE GLOW ON GROUND
const fireGlow = new THREE.Mesh(
  new THREE.CircleGeometry(2.2, 32),
  new THREE.MeshBasicMaterial({
    color: 0xff6622,
    transparent: true,
    opacity: 0.18
  })
);

fireGlow.rotation.x = -Math.PI / 2;
fireGlow.position.y = 0.02;
scene.add(fireGlow);

// LOGS AROUND CAMPFIRE
for (let i = 0; i < 6; i++) {
  const log = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 1.4, 16),
    new THREE.MeshStandardMaterial({
      map: woodTexture
    })
  );

  log.position.set(0, 0.15, 0);
  log.rotation.z = Math.PI / 2;
  log.rotation.y = (i / 6) * Math.PI;

  log.castShadow = true;
  scene.add(log);
}

// ROCKS - FIXED POSITIONS
function createRock(x, z, scale = 1) {
  const rock = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 16, 16),
    new THREE.MeshStandardMaterial({
      color: 0x777799,
      roughness: 0.85
    })
  );

  rock.position.set(x, 0.25, z);
  rock.scale.set(scale, 0.45 * scale, scale);

  rock.castShadow = true;
  scene.add(rock);
}

createRock(-4.5, -2.5, 1.2);
createRock(-3.6, -1.2, 0.8);
createRock(-2.2, 3.5, 1.0);
createRock(1.8, 2.8, 0.9);
createRock(3.5, 1.4, 1.1);
createRock(4.2, -1.8, 0.8);
createRock(6.5, 3.2, 1.0);
createRock(-6.2, 2.7, 1.1);
createRock(-7.5, -4.5, 0.9);
createRock(8.0, -3.0, 1.2);
createRock(10.0, 4.0, 0.8);
createRock(-10.5, 5.0, 1.0);
createRock(12.0, -8.0, 1.1);
createRock(-12.0, -7.0, 0.9);

// TREES - FIXED POSITIONS SO THEY DO NOT BLOCK THE SUV / ROOFTOP TENT
function createTree(x, z, scale = 1) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.22, 1.5, 12),
    new THREE.MeshStandardMaterial({
      map: woodTexture
    })
  );

  const leaves = new THREE.Mesh(
    new THREE.ConeGeometry(0.85, 2.1, 16),
    new THREE.MeshStandardMaterial({
      color: 0x0f4f22,
      roughness: 0.8
    })
  );

  trunk.position.set(x, 0.75 * scale, z);
  leaves.position.set(x, 2 * scale, z);

  trunk.scale.y = scale;
  leaves.scale.set(scale, scale, scale);

  trunk.castShadow = true;
  leaves.castShadow = true;

  scene.add(trunk);
  scene.add(leaves);
}

// Back/side forest placement. Center, SUV, and rooftop tent area stay clear.
createTree(-13, -10, 1.4);
createTree(-10, -4, 1.0);
createTree(-8, 8, 1.6);
createTree(-4, -12, 1.2);
createTree(-2, 10, 0.9);
createTree(3, 11, 1.1);
createTree(7, 9, 1.5);
createTree(11, 6, 1.2);
createTree(13, -2, 1.4);
createTree(11, -10, 1.1);
createTree(-14, 3, 1.2);
createTree(14, 12, 1.6);

// CAMP CHAIRS MADE FROM PRIMITIVES
function createChair(x, z, rotation) {
  const chairGroup = new THREE.Group();

  const seat = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.08, 0.9),
    new THREE.MeshStandardMaterial({
      color: 0x556b2f
    })
  );

  seat.position.y = 0.55;
  chairGroup.add(seat);

  const back = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.8, 0.08),
    new THREE.MeshStandardMaterial({
      color: 0x667f33
    })
  );

  back.position.set(0, 0.95, -0.4);
  back.rotation.x = -0.25;
  chairGroup.add(back);

  for (let i = 0; i < 4; i++) {
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.7, 8),
      new THREE.MeshStandardMaterial({
        map: woodTexture
      })
    );

    leg.position.set(
      i < 2 ? -0.32 : 0.32,
      0.25,
      i % 2 === 0 ? -0.32 : 0.32
    );

    chairGroup.add(leg);
  }

  chairGroup.position.set(x, 0, z);
  chairGroup.rotation.y = rotation;

  chairGroup.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  scene.add(chairGroup);
}

// Chairs pushed farther back from the fire.
createChair(-3.0, 2.6, Math.PI / 4);
createChair(3.1, 2.5, -Math.PI / 4);

// COOLER MADE FROM PRIMITIVES
const coolerGroup = new THREE.Group();

const cooler = new THREE.Mesh(
  new THREE.BoxGeometry(1.1, 0.7, 0.7),
  new THREE.MeshStandardMaterial({
    color: 0xcccccc
  })
);

cooler.position.y = 0.35;
cooler.castShadow = true;
coolerGroup.add(cooler);

const coolerLid = new THREE.Mesh(
  new THREE.BoxGeometry(1.15, 0.08, 0.75),
  new THREE.MeshStandardMaterial({
    color: 0xbbbbbb
  })
);

coolerLid.position.set(0, 0.74, 0);
coolerLid.castShadow = true;
coolerGroup.add(coolerLid);

const handle = new THREE.Mesh(
  new THREE.TorusGeometry(0.18, 0.03, 8, 16),
  new THREE.MeshStandardMaterial({
    color: 0x222222
  })
);

handle.rotation.x = Math.PI / 2;
handle.position.set(0, 0.9, 0);
coolerGroup.add(handle);

coolerGroup.position.set(-1.5, 0, 3.5);
scene.add(coolerGroup);

// STARS
for (let i = 0; i < 500; i++) {
  const star = new THREE.Mesh(
    new THREE.SphereGeometry(0.025, 6, 6),
    new THREE.MeshBasicMaterial({
      color: 0xffffff
    })
  );

  star.position.set(
    Math.random() * 200 - 100,
    Math.random() * 80 + 20,
    Math.random() * 200 - 100
  );

  scene.add(star);
}

// GLB LOADER
const loader = new GLTFLoader();

// ROOFTOP TENT GLB MODEL
// This imported GLB is intentionally placed above the SUV to create a rooftop camping setup.
loader.load(
  `${assetPath}models/model.glb`,

  function (gltf) {
    const rooftopTent = gltf.scene;

    rooftopTent.position.set(5.5, 3.2, -4);
    rooftopTent.scale.set(2.9, 2.7, 3);
    rooftopTent.rotation.y = 5.2;

    rooftopTent.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    scene.add(rooftopTent);
  },

  undefined,

  function (error) {
    console.error('Rooftop tent model failed to load:', error);
  }
);

// SUV MODEL
loader.load(
  `${assetPath}models/SUV.glb`,

  function (gltf) {
    const suv = gltf.scene;

    suv.position.set(5, 0, -4);
    suv.scale.set(1.8, 1.8, 1.8);
    suv.rotation.y = -Math.PI / 3;

    suv.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    scene.add(suv);
  },

  undefined,

  function (error) {
    console.error('SUV model failed to load:', error);
  }
);

// ANIMATED WOMAN MODEL
loader.load(
  `${assetPath}models/Animated Woman.glb`,

  function (gltf) {
    const woman = gltf.scene;

    woman.position.set(-0.9, 0, -1.0);
    woman.scale.set(2, 2, 2);
    woman.rotation.y = Math.PI / 5;

    woman.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    scene.add(woman);
  },

  undefined,

  function (error) {
    console.error('Animated Woman model failed to load:', error);
  }
);

// MAN MODEL
loader.load(
  `${assetPath}models/Man.glb`,

  function (gltf) {
    const man = gltf.scene;

    man.position.set(1.0, 0, -1.1);
    man.scale.set(0.75, 0.75, 0.75);
    man.rotation.y = -Math.PI / 5;

    man.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    scene.add(man);
  },

  undefined,

  function (error) {
    console.error('Man model failed to load:', error);
  }
);

// FIREFLIES / WOW POINT
const fireflies = [];

for (let i = 0; i < 40; i++) {
  const fly = new THREE.Mesh(
    new THREE.SphereGeometry(0.018, 6, 6),
    new THREE.MeshBasicMaterial({
      color: 0xffee88
    })
  );

  fly.position.set(
    Math.random() * 14 - 7,
    1 + Math.random() * 3,
    Math.random() * 14 - 7
  );

  fly.userData.offset = Math.random() * 100;

  fireflies.push(fly);
  scene.add(fly);
}

// WOW POINT NOTE
const note = document.createElement('div');

note.innerHTML =
  'Wow Point: I created a nighttime rooftop-camping scene with an imported SUV, an imported rooftop tent, animated campfire lighting, floating fireflies, star field, fog, textured ground/logs, people models around the fire, camp chairs, and a cooler made from primitives.';

note.style.position = 'absolute';
note.style.left = '16px';
note.style.bottom = '16px';
note.style.maxWidth = '680px';
note.style.padding = '12px 14px';
note.style.color = 'white';
note.style.background = 'rgba(0, 0, 0, 0.55)';
note.style.fontFamily = 'Arial, sans-serif';
note.style.fontSize = '14px';
note.style.borderRadius = '8px';

document.body.appendChild(note);

// ANIMATION LOOP
function animate() {
  requestAnimationFrame(animate);

  const time = Date.now() * 0.001;

  fire.rotation.y += 0.02;
  smallFire.rotation.y -= 0.03;

  fire.scale.y = 1 + Math.sin(time * 8) * 0.2;
  smallFire.scale.y = 1 + Math.cos(time * 10) * 0.18;

  fireLight.intensity = 45 + Math.sin(time * 14) * 10;

  fireflies.forEach((fly) => {
    const t = time + fly.userData.offset;

    fly.position.x += Math.sin(t) * 0.002;
    fly.position.z += Math.cos(t) * 0.002;
    fly.position.y += Math.sin(t * 2) * 0.001;
  });

  controls.update();
  renderer.render(scene, camera);
}

animate();

// RESIZE
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});