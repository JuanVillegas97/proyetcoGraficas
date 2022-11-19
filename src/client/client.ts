import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { Player } from './classes/Player'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import {  GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import CannonDebugRenderer from './utils/cannonDebugRenderer'
import CannonUtils from './utils/cannonUtils'
//Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(0xa8def0);

//Camera
const camera = new THREE.PerspectiveCamera(75,window.innerWidth / window.innerHeight,0.1,1000)
camera.position.set(0, 2, 10)

//Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)
document.body.appendChild(renderer.domElement)
renderer.shadowMap.enabled = true

// Contorls
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true
orbitControls.minDistance = 5
orbitControls.maxDistance = 15
orbitControls.enablePan = false
orbitControls.maxPolarAngle = Math.PI / 2 - 0.05
orbitControls.update();

//World
const world = new CANNON.World()
world.gravity.set(0, -9.82, 0)

//Light
light()
//Geometry
const normalMaterial = new THREE.MeshNormalMaterial()
const phongMaterial = new THREE.MeshPhongMaterial()

const cubeGeometry = new THREE.BoxGeometry(1, 1, 1)
const cubeMesh = new THREE.Mesh(cubeGeometry, normalMaterial)
cubeMesh.position.x = -3
cubeMesh.position.y = 3
cubeMesh.castShadow = true
scene.add(cubeMesh)

const cubeShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5))
const cubeBody = new CANNON.Body({ mass: 1 })
cubeBody.addShape(cubeShape)
cubeBody.position.x = cubeMesh.position.x
cubeBody.position.y = cubeMesh.position.y
cubeBody.position.z = cubeMesh.position.z
world.addBody(cubeBody)



//Player
let player: Player
const loader = new GLTFLoader()
loader.load('/models/warlock.glb',function (gltf) {
    const model = gltf.scene
    model.position.z = -1
    model.traverse(function(object: any){
        if(object.isMesh) object.castShadow = true
    })
    const gltfAnimations: THREE.AnimationClip[] = gltf.animations
    const mixer = new THREE.AnimationMixer(model)
    const animationMap: Map<string, THREE.AnimationAction> = new Map()
    gltfAnimations.filter(a=> a.name != 'Armature.001|mixamo.com|Layer0').forEach((a:THREE.AnimationClip)=>{
        animationMap.set(a.name,mixer.clipAction(a))
    })
    scene.add(model)
    player = new Player(model,mixer,animationMap,'idle')
    }
)

let grampa: Player
loader.load('/models/grampa.glb',function (gltf) {
    const model = gltf.scene
    model.position.z = -1
    model.traverse(function(object: any){
        if(object.isMesh) object.castShadow = true
    })
    const gltfAnimations: THREE.AnimationClip[] = gltf.animations
    const mixer = new THREE.AnimationMixer(model)
    const animationMap: Map<string, THREE.AnimationAction> = new Map()
    gltfAnimations.filter(a=> a.name != 'Armature.001|mixamo.com|Layer0').forEach((a:THREE.AnimationClip)=>{
        animationMap.set(a.name,mixer.clipAction(a))
    })
    scene.add(model)
    grampa = new Player(model,mixer,animationMap,'idle')
    }
)

const keysPressed  = { }
window.addEventListener("keydown", (event) => {
    if(event.shiftKey && player){
        player.switchRunToggle()
    }else{
        (keysPressed as any)[event.key.toLowerCase()] = true
    }
    event.preventDefault();
}, false)
document.addEventListener('keyup', (event) => {
    (keysPressed as any)[event.key.toLowerCase()] = false
}, false)

// Water
const textureLoader = new THREE.TextureLoader();

const waterBaseColor = textureLoader.load("./textures/water/Water_002_COLOR.jpg");
const waterNormalMap = textureLoader.load("./textures/water/Water_002_NORM.jpg");
const waterHeightMap = textureLoader.load("./textures/water/Water_002_DISP.png");
const waterRoughness = textureLoader.load("./textures/water/Water_002_ROUGH.jpg");
const waterAmbientOcclusion = textureLoader.load("./textures/water/Water_002_OCC.jpg");

