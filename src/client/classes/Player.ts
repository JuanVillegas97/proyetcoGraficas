import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { Model } from './Model'
import { Vec3 } from 'cannon-es'

interface myVelocity {three: THREE.Vector3, cannon: CANNON.Vec3}
interface bullet { shape: THREE.Mesh, body:  CANNON.Body, velocity : myVelocity,} 


export class Player extends Model{
    private readonly fadeDuration: number = .2
    private readonly runVelocity: number = .4
    private readonly walkVelocity:number = .1
    private toggleRun: boolean = true
    private isShooting: boolean = false
    private bullets : bullet[]  = new Array(100).fill({
        shape: new THREE.Mesh( new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial({ color: 0x005ce6 })),
        body: new CANNON.Body({ mass: 1, shape: new CANNON.Sphere(0.2)}),
        velocity : {three: new THREE.Vector3(), cannon: new CANNON.Vec3()}
    })

    private bulletIndex = 0

    constructor(
        model: THREE.Group, 
        mixer: THREE.AnimationMixer,  
        animationsMap: Map<string, THREE.AnimationAction>,
        currentAction: string,
        body: CANNON.Body
        ){
        super(model,mixer,animationsMap,currentAction,body)
    }

    public getBullets() : bullet[] {
        return this.bullets
    }
    public switchRunToggle() : void {
        this.toggleRun = !this.toggleRun
    }


    public shoot(shootingObject:THREE.Group ,isShooting : boolean ): void {
    {
        this.bullets.forEach(bullet => {
            let bulletMesh = bullet.shape;
            bulletMesh.position.add( bullet.velocity.three );

            let bulletBody = bullet.body;
            bulletBody.position.vadd( bullet.velocity.cannon );
            
            //Set every bullet to delete
            // if ( bulletMesh.position.x > 30 ) bulletMesh.visible=false;
            // if ( bulletMesh.position.x < -30 ) bulletMesh.visible=false;
            // if ( bulletMesh.position.z > 30 ) bulletMesh.visible=false;
            // if ( bulletMesh.position.z < -30 ) bulletMesh.visible=false;   
        })

        if (isShooting)
        {
            this.bulletIndex++
            if (this.bulletIndex>=this.bullets.length) this.bulletIndex = 0

            let body = this.bullets[this.bulletIndex].body
            let x : number = 1
            let y : number = 0
            let z : number = 0

            x+=.0002-.0004*Math.random()

            body.velocity.set(x*15,y,z)
            body.position.set(shootingObject.position.y+3,shootingObject.position.x+3,shootingObject.position.z)

            // let mynew = new THREE.Vector3(body.position.x,body.position.y,body.position.z)
            // let bulletMesh = this.bullets[this.bulletIndex].shape 
            // bulletMesh.visible = true
            // bulletMesh.position.copy(mynew)
            }
        }
    }
    public update(delta:number, keysPressed:any) : void{
        this.shoot(this.model, this.isShooting)
        const directionPressed = ['w','a','s','d'].some(key => keysPressed[key] == true)
        let play = ''
        if (directionPressed && this.toggleRun) {
            play = 'walk'
        } else if (directionPressed) {
            play = 'run.001' //walking
        } else if(keysPressed.z==true){
            this.isShooting = !this.isShooting
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
                this.body.position.x += velocity
                this.model.rotation.y = 1.5
            }
            if(keysPressed.a==true){
                this.body.position.x -= velocity
                this.model.rotation.y = -1.5

            }
            if(keysPressed.s==true){
                this.body.position.z += velocity
                this.model.rotation.y = 0

            }
            if(keysPressed.w==true){
                this.body.position.z -= velocity
                this.model.rotation.y = 3
            }
        }
        this.model.position.set(this.body.position.x,this.body.position.y-2,this.body.position.z)
    }

}