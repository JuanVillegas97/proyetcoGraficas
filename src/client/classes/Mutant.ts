import * as THREE from 'three'
 import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
 import { Model } from './Model'
 import * as CANNON from 'cannon-es'
import { Vector2 } from 'three';

 export class Mutant extends Model{
    private raycaster = new THREE.Raycaster();
    private search: THREE.Vector3[] = [];

     constructor(model: THREE.Group, 
         mixer: THREE.AnimationMixer,  
         animationsMap: Map<string, THREE.AnimationAction>,
         currentAction: string,
         body: CANNON.Body
         ) {
            
         super(model,mixer,animationsMap,currentAction,body)
         for(let i = 100; i<220; i+=10) {
            this.search[i] = new THREE.Vector3(Math.cos(i * (Math.PI / 180)),0,Math.sin(i * (Math.PI / 180)));
            
         }
         console.log(this.search)
     }

   


     public update(delta:number,scene:THREE.Scene) : void{
        // this.body.position.set(posVec.x-10,posVec.y+10,posVec.z)
        // this.model.position.set(posVec.x-10,posVec.y-2,posVec.z)
        // this.model.rotation.y = rotation.y-.3

        this.mixer.update(delta)
        this.raycastCheck(scene)
     }

     public attack():void {
        //todo shoot stuff
     }

     public raycastCheck(scene: THREE.Scene):void {
        this.search.forEach((direction) => {
            const far = 15
            const dampSpeed = .15
            //scene.add(new THREE.ArrowHelper(this.raycaster.ray.direction, this.raycaster.ray.origin, far, 0xff0000) );
            const rayVec = new THREE.Vector3(this.model.position.x,this.model.position.y+2,this.model.position.z)
            this.raycaster.set((rayVec),direction);
            this.raycaster.far = far;
            const intersects = this.raycaster.intersectObjects(scene.children,false);
            console.log(intersects?.[0]?.object?.name)
            if (intersects?.[0]?.object.name==''){
                this.model.position.x += direction.x*dampSpeed;
                this.model.position.z += direction.z*dampSpeed;
                this.body.position.x += direction.x*dampSpeed;
                this.body.position.z += direction.z*dampSpeed;
            }
        })
        
     }
 }