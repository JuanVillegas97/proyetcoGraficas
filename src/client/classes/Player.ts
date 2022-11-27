import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { Model } from './Model'

interface bullet { shape: THREE.Mesh, velocity : THREE.Vector3, body:  CANNON.Body} 


export class Player extends Model{
    private readonly fadeDuration: number = .2
    private readonly runVelocity: number = .4
    private readonly walkVelocity:number = .1
    private toggleRun: boolean = true
    private isShooting: boolean = false

    public bullets : bullet[]  = new Array(1).fill({
        shape: new THREE.Mesh( 
            new THREE.SphereGeometry(0.2), 
            new THREE.MeshBasicMaterial({ color: 0x005ce6 })
            ),
        velocity : new THREE.Vector3(),
        body: new CANNON.Body({ mass: 1, shape: new CANNON.Sphere(0.2)})
    })

    public bulletIndex = 0


    constructor(
        model: THREE.Group, 
        mixer: THREE.AnimationMixer,  
        animationsMap: Map<string, THREE.AnimationAction>,
        currentAction: string,
        body: CANNON.Body
        ){
        super(model,mixer,animationsMap,currentAction,body)
    }

    public switchRunToggle() : void {
        this.toggleRun = !this.toggleRun
    }


    public shoot(shootingObject:THREE.Group ,isShooting : boolean ): void {
    {
        this.bullets.forEach(bullet => {
            let bulletMesh = bullet.shape;
            bulletMesh.position.add( bullet.velocity );
            
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
            let bulletMesh =this.bullets[this.bulletIndex].shape 
            
            bulletMesh.visible = true
        
            let xAxis=new THREE.Vector3();
            let yAxis=new THREE.Vector3();
            let zAxis=new THREE.Vector3();
            shootingObject.matrix.extractBasis(xAxis,yAxis,zAxis);
        
            bulletMesh.position.copy( shootingObject.position );
            //OFF SET FOR BULLETS
            // bulletMesh.position.addScaledVector( zAxis.normalize(), 1 );
            bulletMesh.position.addScaledVector( yAxis.normalize(), 3 );
            bulletMesh.position.addScaledVector( xAxis.normalize(), 3 );
            
            xAxis.y=0.0
            xAxis.x+=.0002-.0004*Math.random();
            xAxis.z+=.0002-.0004*Math.random();
            xAxis.normalize();
        
            let bulletVelocity = this.bullets[this.bulletIndex].velocity
   
            bulletVelocity.copy(xAxis);
            bulletVelocity.addScaledVector(  xAxis.normalize(), 2 + -.2 + .4*Math.random());
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