// import * as THREE from 'three'
// import * as CANNON from 'cannon-es'

// export class Model{
//     protected model: THREE.Group
//     protected mixer: THREE.AnimationMixer
//     protected animationsMap: Map<string, THREE.AnimationAction> = new Map()
//     protected currentAction: string

//     protected shape: CANNON.Trimesh
//     protected body: CANNON.Body

    
//     constructor(model: THREE.Group, 
//         mixer: THREE.AnimationMixer,  
//         animationsMap: Map<string, THREE.AnimationAction>,
//         currentAction: string,
//         shape: CANNON.Trimesh,
//         body: CANNON.Body
//         ){
//         this.model = model
//         this.mixer = mixer
//         this.animationsMap = animationsMap
//         this.currentAction = currentAction
//         this.animationsMap.forEach((value, key) => {
//             if (key == currentAction) {
//                 value.play()
//             }
//         })
//         this.shape = shape
//         this.body = body
//     }

//     public getModel(): THREE.Group{
//         return this.model
//     }
// }