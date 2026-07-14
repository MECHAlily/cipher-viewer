import * as THREE from 
"https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.js";

import { LineSegments2 } from
"https://cdn.jsdelivr.net/npm/three@0.185.1/examples/jsm/lines/LineSegments2.js";

import { LineSegmentsGeometry } from
"https://cdn.jsdelivr.net/npm/three@0.185.1/examples/jsm/lines/LineSegmentsGeometry.js";

import { LineMaterial } from
"https://cdn.jsdelivr.net/npm/three@0.185.1/examples/jsm/lines/LineMaterial.js";

import { OrbitControls } from
"https://cdn.jsdelivr.net/npm/three@0.185.1/examples/jsm/controls/OrbitControls.js";

let GRID_SIZE;
let GRID_SPACING;
let GRID_CENTER;
let sculptureGroup;
let lineMaterial;
let targetRotationX = 0;
let targetRotationY = 0;
let velocityX = 0;
let velocityY = 0;

let isDragging = false;

let previousMouseX = 0;
let previousMouseY = 0;

const MATERIAL_MODE = "artifact";


function gridToWorld(p) {

  return new THREE.Vector3(

    (p.x - GRID_CENTER) * GRID_SPACING,

    -(p.y - GRID_CENTER) * GRID_SPACING,

    (p.z - GRID_CENTER) * GRID_SPACING

  );

}

// function getRenderColor(word) {

//   const original =
//   new THREE.Color(
//     word.color.r / 255,
//     word.color.g / 255,
//     word.color.b / 255
//   );


//   // reduce neon brightness
//   original.multiplyScalar(0.15);


//   // slightly desaturate by mixing toward a dark neutral
//   const muted =
//   new THREE.Color(
//     0.12,
//     0.10,
//     0.18
//   );


//   original.lerp(
//     muted,
//     0.25
//   );


//   return original;

// }

function getRenderColor(word) {

  const original =
  new THREE.Color(
    word.color.r / 255,
    word.color.g / 255,
    word.color.b / 255
  );


  // darken the encoded colors
  original.multiplyScalar(0.35);


  // add a near-black mineral base
  const base =
  new THREE.Color(
    0.015,
    0.02,
    0.03
  );


  // preserve some of the encoded color
  base.lerp(
    original,
    0.75
  );


  return base;

}


function createGrid() {

  const positions = [];


  for (let x = 0; x < GRID_SIZE; x++) {

    for (let y = 0; y < GRID_SIZE; y++) {

      for (let z = 0; z < GRID_SIZE; z++) {


        const point =
        gridToWorld({
          x:x,
          y:y,
          z:z
        });


        positions.push(

          point.x,
          point.y,
          point.z

        );

      }

    }

  }


  const geometry =
  new THREE.BufferGeometry();




  geometry.setAttribute(

    "position",

    new THREE.Float32BufferAttribute(
      positions,
      3
    )

  );



const material =
new THREE.PointsMaterial({

  color: 0xffffff,

  size: 1.5,

  transparent: true,

  opacity: 0.20

});




  return new THREE.Points(
    geometry,
    material
  );

}

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x000000);


const ambientLight =
new THREE.AmbientLight(
  0x111111,
  0.15
);

scene.add(
  ambientLight
);


const keyLight =
new THREE.DirectionalLight(
  0x7ab8ff,
  0.8
);

keyLight.position.set(
  300,
  500,
  700
);

scene.add(
  keyLight
);


const fillLight =
new THREE.DirectionalLight(
  0xff5577,
  0.35
);

fillLight.position.set(
  -400,
  -200,
  300
);

scene.add(
  fillLight
);

const camera =
new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);


camera.position.z = 800;


const renderer =
new THREE.WebGLRenderer();

renderer.setPixelRatio(
  window.devicePixelRatio
);

renderer.setSize(
  window.innerWidth,
  window.innerHeight
);


document.body.appendChild(
  renderer.domElement
);

const controls =
new OrbitControls(
  camera,
  renderer.domElement
);

controls.enableDamping = true;

controls.dampingFactor = 0.05;

controls.target.set(
  0,
  0,
  0
);

controls.update();



controls.enableRotate = false;
controls.enablePan = false;
controls.enableZoom = true;

