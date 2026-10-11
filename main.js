import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000006);
scene.fog = new THREE.FogExp2(0x000006, 0.0008);

const camera = new THREE.PerspectiveCamera(48, innerWidth/innerHeight, 0.1, 20000);
camera.position.set(0, 95, 185);

const renderer = new THREE.WebGLRenderer({antialias:true, powerPreference:"high-performance"});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.045;
controls.minDistance = 12;
controls.maxDistance = 1800;

const clock = new THREE.Clock();
const planets = [];
const textureLoader = new THREE.TextureLoader();

function texture(url) {
  const t = textureLoader.load(url);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeStars(count, radius, size) {
  const positions = new Float32Array(count*3);
  for(let i=0;i<count;i++){
    const r = radius * (0.45 + Math.random()*0.55);
    const theta = Math.random()*Math.PI*2;
    const phi = Math.acos(2*Math.random()-1);
    positions[i*3] = r*Math.sin(phi)*Math.cos(theta);
    positions[i*3+1] = r*Math.cos(phi);
    positions[i*3+2] = r*Math.sin(phi)*Math.sin(theta);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(positions,3));
  const m = new THREE.PointsMaterial({color:0xffffff,size,sizeAttenuation:true,transparent:true,opacity:.9});
  return new THREE.Points(g,m);
}
scene.add(makeStars(18000, 7000, 1.8));

const ambient = new THREE.HemisphereLight(0x202840, 0x020204, 0.12);
scene.add(ambient);

const sun = new THREE.Mesh(
  new THREE.SphereGeometry(11,96,96),
  new THREE.MeshBasicMaterial({map:texture("https://threejs.org/examples/textures/planets/sun.jpg")})
);
scene.add(sun);

const sunLight = new THREE.PointLight(0xffe9b0, 4.8, 0, 1.2);
scene.add(sunLight);

const glow = new THREE.Mesh(
  new THREE.SphereGeometry(15,64,64),
  new THREE.ShaderMaterial({
    transparent:true, depthWrite:false, blending:THREE.AdditiveBlending,
    uniforms:{color:{value:new THREE.Color(0xffa83d)}},
    vertexShader:`varying vec3 vN; void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`uniform vec3 color; varying vec3 vN; void main(){float a=pow(1.-max(dot(vN,vec3(0.,0.,1.)),0.),2.5);gl_FragColor=vec4(color,a*.55);}`
  })
);
scene.add(glow);

function orbitLine(distance){
  const pts=[];
  for(let i=0;i<=256;i++){
    const a=i/256*Math.PI*2;
    pts.push(new THREE.Vector3(Math.cos(a)*distance,0,Math.sin(a)*distance));
  }
  const geo=new THREE.BufferGeometry().setFromPoints(pts);
  const mat=new THREE.LineBasicMaterial({color:0x42506b,transparent:true,opacity:.27});
  scene.add(new THREE.LineLoop(geo,mat));
}

function addPlanet({name,size,distance,speed,mapUrl,ring=false,tilt=0}) {
  orbitLine(distance);
  const group=new THREE.Object3D();
  group.rotation.y=Math.random()*Math.PI*2;
  scene.add(group);

  const material = new THREE.MeshStandardMaterial({
    map:texture(mapUrl), roughness:.92, metalness:0,
    emissive:0x000000
  });
  const mesh=new THREE.Mesh(new THREE.SphereGeometry(size,64,64),material);
  mesh.rotation.z=tilt;
  mesh.userData={name,distance};
  group.add(mesh);

  if(ring){
    const ringGeo=new THREE.RingGeometry(size*1.35,size*2.15,128);
    const ringMat=new THREE.MeshBasicMaterial({map:texture("https://threejs.org/examples/textures/planets/saturnringcolor.jpg"),side:THREE.DoubleSide,transparent:true});
    const r=new THREE.Mesh(ringGeo,ringMat);
    r.rotation.x=Math.PI/2.3;
    mesh.add(r);
  }

  const item={name,size,distance,speed,group,mesh};
  planets.push(item);
  return item;
}

addPlanet({name:"Mercurio",size:1.4,distance:19,speed:1.55,mapUrl:"https://threejs.org/examples/textures/planets/mercury.jpg"});
addPlanet({name:"Venus",size:2.5,distance:27,speed:1.18,mapUrl:"https://threejs.org/examples/textures/planets/venus.jpg"});
addPlanet({name:"Tierra",size:2.7,distance:38,speed:0.98,mapUrl:"https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg"});
addPlanet({name:"Marte",size:2.05,distance:49,speed:0.78,mapUrl:"https://threejs.org/examples/textures/planets/mars_1k_color.jpg"});
addPlanet({name:"Júpiter",size:6.8,distance:70,speed:0.42,mapUrl:"https://threejs.org/examples/textures/planets/jupiter.jpg"});
addPlanet({name:"Saturno",size:5.8,distance:94,speed:0.32,mapUrl:"https://threejs.org/examples/textures/planets/saturn.jpg",ring:true,tilt:.12});
addPlanet({name:"Urano",size:4.0,distance:118,speed:0.23,mapUrl:"https://threejs.org/examples/textures/planets/uranus.jpg"});
addPlanet({name:"Neptuno",size:3.9,distance:142,speed:0.18,mapUrl:"https://threejs.org/examples/textures/planets/neptune.jpg"});

const earth = planets.find(p=>p.name==="Tierra");
const atmosphere = new THREE.Mesh(
  new THREE.SphereGeometry(2.84,64,64),
  new THREE.MeshBasicMaterial({color:0x4aa3ff,transparent:true,opacity:.10,side:THREE.BackSide,blending:THREE.AdditiveBlending})
);
earth.mesh.add(atmosphere);

const raycaster=new THREE.Raycaster(), pointer=new THREE.Vector2();
const info=document.getElementById("info");
window.addEventListener("dblclick",e=>{
  pointer.x=(e.clientX/innerWidth)*2-1;
  pointer.y=-(e.clientY/innerHeight)*2+1;
  raycaster.setFromCamera(pointer,camera);
  const hit=raycaster.intersectObjects(planets.map(p=>p.mesh))[0];
  if(hit){
    const p=planets.find(x=>x.mesh===hit.object);
    controls.target.copy(p.mesh.getWorldPosition(new THREE.Vector3()));
    camera.position.copy(controls.target).add(new THREE.Vector3(p.size*4,p.size*2.2,p.size*5));
    info.textContent=`${p.name} · doble clic para enfocar`;
  }
});

function animate(){
  requestAnimationFrame(animate);
  const dt=clock.getDelta();
  sun.rotation.y += dt*.08;
  glow.scale.setScalar(1+Math.sin(performance.now()*.0012)*.025);

  for(const p of planets){
    p.group.rotation.y += dt*p.speed*.12;
    p.mesh.rotation.y += dt*.18;
  }
  controls.update();
  renderer.render(scene,camera);
}
animate();

addEventListener("resize",()=>{
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
});

setTimeout(()=>document.getElementById("loading").classList.add("hide"),900);
