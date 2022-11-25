import * as THREE from 'three'
import * as CANNON from 'cannon-es'

// import "reset-css";
// @ts-ignore
// import Nebula, { SpriteRenderer } from "three-nebula";
// import getThreeApp from "./three-app";
// import json from "./my-particle-system.json";

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import {  GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Player } from './classes/Player'



import CannonDebugRenderer from './utils/cannonDebugRenderer'
import CannonUtils from './utils/cannonUtils'
import { Object3D } from 'three'

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

//World
const world = new CANNON.World()
world.gravity.set(0, -9.82, 0)

// Cannon debugger
const cannonDebugRenderer = new CannonDebugRenderer(scene, world)

//Loading textures
const textureLoader = new THREE.TextureLoader()

//GLTF Loader
const loader = new GLTFLoader()


// Contorls
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true
orbitControls.minDistance = 5
orbitControls.maxDistance = 15
orbitControls.enablePan = false
orbitControls.maxPolarAngle = Math.PI / 2 - 0.05
orbitControls.update();


let player : Player = createPlayer() //Player
const leavesMaterial : THREE.ShaderMaterial = shaderLeaves() //leaves

light() //Light
createPlane() // Plane
initLeaves()

// const enemeyCube = new THREE.Mesh(
//     new THREE.BoxGeometry(2,2,2),
//     new THREE.MeshPhongMaterial({color:0x333333})
// )
// enemeyCube.position.set(1,2,2)
// scene.add(enemeyCube)




const clock = new THREE.Clock()
function animate() : void {
    
    const delta = clock.getDelta()
    world.step(Math.min(delta, 0.1))
	leavesMaterial.uniforms.time.value = clock.getElapsedTime();
    leavesMaterial.uniformsNeedUpdate = true;
    player ? player.update(delta,keysPressed) : null
    cannonDebugRenderer.update()
    orbitControls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}
animate()

//Things forgotten by the hand of god

// Player
function createPlayer() : Player {
    loader.load('/models/warlock.glb',function (gltf) {
        const model = gltf.scene
        const gltfAnimations: THREE.AnimationClip[] = gltf.animations
        const mixer = new THREE.AnimationMixer(model)
        const animationMap: Map<string, THREE.AnimationAction> = new Map()
        gltfAnimations.filter(a=> a.name != 'Armature.001|mixamo.com|Layer0').forEach((a:THREE.AnimationClip)=>{
            animationMap.set(a.name,mixer.clipAction(a))
        })
        const shape =  new CANNON.Cylinder(.5, 1, 4, 12)
        const body = new CANNON.Body({ mass: 1, shape: shape})
        body.position.y = 7
        model.name = 'Warlock'
        model.traverse((object: any)=>{if(object.isMesh) object.castShadow = true})
        scene.add(model)
        world.addBody(body)
        player = new Player(model,mixer,animationMap,'idle',body)
        }
    )
    return player
}

// Plane
function createPlane() : void {
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
    const planeBody = new CANNON.Body({ mass: 0, shape: planeShape})
    planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    world.addBody(planeBody)

}

// Lights
function light() : void {
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

//Leaves

function shaderLeaves(){
    const simpleNoise = `
    float N (vec2 st) { // https://thebookofshaders.com/10/
        return fract( sin( dot( st.xy, vec2(12.9898,78.233 ) ) ) *  43758.5453123);
    }
    float smoothNoise( vec2 ip ){ // https://www.youtube.com/watch?v=zXsWftRdsvU
    vec2 lv = fract( ip );
    vec2 id = floor( ip );
    lv = lv * lv * ( 3. - 2. * lv );
    float bl = N( id );
    float br = N( id + vec2( 1, 0 ));
    float b = mix( bl, br, lv.x );
    float tl = N( id + vec2( 0, 1 ));
    float tr = N( id + vec2( 1, 1 ));
    float t = mix( tl, tr, lv.x );
    return mix( b, t, lv.y );
    }`;
    const vertexShader = `
    varying vec2 vUv;
    uniform float time;
    ${simpleNoise}
    void main() {
    vUv = uv;
    float t = time * 2.;
    // VERTEX POSITION
    vec4 mvPosition = vec4( position, 1.0 );
    #ifdef USE_INSTANCING
    mvPosition = instanceMatrix * mvPosition;
    #endif
    // DISPLACEMENT
    float noise = smoothNoise(mvPosition.xz * 0.5 + vec2(0., t));
    noise = pow(noise * 0.5 + 0.5, 2.) * 2.;
    // here the displacement is made stronger on the blades tips.
    float dispPower = 1. - cos( uv.y * 3.1416 * 0.5 );
    float displacement = noise * ( 0.3 * dispPower );
    mvPosition.z -= displacement;
    //
    vec4 modelViewPosition = modelViewMatrix * mvPosition;
    gl_Position = projectionMatrix * modelViewPosition;
	}
`;
    const fragmentShader = `
    varying vec2 vUv;
    
    void main() {
        vec3 baseColor = vec3( 0.41, 1.0, 0.5 );
        float clarity = ( vUv.y * 0.875 ) + 0.125;
        gl_FragColor = vec4( baseColor * clarity, 1 );
    }
`;
    const uniforms = {time: {value: 0}}
    return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    side: THREE.DoubleSide
    });
}

// Init leaves
function initLeaves(){
    const dummy = new THREE.Object3D();
    const geometry = new THREE.PlaneGeometry( 0.1, 1, 1, 4 );
    geometry.translate( 0, 0.5, 0 ); // move grass blade geometry lowest point at 0.
    const instancedMesh = new THREE.InstancedMesh( geometry, leavesMaterial, 5000 );
    scene.add( instancedMesh );
    for ( let i=0 ; i<5000 ; i++ ) {
        dummy.position.set(
        ( Math.random() - 0.5 ) * 10,
        0,
        ( Math.random() - 0.5 ) * 10
    );
    
    dummy.scale.setScalar( 0.5 + Math.random() * 0.5 );
    
    dummy.rotation.y = Math.random() * Math.PI;
    
    dummy.updateMatrix();
    instancedMesh.setMatrixAt( i, dummy.matrix );

    }
}

// Resize handler
function onWindowResize() : void {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.render(scene, camera)
}
window.addEventListener('resize', onWindowResize, false)

// Player controller
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
// window.addEventListener('mousedown',(e)=>{
//     setTimeout(function() {
//         console.log('hi')

//       }, 500);
// })

