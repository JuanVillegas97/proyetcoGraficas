// import * as THREE from 'three';

// class MySkybox
// {
//     constructor( scene : any )
//     {
//         const ft = new THREE.TextureLoader().load("./assets/skybox/graycloud_ft.jpg");
//         const bk = new THREE.TextureLoader().load("./assets/skybox/graycloud_bk.jpg");
//         const up = new THREE.TextureLoader().load("./assets/skybox/graycloud_up.jpg");
//         const dn = new THREE.TextureLoader().load("./assets/skybox/graycloud_dn.jpg");
//         const rt = new THREE.TextureLoader().load("./assets/skybox/graycloud_rt.jpg");
//         const lf = new THREE.TextureLoader().load("./assets/skybox/graycloud_lf.jpg");

//         const skyboxGeo = new THREE.BoxGeometry(2000,2000,2000);
//         const skyboxMaterials =
//         [
//             new THREE.MeshBasicMaterial( { map: ft, side: THREE.BackSide } ),
//             new THREE.MeshBasicMaterial( { map: bk, side: THREE.BackSide } ),
//             new THREE.MeshBasicMaterial( { map: up, side: THREE.BackSide } ),
//             new THREE.MeshBasicMaterial( { map: dn, side: THREE.BackSide } ),
//             new THREE.MeshBasicMaterial( { map: rt, side: THREE.BackSide } ),
//             new THREE.MeshBasicMaterial( { map: lf, side: THREE.BackSide } ),
//         ];

//         this.skyboxMesh = new THREE.Mesh( skyboxGeo, skyboxMaterials );
//         scene.add(this.skyboxMesh);

//         // const sphereGeo = new THREE.SphereGeometry(1);
//         // const sphereMaterial = new THREE.MeshBasicMaterial( { color: 0xff00ff } );
//         // let birdyShip = new THREE.Mesh( sphereGeo, sphereMaterial );

//         // this.birdyShip = birdyShip;
//         // scene.add( this.birdyShip );
//     }

//     update(camera)
//     {
//         this.skyboxMesh.position.copy( camera.position );
//     }
// }

// export { MySkybox };