renderer.domElement.addEventListener(
  "pointerdown",
  (event) => {

    isDragging = true;

    previousMouseX = event.clientX;
    previousMouseY = event.clientY;

    renderer.domElement.setPointerCapture(
      event.pointerId
    );

  }
);


renderer.domElement.addEventListener(
  "pointermove",
  (event) => {

    if (!isDragging) {
      return;
    }


    const deltaX =
    event.clientX - previousMouseX;


    const deltaY =
    event.clientY - previousMouseY;


    velocityY =
    deltaX * 0.003;


    velocityX =
    deltaY * 0.003;


    targetRotationY += velocityY;

    targetRotationX += velocityX;


    previousMouseX =
    event.clientX;

    previousMouseY =
    event.clientY;

  }
);


renderer.domElement.addEventListener(
  "pointerup",
  () => {

    isDragging = false;

  }
);

renderer.domElement.style.touchAction = "none";

function loadSculpture(data) {



  console.log("JSON loaded");

GRID_SIZE = data.cube.size;

GRID_SPACING = data.cube.spacing;

GRID_CENTER = GRID_SIZE / 2;

  sculptureGroup =
new THREE.Group();

const grid =
createGrid();

sculptureGroup.add(
  grid
);

console.log(
    "Cube:",
    GRID_SIZE,
    GRID_SPACING
  );

  console.log(
    "Title:",
    data.title
  );


 const positions = [];
const colors = [];



for (let word of data.words) {


  if (word.renderType !== "surface") {
    continue;
  }


  let center = {

    x: word.center.x,
    y: word.center.y,
    z: word.center.z

  };



  for (let triangle of word.triangles) {


    let a =
      word.characters[triangle.a].position;


    let b =
      word.characters[triangle.b].position;



    const wa = gridToWorld(a);
const wb = gridToWorld(b);

positions.push(

  center.x,
  center.y,
  center.z,

  wa.x,
  wa.y,
  wa.z,

  wb.x,
  wb.y,
  wb.z

);


    for (let i = 0; i < 3; i++) {

      const renderColor =
getRenderColor(word);

colors.push(

  renderColor.r,
  renderColor.g,
  renderColor.b

);

    }


  }


}



const geometry =
new THREE.BufferGeometry();



geometry.setAttribute(

  "position",

  new THREE.Float32BufferAttribute(
    positions,
    3
  )

);



geometry.setAttribute(

  "color",

  new THREE.Float32BufferAttribute(
    colors,
    3
  )

);



let material;

switch (MATERIAL_MODE) {

  case "current":

  material =
new THREE.MeshBasicMaterial({

  vertexColors: true,

  side: THREE.DoubleSide,

  transparent: true,

  opacity: 0.35,

  depthWrite: true,

  blending: THREE.NormalBlending

});

  break;

    case "phong":

  material =
  new THREE.MeshPhongMaterial({

    vertexColors: true,

    side: THREE.DoubleSide,

    transparent: true,

    opacity: 0.25,

    shininess: 80

  });

  break;

  case "emissive":

  material =
  new THREE.MeshStandardMaterial({

    vertexColors: true,

    side: THREE.DoubleSide,

    transparent: true,

    opacity: 0.35,

    roughness: 0.35,

    metalness: 0.0,

    emissive: 0x000000,

    emissiveIntensity: 0.6

  });

  break;

  case "holographic":

material =
new THREE.MeshBasicMaterial({

  vertexColors: true,

  side: THREE.DoubleSide,

  transparent: true,

  opacity: 0.18,

  blending: THREE.AdditiveBlending,

  //depthWrite: false

});

  break;

case "artifact":

  material =
  new THREE.MeshStandardMaterial({

    vertexColors: true,

    side: THREE.DoubleSide,

    transparent: true,

    opacity: 0.5,

    roughness: 0.25,

    metalness: 0.7

  });

  break;

case "physical":

  material =
  new THREE.MeshPhysicalMaterial({

    vertexColors: true,

    side: THREE.DoubleSide,

    transparent: true,

    opacity: 0.35,

    roughness: 0.25,

    metalness: 0.0,

    clearcoat: 1.0,

    clearcoatRoughness: 0.1,

    iridescence: 0.8,

    iridescenceIOR: 1.3

  });

  break;

case "toon":

  material =
  new THREE.MeshToonMaterial({

    vertexColors: true,

    side: THREE.DoubleSide,

    transparent: true,

    opacity: 0.35

  });

  break;

case "lambert":

material =
new THREE.MeshLambertMaterial({

  vertexColors: true,

  side: THREE.DoubleSide,

  transparent: true,

  opacity: 0.55

  

});

break;

case "opal":

  material =
  new THREE.MeshPhysicalMaterial({

    vertexColors: true,

    side: THREE.DoubleSide,

    transparent: true,

    opacity: 0.65,

    roughness: 0.25,

    metalness: 0.15,

    clearcoat: 0.8,

    clearcoatRoughness: 0.15,

    iridescence: 0.7,

    iridescenceIOR: 1.3,

    thickness: 1.5

  });

break;

  default:

    material = new THREE.MeshBasicMaterial({

      vertexColors: true,

      side: THREE.DoubleSide,

      transparent: true,

      opacity: 0.25

    });

}

const sculpture =
new THREE.Mesh(
  geometry,
  material
);



sculptureGroup.add(
  sculpture
);

const pointGeometry =
new THREE.SphereGeometry(
  1.5,
  12,
  12
);


for (let word of data.words) {


  if (word.renderType !== "sphere") {
    continue;
  }


  let p =
    word.characters[0].position;


  const pointMaterial =
  new THREE.MeshBasicMaterial({

    color: getRenderColor(word)

  });


  const sphere =
  new THREE.Mesh(
    pointGeometry,
    pointMaterial
  );


  sphere.position.copy(

    gridToWorld(p)

  );


  sculptureGroup.add(
  sphere
);

}

const linePositions = [];
const lineColors = [];

for (let word of data.words) {
    

if (word.characters.length < 2) {
    continue;
}
  for (let i = 0; i < word.characters.length - 1; i++) {


    let a =
      word.characters[i].position;


    let b =
      word.characters[i + 1].position;


    const wa = gridToWorld(a);
const wb = gridToWorld(b);

linePositions.push(

  wa.x,
  wa.y,
  wa.z,

  wb.x,
  wb.y,
  wb.z

);

    for (let j = 0; j < 2; j++) {

  const renderColor =
getRenderColor(word);

lineColors.push(

  renderColor.r,
  renderColor.g,
  renderColor.b

);

}

  }


}



const lineGeometry =
new LineSegmentsGeometry();


lineGeometry.setPositions(
  linePositions
);

lineGeometry.setColors(
  lineColors
);


// const lineMaterial =
// new LineMaterial({


//   linewidth: 3,

//   vertexColors: true,

//   transparent: true,

//   opacity: 1.0

// });

lineMaterial =
new LineMaterial({

  linewidth: 0.2,

  vertexColors: true,

  transparent: true,

  opacity: 0.7,

  blending: THREE.AdditiveBlending

});


lineMaterial.resolution.set(
  window.innerWidth,
  window.innerHeight
);



const lines =
new LineSegments2(
  lineGeometry,
  lineMaterial
);


lines.computeLineDistances();


sculptureGroup.add(
  lines
);



scene.add(
  sculptureGroup
);
}

