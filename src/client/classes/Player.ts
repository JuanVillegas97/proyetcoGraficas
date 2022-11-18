import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import {Model } from './Model'

export class Player extends Model{
    private readonly fadeDuration: number = 0.2
    private readonly runVelocity:number = .2
    private readonly walkVelocity:number = .1
    
    private toggleRun: boolean = true
   
    constructor(model: THREE.Group, 
        mixer: THREE.AnimationMixer,  
        animationsMap: Map<string, THREE.AnimationAction>,
        camera: THREE.Camera,
        currentAction: string,
        shape: CANNON.Trimesh,
        body: CANNON.Body) {
        
        super(model,mixer,animationsMap,currentAction,shape,body)
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