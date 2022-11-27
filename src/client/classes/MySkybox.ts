 import * as THREE from 'three';

 class MySkybox
 {
    private skyboxMesh;
     constructor( scene : any )
     {
         const ft = new THREE.TextureLoader().load("/skybox/bluecloud_ft.jpg");
         const bk = new THREE.TextureLoader().load("/skybox/bluecloud_bk.jpg");
         const up = new THREE.TextureLoader().load("/skybox/bluecloud_up.jpg");
         const dn = new THREE.TextureLoader().load("/skybox/bluecloud_dn.jpg");
         const rt = new THREE.TextureLoader().load("/skybox/bluecloud_rt.jpg");
         const lf = new THREE.TextureLoader().load("/skybox/bluecloud_lf.jpg");

         const skyboxGeo = new THREE.BoxGeometry(2000,2000,2000);
         const skyboxMaterials =
         [
             new THREE.MeshBasicMaterial( { map: ft, side: THREE.BackSide } ),
             new THREE.MeshBasicMaterial( { map: bk, side: THREE.BackSide } ),
             new THREE.MeshBasicMaterial( { map: up, side: THREE.BackSide } ),
             new THREE.MeshBasicMaterial( { map: dn, side: THREE.BackSide } ),
             new THREE.MeshBasicMaterial( { map: rt, side: THREE.BackSide } ),
             new THREE.MeshBasicMaterial( { map: lf, side: THREE.BackSide } ),
         ];

         this.skyboxMesh = new THREE.Mesh( skyboxGeo, skyboxMaterials );
         scene.add(this.skyboxMesh);

     }

     update(camera : any)
     {
         this.skyboxMesh.position.copy( camera.position );
     }
 }

 export { MySkybox };