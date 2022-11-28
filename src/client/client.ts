import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import {  GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Player } from './classes/Player'
import { DragonPatron } from './classes/DragonPatron'
import CannonDebugRenderer from './utils/cannonDebugRenderer'
import getThreeApp from "./classes/App"
import { Mutant } from './classes/Mutant'
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





let player : Player  
let dragon : DragonPatron
let mutant : Mutant
let skyboxMesh : THREE.Mesh
let nebula : any
const leavesMaterial : THREE.ShaderMaterial = shaderLeaves() //leaves


initDragon() 
initSky()



initPlayer()
initLight() 
initPlane() 
initMutant()

const balls : CANNON.Body[]= []
const ballMeshes : THREE.Mesh[] = []
const shootVelocity = 5
const ballShape = new CANNON.Sphere(0.2)
const ballGeometry = new THREE.SphereGeometry(0.2)


window.addEventListener('click', (event) => {
    

    const ballBody = new CANNON.Body({ mass: .0001 })
    ballBody.addShape(ballShape)
    const ballMesh = new THREE.Mesh(ballGeometry, new THREE.MeshLambertMaterial({ color: 0xdddddd }))

    ballMesh.castShadow = true
    ballMesh.receiveShadow = true

    app.world.addBody(ballBody)
    app.scene.add(ballMesh)
    balls.push(ballBody)
    ballMeshes.push(ballMesh)

    
    ballBody.velocity.set(
      1 * shootVelocity,
      0 * shootVelocity,
      0 * shootVelocity
    )

    // Move the ball outside the player sphere
    const x = player.getModel().position.x + 3
    const y = player.getModel().position.y + 3
    const z = player.getModel().position.z + 3
    ballBody.position.set(x, y, z)
    ballMesh.position.set(ballBody.position.x,ballBody.position.y,ballBody.position.z)
})




const clock = new THREE.Clock()
function animate() : void {
    
    const delta = clock.getDelta()
    app.world.step(Math.min(delta, 0.1))
	leavesMaterial.uniforms.time.value = clock.getElapsedTime()
    leavesMaterial.uniformsNeedUpdate = true

    for (let i = 0; i < balls.length; i++) {
        ballMeshes[i].position.set(balls[i].position.x,balls[i].position.y,balls[i].position.z)
        ballMeshes[i].quaternion.set(balls[i].quaternion.x,balls[i].quaternion.y,balls[i].quaternion.z,balls[i].quaternion.w)
    }

    player ? player.update(delta,keysPressed,mouseButtonsPressed) : null
    nebula ? nebula.update() : null
    dragon ? dragon.update(delta, player.getModel().position,player.getModel().rotation) : null
    mutant ?  mutant.update(delta,app.scene) : null
    cannonDebugRenderer.update()

    skyboxMesh.position.copy( app.camera.position );
    //update camera to follow player
     player ? app.camera.position.x = player.getModel().position.x : null
     player ? app.camera.lookAt(player.getModel().position) :null
    app.renderer.render(app.scene, app.camera)
    requestAnimationFrame(animate)
}
animate()

//Things forgotten by the hand of god

