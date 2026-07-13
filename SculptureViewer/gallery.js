import * as THREE from 
"https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.js";

import { LineSegments2 } from
"https://cdn.jsdelivr.net/npm/three@0.185.1/examples/jsm/lines/LineSegments2.js";

import { LineSegmentsGeometry } from
"https://cdn.jsdelivr.net/npm/three@0.185.1/examples/jsm/lines/LineSegmentsGeometry.js";

import { LineMaterial } from
"https://cdn.jsdelivr.net/npm/three@0.185.1/examples/jsm/lines/LineMaterial.js";


let GRID_SIZE;
let GRID_SPACING;
let GRID_CENTER;

function gridToWorld(p) {

  return new THREE.Vector3(

    (p.x - GRID_CENTER) * GRID_SPACING,

    -(p.y - GRID_CENTER) * GRID_SPACING,

    (p.z - GRID_CENTER) * GRID_SPACING

  );

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

    size: 2,

    transparent: true,

    opacity: 0.45

  });


  return new THREE.Points(
    geometry,
    material
  );

}

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x000000);


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


renderer.setSize(
  window.innerWidth,
  window.innerHeight
);


document.body.appendChild(
  renderer.domElement
);



function loadSculpture(data) {



  console.log("JSON loaded");

GRID_SIZE = data.cube.size;

GRID_SPACING = data.cube.spacing;

GRID_CENTER = GRID_SIZE / 2;

const grid =
createGrid();

scene.add(
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

      colors.push(

        word.color.r / 255,
        word.color.g / 255,
        word.color.b / 255

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



const material =
new THREE.MeshBasicMaterial({

  vertexColors: true,

  side: THREE.DoubleSide,

  transparent: true,

  opacity: 0.25

});



const sculpture =
new THREE.Mesh(
  geometry,
  material
);



scene.add(
  sculpture
);

const pointGeometry =
new THREE.SphereGeometry(
  2,
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

    color: new THREE.Color(
      word.color.r / 255,
      word.color.g / 255,
      word.color.b / 255
    )

  });


  const sphere =
  new THREE.Mesh(
    pointGeometry,
    pointMaterial
  );


  sphere.position.copy(

    gridToWorld(p)

  );


  scene.add(
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

  lineColors.push(

    word.color.r / 255,
    word.color.g / 255,
    word.color.b / 255

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


const lineMaterial =
new LineMaterial({


  linewidth: 3,

  vertexColors: true,

  transparent: true,

  opacity: 1.0

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


scene.add(
  lines
);


}

const params = new URLSearchParams(window.location.search);

const filename =
    params.get("file") ||
    "rusting_machines.json";


fetch("sculptures/" + filename)
//fetch(filename)

.then(response => response.json())

.then(data => {

    loadSculpture(data);

});



function animate() {

  requestAnimationFrame(
    animate
  );


  scene.rotation.y += 0.003;


  renderer.render(
    scene,
    camera
  );

}


animate();