const geometryWater = new THREE.PlaneGeometry(5, 10, 64, 64);
const planeWater = new THREE.Mesh(geometryWater, 
new THREE.MeshStandardMaterial({ 
    map: waterBaseColor, 
    normalMap: waterNormalMap, 
    displacementMap: waterHeightMap, displacementScale: 0.01, 
    roughnessMap: waterRoughness, roughness: 0, 
    aoMap: waterAmbientOcclusion }));
planeWater.receiveShadow = true;
planeWater.castShadow = true;
planeWater.rotation.x = - Math.PI / 2;
planeWater.position.z = 0;
planeWater.position.x = 7;
planeWater.position.y = .5;
scene.add(planeWater);

const count: number = geometryWater.attributes.position.count;
const damping = 0.25;

// Soil
const soilBaseColor = textureLoader.load("./textures/soil/Rock_Moss_001_basecolor.jpg");
const soilNormalMap = textureLoader.load("./textures/soil/Rock_Moss_001_normal.jpg");
const soilHeightMap = textureLoader.load("./textures/soil/Rock_Moss_001_height.png");
const soilRoughness = textureLoader.load("./textures/soil/Rock_Moss_001_roughness.jpg");
const soilAmbientOcclusion = textureLoader.load("./textures/soil/Rock_Moss_001_ambientOcclusion.jpg");

const geometrySoil = new THREE.PlaneGeometry(25, 10,200,200)
const planeSoil = new THREE.Mesh(geometrySoil, new THREE.MeshStandardMaterial({
    map: soilBaseColor,
    normalMap: soilNormalMap,
    displacementMap: soilHeightMap, displacementScale: 2,
    roughnessMap: soilRoughness, roughness: 0,
    aoMap: soilAmbientOcclusion
}));

planeSoil.rotateX(-Math.PI / 2)
planeSoil.receiveShadow = true;
planeSoil.receiveShadow = true
planeSoil.position.y = -1
scene.add(planeSoil)
const planeShape = new CANNON.Plane()
const planeBody = new CANNON.Body({ mass: 0 })
planeBody.addShape(planeShape)
planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
world.addBody(planeBody)



const cannonDebugRenderer = new CannonDebugRenderer(scene, world)
const clock = new THREE.Clock()
function animate() {
    const delta = clock.getDelta()
    world.step(Math.min(delta, 0.1))
    
    // SINE WAVE
    const now_slow = Date.now() / 400;
    for (let i = 0; i < count; i++) {
        const x = geometryWater.attributes.position.getX(i)
        const y = geometryWater.attributes.position.getY(i)

        const xangle = x + now_slow
        const xsin = Math.sin(xangle) * damping
        const yangle = y + now_slow
        const ycos = Math.cos(yangle) * damping

        geometryWater.attributes.position.setZ(i, xsin + ycos)
    }
    geometryWater.computeVertexNormals();
    geometryWater.attributes.position.needsUpdate = true;


    // Copy coordinates from Cannon to Three.js
    cubeMesh.position.set(
        cubeBody.position.x,
        cubeBody.position.y,
        cubeBody.position.z
    )
    cubeMesh.quaternion.set(
        cubeBody.quaternion.x,
        cubeBody.quaternion.y,
        cubeBody.quaternion.z,
        cubeBody.quaternion.w
    )
    if(player){
        player.update(delta,keysPressed)
    }
    cannonDebugRenderer.update()
    orbitControls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}



animate()



//Things forgotten by the hand of god

// Lights
function light() {
    scene.add(new THREE.AmbientLight(0xffffff, 0.7))
    const dirLight = new THREE.DirectionalLight(0xffffff, 1)
    dirLight.position.set(- 60, 100, - 10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = - 50;
    dirLight.shadow.camera.left = - 50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 200;
    dirLight.shadow.mapSize.width = 4096;
    dirLight.shadow.mapSize.height = 4096;
    scene.add(dirLight);
    // scene.add( new THREE.CameraHelper(dirLight.shadow.camera))
}

// Resize handler
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.render(scene, camera)
}
window.addEventListener('resize', onWindowResize, false)