// Player
function initPlayer() : void {
    loader.load('/models/warlock.glb',function (gltf) {
        const model = gltf.scene
        const gltfAnimations: THREE.AnimationClip[] = gltf.animations
        const mixer = new THREE.AnimationMixer(model)
        const animationMap: Map<string, THREE.AnimationAction> = new Map()
        gltfAnimations.filter(a=> a.name != 'Armature.001|mixamo.com|Layer0').forEach((a:THREE.AnimationClip)=>{
            animationMap.set(a.name,mixer.clipAction(a))
        })
        const body = new CANNON.Body({ mass: 1, shape: new CANNON.Cylinder(.5, 1, 4, 12)})
        body.position.y = 3
        model.name = 'Warlock'
        model.traverse((object: any)=>{if(object.isMesh) object.castShadow = true})
        app.scene.add(model)
        app.world.addBody(body)
        player = new Player(model,mixer,animationMap,'idle',body)
    })
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

//Mutant
function initMutant():void {
    loader.load('/models/mutant.glb',function (gltf) {
        const model = gltf.scene
        const gltfAnimations: THREE.AnimationClip[] = gltf.animations
        const mixer = new THREE.AnimationMixer(model)
        const animationMap: Map<string, THREE.AnimationAction> = new Map()
        gltfAnimations.forEach((a:THREE.AnimationClip)=>{
            animationMap.set(a.name,mixer.clipAction(a))
        })
        const shape =  new CANNON.Cylinder(2, 2, 9, 12)
        const body = new CANNON.Body({ mass: 25, shape: shape})
        body.position.y = 0
        body.position.x = 15
        model.name = 'Mutant'
        model.position.y= 0
        model.position.x= 15
        model.rotateY(-1)
        model.scale.set(5,5,5)
        model.traverse((object: any)=>{if(object.isMesh) object.castShadow = true})
        app.scene.add(model)
        app.world.addBody(body)
        mutant = new Mutant(model,mixer,animationMap,'idle',body)
    }
    )
}
// Skybox
function initSky() : void {
    const ft = new THREE.TextureLoader().load("/skybox/bluecloud_ft.jpg");
    const bk = new THREE.TextureLoader().load("/skybox/bluecloud_bk.jpg");
    const up = new THREE.TextureLoader().load("/skybox/bluecloud_up.jpg");
    const dn = new THREE.TextureLoader().load("/skybox/bluecloud_dn.jpg");
    const rt = new THREE.TextureLoader().load("/skybox/bluecloud_rt.jpg");
    const lf = new THREE.TextureLoader().load("/skybox/bluecloud_lf.jpg")
    const skyboxGeo = new THREE.BoxGeometry(2000,2000,2000);
    const skyboxMaterials =[
    new THREE.MeshBasicMaterial( { map: ft, side: THREE.BackSide } ),
    new THREE.MeshBasicMaterial( { map: bk, side: THREE.BackSide } ),
    new THREE.MeshBasicMaterial( { map: up, side: THREE.BackSide } ),
    new THREE.MeshBasicMaterial( { map: dn, side: THREE.BackSide } ),
    new THREE.MeshBasicMaterial( { map: rt, side: THREE.BackSide } ),
    new THREE.MeshBasicMaterial( { map: lf, side: THREE.BackSide } ),]

    skyboxMesh = new THREE.Mesh( skyboxGeo, skyboxMaterials );
    app.scene.add(skyboxMesh);
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

function initDragon() : void {
    loader.load('/models/bigboie.glb',function (gltf) {
        const model = gltf.scene
        const gltfAnimations: THREE.AnimationClip[] = gltf.animations
        const mixer = new THREE.AnimationMixer(model)
        const animationMap: Map<string, THREE.AnimationAction> = new Map()
        gltfAnimations.forEach((a:THREE.AnimationClip)=>{
            animationMap.set(a.name,mixer.clipAction(a))
        })
        const shape =  new CANNON.Cylinder(1, 1, .5, 12)
        const body = new CANNON.Body({ mass: 1, shape: shape})
        body.position.y = -10
        model.name = 'DragonPatron'
        model.position.y= -10
        model.rotateY(1)
        model.scale.set(4,4,4)
        model.traverse((object: any)=>{if(object.isMesh) object.castShadow = true})
        app.scene.add(model)
        app.world.addBody(body)
        dragon = new DragonPatron(model,mixer,animationMap,'Flying',body)
       // dragon.matrix = gltf.scene.matrix;
        }
    )
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

//Mouse listener
const mouseButtonsPressed ={ }
window.addEventListener('mousedown',(e)=>{
    //0: left mouse
    //1: mouse wheel down
    //2: right mouse
     (mouseButtonsPressed as any)[e.button.valueOf()] = true
    //  if(e.button.valueOf() == 0) {
    //    //do something
    //  } else if (e.button.valueOf() == 2) {
    //     //do something
    //  }
    e.preventDefault();
})
window.addEventListener('mouseup',(e)=>{
    //0: left mouse
    //1: mouse wheel down
    //2: right mouse
     (mouseButtonsPressed as any)[e.button.valueOf()] = false   
    e.preventDefault();
    
})