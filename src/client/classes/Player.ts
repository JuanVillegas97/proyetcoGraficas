import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'


export class Player {

    private model: THREE.Group
    private mixer: THREE.AnimationMixer
    private animationsMap: Map<string, THREE.AnimationAction> = new Map() // Walk, Run, Idle
    private orbitControl: OrbitControls
    private camera: THREE.Camera
    // state
    private toggleRun: boolean = true
    private currentAction: string
     // temporary data
    private walkDirection = new THREE.Vector3()
    private rotateAngle = new THREE.Vector3(0, 1, 0)
    private rotateQuarternion: THREE.Quaternion = new THREE.Quaternion()
    private cameraTarget = new THREE.Vector3()

      // constants
    private readonly fadeDuration: number = 0.2
    private readonly runVelocity:number = .4
    private readonly walkVelocity:number = .1

    constructor(model: THREE.Group, 
        mixer: THREE.AnimationMixer,  
        animationsMap: Map<string, THREE.AnimationAction>,
        orbitControl: OrbitControls, 
        camera: THREE.Camera,
        currentAction: string) {
        this.model = model
        this.mixer = mixer
        this.animationsMap = animationsMap
        this.currentAction = currentAction
        this.animationsMap.forEach((value, key) => {
            if (key == currentAction) {
                value.play()
            }
        })
        this.orbitControl = orbitControl
        this.camera = camera
    }

    public switchRunToggle() : void {
        this.toggleRun = !this.toggleRun
    }


    public update(delta:number, keysPressed:any) : void{
        const directionPressed = ['w','a','s','d'].some(key => keysPressed[key] == true)
        let play = ''
        if (directionPressed && this.toggleRun) {
            play = 'walk'
        } else if (directionPressed) {
            play = 'run.001' //walking
        } else {
            play = 'idle'
        }
        if (this.currentAction != play) {
            const toPlay= this.animationsMap.get(play)
            const current = this.animationsMap.get(this.currentAction)

            current?.fadeOut(this.fadeDuration)
            toPlay?.reset().fadeIn(this.fadeDuration).play()
            this.currentAction = play
        }
        this.mixer.update(delta)
        if (this.currentAction == 'run.001' || this.currentAction == 'walk') {
            const velocity = this.currentAction == 'run.001' ? this.runVelocity : this.walkVelocity
            if(keysPressed.d==true){
                this.model.position.x += velocity
                this.model.rotation.y = 1.5
            }
            if(keysPressed.a==true){
                this.model.position.x -= velocity
                this.model.rotation.y = -1.5

            }
            if(keysPressed.s==true){
                this.model.position.z += velocity
                this.model.rotation.y = 0

            }
            if(keysPressed.w==true){
                this.model.position.z -= velocity
                this.model.rotation.y = 3
            }
            
        }
    }

}