const params = new URLSearchParams(window.location.search);

const filename =
    params.get("file") ||
    "rusting_machines.json";


fetch("sculptures/" + filename)

.then(response => response.json())

.then(data => {

    loadSculpture(data);

});



function animate() {

  requestAnimationFrame(
    animate
  );


  //scene.rotation.y += 0.002;
  controls.update();

  if (sculptureGroup) {


  // idle rotation
  if (!isDragging) {

    targetRotationY += 0.006;

  }


  // smooth movement
  sculptureGroup.rotation.y +=
  (targetRotationY -
   sculptureGroup.rotation.y) * 0.12;


  sculptureGroup.rotation.x +=
  (targetRotationX -
   sculptureGroup.rotation.x) * 0.12;


  // return vertical tilt to zero
  if (!isDragging) {

    targetRotationX *= 0.98;

  }


}

  renderer.render(
    scene,
    camera
  );

}


window.addEventListener(
  "resize",
  () => {

    camera.aspect =
      window.innerWidth /
      window.innerHeight;

    camera.updateProjectionMatrix();


    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );


    renderer.setPixelRatio(
      window.devicePixelRatio
    );


    if (lineMaterial) {

      lineMaterial.resolution.set(
  window.innerWidth,
  window.innerHeight
);

    }

  }
);

animate();
