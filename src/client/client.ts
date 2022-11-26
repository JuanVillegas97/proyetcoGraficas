import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import {  GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Player } from './classes/Player'
import CannonDebugRenderer from './utils/cannonDebugRenderer'
import getThreeApp from "./classes/App"

// @ts-ignore
import Nebula, { SpriteRenderer } from 'three-nebula'
// @ts-ignore
import json from "./particles/blue.json"


// Scene, camera, renderer, world
const app = getThreeApp()

// Cannon debugger
const cannonDebugRenderer = new CannonDebugRenderer(app.scene, app.world)

//Loading textures
const textureLoader = new THREE.TextureLoader()

//GLTF Loader
const loader = new GLTFLoader()


// Contorls
const orbitControls = new OrbitControls(app.camera, app.renderer.domElement);
orbitControls.enableDamping = true
orbitControls.minDistance = 5
orbitControls.maxDistance = 15
orbitControls.enablePan = false
orbitControls.maxPolarAngle = Math.PI / 2 - 0.05
orbitControls.update()


let player : Player = createPlayer() //Player
let nebula : any
const leavesMaterial : THREE.ShaderMaterial = shaderLeaves() //leaves

initNebula()
initLight() 
initPlane() 
// initLeaves()

// const enemeyCube = new THREE.Mesh(
//     new THREE.BoxGeometry(2,2,2),
//     new THREE.MeshPhongMaterial({color:0x333333})
// )
// enemeyCube.position.set(1,2,2)
// scene.add(enemeyCube)

let bulletGeo = new THREE.SphereGeometry(0.2);
const bulletMaterial = new THREE.MeshBasicMaterial( { color: 0x005ce6 } );
let bullets = [];
let bulletIndex = 0;

for ( let i = 0; i < 100; ++i ){
const bulletMesh = new THREE.Mesh( bulletGeo, bulletMaterial )
bullets[i] = bulletMesh;
bulletMesh.visible = false
bulletMesh.userData = new THREE.Vector3();  // this is the velocity vector!
app.scene.add( bulletMesh )
}

// function shootBullet(controls, shootingObject)
//     {
//         let bulletMesh = this.bullets[this.bulletIndex++];
        
//         if (this.bulletIndex>=this.bullets.length)
//         {
//             this.bulletIndex = 0;
//         }
    
//         bulletMesh.visible = true;
    
//         let xAxis=new THREE.Vector3();
//         let yAxis=new THREE.Vector3();
//         let zAxis=new THREE.Vector3();
//         shootingObject.matrix.extractBasis(xAxis,yAxis,zAxis);
    
//         bulletMesh.position.copy( shootingObject.position );
//         //bulletMesh.position.addScaledVector( zAxis.normalize(), 1 );
//         //bulletMesh.position.addScaledVector( yAxis.normalize(), 0 );
//         bulletMesh.position.addScaledVector( xAxis.normalize(), 3 );
        
//         xAxis.y+=.025-.05*Math.random();
//         xAxis.x+=.05-.1*Math.random();
//         xAxis.z+=.05-.1*Math.random();
//         xAxis.normalize();
    
//         let bulletVelocity = bulletMesh.userData;
//         // bulletVelocity.copy(xAxis.normalize());
//         // bulletVelocity.addScaledVector( xAxis.normalize(), 0.8 + -0.2 + 0.4*Math.random());
//         bulletVelocity.copy(xAxis);
//         bulletVelocity.addScaledVector( xAxis, 2 + -0.6 + 1.2*Math.random());
//     }

const clock = new THREE.Clock()
function animate() : void {
    
    const delta = clock.getDelta()
    app.world.step(Math.min(delta, 0.1))
	leavesMaterial.uniforms.time.value = clock.getElapsedTime()
    leavesMaterial.uniformsNeedUpdate = true
    player ? player.update(delta,keysPressed) : null
    nebula ? nebula.update() : null

    cannonDebugRenderer.update()
    orbitControls.update()
    app.renderer.render(app.scene, app.camera)
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
        app.scene.add(model)
        app.world.addBody(body)
        player = new Player(model,mixer,animationMap,'idle',body)
        }
    )
    return player
}

// Nebula
function initNebula() : void {
    Nebula.fromJSONAsync(json, THREE).then((loaded:any) => {
        const nebulaRenderer = new SpriteRenderer(app.scene, THREE)
        loaded.emitters.forEach((a:any) => {
            a.position.y = 4
            
        })
        nebula = loaded.addRenderer(nebulaRenderer);
    })
    
}
// Plane
function initPlane() : void {
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
    app.scene.add(planeSoil)
    const planeShape = new CANNON.Plane()
    const planeBody = new CANNON.Body({ mass: 0, shape: planeShape})
    planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    app.world.addBody(planeBody)

}

// Lights
function initLight() : void {
    app.scene.add(new THREE.AmbientLight(0xffffff, 0.7))
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
    app.scene.add(dirLight);
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
    app.scene.add( instancedMesh );
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
    app.camera.aspect = window.innerWidth / window.innerHeight
    app.camera.updateProjectionMatrix()
    app.renderer.setSize(window.innerWidth, window.innerHeight)
    app.renderer.render(app.scene, app.camera)
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

