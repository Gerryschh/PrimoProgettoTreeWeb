import * as THREE from 'https://unpkg.com/three@0.122.0/build/three.module.js'
import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.122.0/examples/jsm/loaders/GLTFLoader.js';
import { VRButton } from 'https://cdn.jsdelivr.net/npm/three@0.122.0/examples/jsm/webxr/VRButton.js';
import {XRControllerModelFactory} from 'https://cdn.jsdelivr.net/npm/three@0.122.0/examples/jsm/webxr/XRControllerModelFactory.js';
import {XRHandModelFactory} from 'https://cdn.jsdelivr.net/npm/three@0.122.0/examples/jsm/webxr/XRHandModelFactory.js';

import * as CANNON from '/dist/cannon-es.js';
import Stats from 'https://unpkg.com/three@0.122.0/examples/jsm/libs/stats.module.js';
import { PointerLockControlsCannon } from '/js/PointerLockControlsCannon.js';

/**
 * @author Gerryschh / https://github.com/Gerryschh
 * @author miche / https://github.com/michelangelo26
 */

let myCam, myScene, myRenderer, stats;

      var myRay = new THREE.Raycaster();
      var mouse = new THREE.Vector2();
      let material = new THREE.MeshPhongMaterial({
        color : 0xffffff,
        opacity: 0,
        transparent: true,
      });

      let materialBlu = new THREE.MeshPhongMaterial({
        color: 0x0000ff,
        opacity: 0.7,
        transparent: true,

      })

      let materialRosso = new THREE.MeshPhongMaterial({
        color: 0xff0000,
        opacity: 0.7,
        transparent: true,

      })

      let materialVerde = new THREE.MeshPhongMaterial({
        color: 0x008000,
        opacity: 0.7,
        transparent: true,

      })


      let materialPalleGrosse = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        opacity: 0.8,
        transparent: true,
      })

      let hand1, hand2;
      let controller1, controller2;
      let controllerGrip1, controllerGrip2;
			let intersectsPanda = [];
      let intersectsBear = [];
      let intersectsZebra = [];
      let intersectsTiger = [];
      let intersectsPantera = [];
      let mixers = [];
      let NPCOctahedronMesh1, NPCOctahedronMesh2, NPCOctahedronMesh3, NPCOctahedronMesh4, NPCOctahedronMesh5;

      // cannon.js variables
      let world;
      let controls;
      const timeStep = 1 / 60;
      let lastCallTime = performance.now();
      let sphereShape;
      let sphereBody;
      let physicsMaterial;
      const balls = [];
      const ballMeshes = [];
      const boxes = [];
      const boxMeshes = [];

			init();
      initCannon();
      initPointerLock();

			animate();
      loadPlane();
      loadWorkingZoneText('./resources/modelGLTF/WorkText.gltf', 90, 6, -36.6, 8.8);
      loadAnimatedModelFromBlender('./resources/animals/farfallaAnimated.gltf', -6.6, 1.1, -11.1, 0.11);
      loadAnimatedModelFromBlender('./resources/animals/farfallaAnimated.gltf', 8.8, 1.1, -55.5, 0.11);
      loadAnimatedModelFromBlender('./resources/animals/farfallaAnimated.gltf', -6.6, 1.1, -11.1, 0.11);
      loadAnimatedModelFromBlender('./resources/animals/farfallaAnimated.gltf', 8.8, 1.1, -55.5, 0.11);
      loadAnimatedModelFromBlender('./resources/animals/bee1.gltf', 8.8, 1.1, -55.5, 0.11);
      loadAnimatedModelFromBlender('./resources/animals/bee3.gltf', 8.8, 1.1, -51.1, 0.11);
      loadAnimatedModelFromBlender('./resources/animals/farfallaAnimated.gltf', -6.66, 1.1, -66.6, 0.11);
      loadAnimatedModelFromBlender('./resources/animals/bee1.gltf', 6.66, 1.66, -38.8, 0.077);
      loadAnimatedModelFromBlender('./resources/animals/bee3.gltf', 6.66, 1.66, -38.8, 0.077);
      //CENTER ZONE
      loadAnimatedModelFromBlenderWithRotation('./resources/animals/bear.gltf', -0.66, 0, 8.5, 1.3, 3);
      //WORK IN PROGRESS ZONE
      loadAnimatedModelFromBlenderWithRotation('./resources/animals/tigre.gltf', 31, 0, 0, 1.3, 4.5);
      //EMPTY-PLAYING ZONE
      loadAnimatedModelFromBlenderWithRotation('./resources/animals/zebra.gltf', 8.7, 0, 30, 1.3, 9.5);
      //WATER ZONE
      loadAnimatedModelFromBlenderWithRotation('./resources/animals/pantera.gltf', -78, 0, -9, 1.3, 1.7);
      //CINEMA ZONE
      loadAnimatedModelFromBlenderWithRotation('./resources/animals/panda.gltf', 2, 0, -47, 1.3, 0);

			function init() {

        //Initializing Camera
				myCam = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

        //Initializing Scene and Fog
				myScene = new THREE.Scene();
				myScene.fog = new THREE.Fog(0xECFFE7, 0, 600);

        //Initializing Renderer
				myRenderer = new THREE.WebGLRenderer( { antialias: true } );
        //myRenderer.outputEncoding = THREE.sRGBEncoding;
        myRenderer.setClearColor(myScene.fog.color);
        myRenderer.shadowMap.enabled = true;
        myRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
				//myRenderer.setPixelRatio( window.devicePixelRatio );
				myRenderer.setSize( window.innerWidth, window.innerHeight );
				document.body.appendChild( myRenderer.domElement );

        // Stats.js
        stats = new Stats();
        document.body.appendChild(stats.dom);

        //On Window Resize
				window.addEventListener( 'resize', onWindowResize );

        //Loading OctahedronGeometry on NPC
        const NPCOctahedronGeometry = new THREE.OctahedronGeometry(0.15, 0);
        const NPCOctahedronMaterial = new THREE.MeshNormalMaterial ({color: 0x00ff00});
        NPCOctahedronMesh1 = new THREE.Mesh( NPCOctahedronGeometry, NPCOctahedronMaterial);
        NPCOctahedronMesh2 = new THREE.Mesh( NPCOctahedronGeometry, NPCOctahedronMaterial);
        NPCOctahedronMesh3 = new THREE.Mesh( NPCOctahedronGeometry, NPCOctahedronMaterial);
        NPCOctahedronMesh4 = new THREE.Mesh( NPCOctahedronGeometry, NPCOctahedronMaterial);
        NPCOctahedronMesh5 = new THREE.Mesh( NPCOctahedronGeometry, NPCOctahedronMaterial);
        NPCOctahedronMesh1.position.set(-0.66, 2.35, 8.5);
        NPCOctahedronMesh2.position.set(31, 2.35, 0);
        NPCOctahedronMesh3.position.set(8.7, 2.35, 30);
        NPCOctahedronMesh4.position.set(-78, 2.35, -9);
        NPCOctahedronMesh5.position.set(2, 2.35, -47);
        myScene.add(NPCOctahedronMesh1);
        myScene.add(NPCOctahedronMesh2);
        myScene.add(NPCOctahedronMesh3);
        myScene.add(NPCOctahedronMesh4);
        myScene.add(NPCOctahedronMesh5);

        //Loading cube with a video playing on it (no audio)
        const video = document.getElementById('video');
        const textureVideo = new THREE.VideoTexture(video);
        const videoMaterial = new THREE.MeshBasicMaterial ({ map : textureVideo});
        const cubo = new THREE.BoxGeometry(183.33/(1.2), 90/(1.2), 1);
        const mesh = new THREE.Mesh( cubo, videoMaterial);
        mesh.position.set(0, 30, -190);
        myScene.add(mesh);

        //Loading lights
        const ambientLight = new THREE.AmbientLight( 0xffffff, 1 );
        myScene.add(ambientLight);

        const pointLight = new THREE.PointLight( 0xffffff, 1.1 );
        pointLight.position.set( 0, 120, 0 );
        myScene.add(pointLight);

        //Setupping VR
        document.body.appendChild( VRButton.createButton( myRenderer ) );
        myRenderer.xr.enabled = true;
        myRenderer.xr.setReferenceSpaceType( 'local-floor' );

        const cameraGroup = new THREE.Group();
        cameraGroup.position.y = 0;  // Set the initial VR Headset Position.
        
        //When user turn on the VR mode.
        myRenderer.xr.addEventListener('sessionstart', function () {
            myScene.add(cameraGroup);
            cameraGroup.add(myCam);
        });
        //When user turn off the VR mode.
        myRenderer.xr.addEventListener('sessionend', function () {
          myScene.remove(cameraGroup);
          cameraGroup.remove(myCam);
        });

        controller1 = myRenderer.xr.getController( 0 );
				myScene.add( controller1 );

				controller2 = myRenderer.xr.getController( 1 );
				myScene.add( controller2 );

				const controllerModelFactory = new XRControllerModelFactory();
				const handModelFactory = new XRHandModelFactory();

				// Hand 1
				controllerGrip1 = myRenderer.xr.getControllerGrip( 0 );
				controllerGrip1.add( controllerModelFactory.createControllerModel( controllerGrip1 ) );
				myScene.add( controllerGrip1 );

				hand1 = myRenderer.xr.getHand( 0 );
				hand1.add( handModelFactory.createHandModel( hand1 ) );

				myScene.add( hand1 );

				// Hand 2
				controllerGrip2 = myRenderer.xr.getControllerGrip( 1 );
				controllerGrip2.add( controllerModelFactory.createControllerModel( controllerGrip2 ) );
				myScene.add( controllerGrip2 );

				hand2 = myRenderer.xr.getHand( 1 );
				hand2.add( handModelFactory.createHandModel( hand2 ) );
				myScene.add( hand2 );

				const geometry = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, - 1 ) ] );

				const line = new THREE.Line( geometry );
				line.name = 'line';
				line.scale.z = 5;

				controller1.add( line.clone() );
				controller2.add( line.clone() );
        
        //Loading skybox
        const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
            './resources/skybox/posy.bmp',
            './resources/skybox/posx.bmp',
            './resources/skybox/posz.bmp',
            './resources/skybox/negy.bmp',
            './resources/skybox/negz.bmp',
            './resources/skybox/negx.bmp',
        ]);
        texture.encoding = THREE.sRGBEncoding;
        myScene.background = texture;

        //Interactions
        //Bear Interactions
        const geometry2 = new THREE.BoxGeometry( 1, 2.5, 1 );
        const material = new THREE.MeshPhongMaterial({
          color : 0xffffff,
          opacity: 0,
          transparent: true,
        });
        const cubeBear = new THREE.Mesh( geometry2, material );
        cubeBear.position.set(-0.66, 1, 8.5);
        myScene.add( cubeBear );
        intersectsBear.push(cubeBear);

        //Panda Interactions
        const cubePanda = new THREE.Mesh( geometry2, material );
        cubePanda.position.set(2, 1, -47);
        myScene.add( cubePanda );
        intersectsPanda.push(cubePanda);

        //Zebra Interactions
        const cubeZebra = new THREE.Mesh( geometry2, material );
        cubeZebra.position.set(8.7, 1, 30);
        myScene.add( cubeZebra );
        intersectsZebra.push(cubeZebra);

        //Tiger Interactions
        const cubeTiger = new THREE.Mesh( geometry2, material );
        cubeTiger.position.set(31, 1, 0);
        myScene.add( cubeTiger );
        intersectsTiger.push(cubeTiger);

        //Pantera Interactions
        const cubePantera = new THREE.Mesh( geometry2, material );
        cubePantera.position.set(-78, 1, -9);
        myScene.add( cubePantera );
        intersectsPantera.push(cubePantera);
        
        document.addEventListener( 'mousedown', function( event ) {
    
          var rect = myRenderer.domElement.getBoundingClientRect();
         mouse.x = ( ( event.clientX - rect.left ) / ( rect.width - rect.left ) ) * 2 - 1;
         mouse.y = - ( ( event.clientY - rect.top ) / ( rect.bottom - rect.top) ) * 2 + 1;
           
           myRay.setFromCamera( mouse, myCam );
            
             var bear = myRay.intersectObjects( intersectsBear );
             var panda = myRay.intersectObjects( intersectsPanda );
             var zebra = myRay.intersectObjects( intersectsZebra );
             var tiger = myRay.intersectObjects( intersectsTiger );
             var pantera = myRay.intersectObjects( intersectsPantera );
         
             if ( bear.length > 0 ) {
                 controls.unlock();
                 var popupBear = document.getElementById("popup1Bear");
                 popupBear.style.display = "flex";
                 popupBear.style.visibility = "visible";
                 var bottoneChiudiBear = document.getElementById("bottoneChiudiBear");

                 bottoneChiudiBear.onclick = function() {
                 popupBear.style.display = "none";
                 popupBear.style.visibility = "hidden";
                 controls.lock();
               }          
            }
            if ( panda.length > 0 )
            {
                controls.unlock();
                var popupPanda = document.getElementById("popup1Panda");
                 popupPanda.style.display = "flex";
                 popupPanda.style.visibility = "visible";
                 var bottoneChiudiPanda = document.getElementById("bottoneChiudiPanda");

                 bottoneChiudiPanda.onclick = function() {
                 popupPanda.style.display = "none";
                 popupPanda.style.visibility = "hidden";
                 controls.lock();
               } 
            }
            if ( zebra.length > 0 )
            {
              controls.unlock();
                var popupZebra = document.getElementById("popup1Zebra");
                 popupZebra.style.display = "flex";
                 popupZebra.style.visibility = "visible";
                 var bottoneChiudiZebra = document.getElementById("bottoneChiudiZebra");

                 bottoneChiudiZebra.onclick = function() {
                 popupZebra.style.display = "none";
                 popupZebra.style.visibility = "hidden";
                 controls.lock();
               } 
            }
            if ( tiger.length > 0 )
            {
              controls.unlock();
                var popupTiger = document.getElementById("popup1Tiger");
                 popupTiger.style.display = "flex";
                 popupTiger.style.visibility = "visible";
                 var bottoneChiudiTiger = document.getElementById("bottoneChiudiTiger");

                 bottoneChiudiTiger.onclick = function() {
                 popupTiger.style.display = "none";
                 popupTiger.style.visibility = "hidden";
                 controls.lock();
               } 
            }
            if ( pantera.length > 0 )
            {
              controls.unlock();
                var popupPantera = document.getElementById("popup1Pantera");
                 popupPantera.style.display = "flex";
                 popupPantera.style.visibility = "visible";
                 var bottoneChiudiPantera = document.getElementById("bottoneChiudiPantera");

                 bottoneChiudiPantera.onclick = function() {
                 popupPantera.style.display = "none";
                 popupPantera.style.visibility = "hidden";
                 controls.lock();
               } 
            }
         
         }, false );

      }
      
      function initCannon() {
        world = new CANNON.World()

        // Tweak contact properties.
        // Contact stiffness - use to make softer/harder contacts
        world.defaultContactMaterial.contactEquationStiffness = 1e9

        // Stabilization time in number of timesteps
        world.defaultContactMaterial.contactEquationRelaxation = 4

        const solver = new CANNON.GSSolver()
        solver.iterations = 7
        solver.tolerance = 0.1
        world.solver = new CANNON.SplitSolver(solver)
        // use this to test non-split solver
        // world.solver = solver

        world.gravity.set(0, -45, 0)

        // Create a slippery material (friction coefficient = 0.0)
        physicsMaterial = new CANNON.Material('physics')
        const physics_physics = new CANNON.ContactMaterial(physicsMaterial, physicsMaterial, {
          friction: 0.0,
          restitution: 0.3,
        })

        // We must add the contact materials to the world
        world.addContactMaterial(physics_physics)

        // Create the user collision sphere
        
        sphereShape = new CANNON.Sphere(2)
        sphereBody = new CANNON.Body({ mass: 5, material: physicsMaterial })
        sphereBody.addShape(sphereShape)
        sphereBody.position.set(0, 6, 0)
        sphereBody.linearDamping = 0.9
        world.addBody(sphereBody)

        // Create the ground plane
        const groundShape = new CANNON.Plane()
        const groundBody = new CANNON.Body({ mass: 0, material: physicsMaterial })
        groundBody.addShape(groundShape)
        groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
        groundBody.position.set(0, -0.01, 0)
        world.addBody(groundBody)

        // Add fence shape 
        const fence = new CANNON.Vec3(12, 4, 1)
        const fenceShape = new CANNON.Box(fence)
        const fenceGeometry = new THREE.BoxBufferGeometry(fence.x *2 , fence.y *2, fence.z *2)

        // Add fence + bridge shape 
        const fbridge = new CANNON.Vec3(27, 4, 1)
        const fbridgeShape = new CANNON.Box(fbridge)
        const fbridgeGeometry = new THREE.BoxBufferGeometry(fbridge.x *2 , fbridge.y *2, fbridge.z *2)

        //Box for house
        const casa = new CANNON.Vec3(5, 5, 5)
        const casaShape = new CANNON.Box(casa)
        const casaGeometry = new THREE.BoxBufferGeometry(casa.x *2 , casa.y *2, casa.z *2)

        //Box for tree (waterzone)
        const albero = new CANNON.Vec3(3, 3, 3)
        const alberoShape = new CANNON.Box(albero)
        const alberoGeometry = new THREE.BoxBufferGeometry(albero.x *2 , albero.y *2, albero.z *2)

        // Add waterzone hitboxes
        const muroWater = new CANNON.Vec3(7, 4, 1)
        const muroWaterShape = new CANNON.Box(muroWater)
        const muroWaterGeometry = new THREE.BoxBufferGeometry(muroWater.x *2 , muroWater.y *2, muroWater.z *2)

        const muroWaterBig = new CANNON.Vec3(16, 4, 1)
        const muroWaterShapeBig = new CANNON.Box(muroWaterBig)
        const muroWaterGeometryBig = new THREE.BoxBufferGeometry(muroWaterBig.x *2 , muroWaterBig.y *2, muroWaterBig.z *2)

        // Hitbox to close the road
        const cubeClose = new CANNON.Vec3(1.5, 3, 1.5)
        const cubeShape = new CANNON.Box(cubeClose)
        const cubeGeometry = new THREE.BoxBufferGeometry(cubeClose.x *2, cubeClose.y *2, cubeClose.z *2)
        

        // Adding a hitboxes for fences WORKSITE
        const muro1 = new CANNON.Body({ mass: 100 })
        muro1.addShape(fenceShape)
        const muroMesh = new THREE.Mesh(fenceGeometry, material)
        muro1.position.set(22, 6, 4.2)
        muro1.castShadow = true
        muro1.receiveShadow = true
        world.addBody(muro1)
        myScene.add(muroMesh)
        boxes.push(muro1)
        boxMeshes.push(muroMesh)

        const muro2 = new CANNON.Body({ mass: 100 })
        muro2.addShape(fenceShape)
        const muroMesh2 = new THREE.Mesh(fenceGeometry, material)
        muro2.position.set(20, 6, -4.5)
        muro2.castShadow = true
        muro2.receiveShadow = true
        world.addBody(muro2)
        myScene.add(muroMesh2)
        boxes.push(muro2)
        boxMeshes.push(muroMesh2)


        const muroChiuso = new CANNON.Body({ mass : 100 })
        muroChiuso.addShape(cubeShape)
        const muroChiusoMesh = new THREE.Mesh(cubeGeometry, material)
        muroChiuso.position.set(30, 6, 0)
        muroChiuso.castShadow = true
        muroChiuso.receiveShadow = true
        world.addBody(muroChiuso)
        myScene.add(muroChiusoMesh)
        boxes.push(muroChiuso)
        boxMeshes.push(muroChiusoMesh)


        // Adding a hitboxes for fences playground
        const muro3 = new CANNON.Body({ mass: 100 })
        muro3.addShape(fenceShape)
        const muroMesh3 = new THREE.Mesh(fenceGeometry, material)
        muro3.position.set(10.9, 6, 19)
        muro3.quaternion.setFromEuler(0, -Math.PI / 2.5, 0)
        muro3.castShadow = true
        muro3.receiveShadow = true
        world.addBody(muro3)
        myScene.add(muroMesh3)
        boxes.push(muro3)
        boxMeshes.push(muroMesh3)

        const muro4 = new CANNON.Body({ mass: 100 })
        muro4.addShape(fenceShape)
        const muroMesh4 = new THREE.Mesh(fenceGeometry, material)
        muro4.position.set(3, 6, 21)
        muro4.quaternion.setFromEuler(0, -Math.PI / 2.5, 0)
        muro4.castShadow = true
        muro4.receiveShadow = true
        world.addBody(muro4)
        myScene.add(muroMesh4)
        boxes.push(muro4)
        boxMeshes.push(muroMesh4)

        // Adding a hitboxes for fences Waterzone
        const muro5 = new CANNON.Body({ mass: 100 })
        muro5.addShape(fbridgeShape)
        const muroMesh5 = new THREE.Mesh(fbridgeGeometry, material)
        muro5.position.set(-35, 6, -1)
        muro5.quaternion.setFromEuler(0, -Math.PI / 0.97, 0)
        muro5.castShadow = true
        muro5.receiveShadow = true
        world.addBody(muro5)
        myScene.add(muroMesh5)
        boxes.push(muro5)
        boxMeshes.push(muroMesh5)

        const muro6 = new CANNON.Body({ mass: 100 })
        muro6.addShape(fbridgeShape)
        const muroMesh6 = new THREE.Mesh(fbridgeGeometry, material)
        muro6.position.set(-35, 6, -8.2)
        muro6.quaternion.setFromEuler(0, -Math.PI / 0.97, 0)
        muro6.castShadow = true
        muro6.receiveShadow = true
        world.addBody(muro6)
        myScene.add(muroMesh6)
        boxes.push(muro6)
        boxMeshes.push(muroMesh6)

        // Adding a hitboxes for fence Cinema Zone 
        const muro7 = new CANNON.Body({ mass: 100 }) 
        muro7.addShape(fenceShape) 
        const muroMesh7 = new THREE.Mesh(fenceGeometry, material) 
        muro7.position.set(4, 6, -20) 
        muro7.quaternion.setFromEuler(0, -Math.PI / 2, 0) 
        muro7.castShadow = true 
        muro7.receiveShadow = true 
        world.addBody(muro7) 
        myScene.add(muroMesh7) 
        boxes.push(muro7) 
        boxMeshes.push(muroMesh7) 
 
        const muro8 = new CANNON.Body({ mass: 100 }) 
        muro8.addShape(fenceShape) 
        const muroMesh8 = new THREE.Mesh(fenceGeometry, material) 
        muro8.position.set(-4.5, 6, -20) 
        muro8.quaternion.setFromEuler(0, -Math.PI / 2, 0) 
        muro8.castShadow = true 
        muro8.receiveShadow = true 
        world.addBody(muro8) 
        myScene.add(muroMesh8) 
        boxes.push(muro8) 
        boxMeshes.push(muroMesh8) 
 
        //Trasversal walls in cinema zone 
        const cinema = new CANNON.Vec3(8, 4, 1) 
        const cinemaShape = new CANNON.Box(cinema) 
        const cinemaGeometry = new THREE.BoxBufferGeometry(cinema.x *2 , cinema.y *2, cinema.z *2) 
 
        const muro9 = new CANNON.Body({ mass: 100 }) 
        muro9.addShape(cinemaShape) 
        const muroMesh9 = new THREE.Mesh(cinemaGeometry, material) 
        muro9.position.set(5.9, 6, -40) 
        muro9.quaternion.setFromEuler(0, -Math.PI / 1.8, 0) 
        muro9.castShadow = true 
        muro9.receiveShadow = true 
        world.addBody(muro9) 
        myScene.add(muroMesh9) 
        boxes.push(muro9) 
        boxMeshes.push(muroMesh9) 
 
        const muro10 = new CANNON.Body({ mass: 100 }) 
        muro10.addShape(cinemaShape) 
        const muroMesh10 = new THREE.Mesh(cinemaGeometry, material) 
        muro10.position.set(-5.9, 6, -40) 
        muro10.quaternion.setFromEuler(0, -Math.PI / 2.4 , 0) 
        muro10.castShadow = true 
        muro10.receiveShadow = true 
        world.addBody(muro10) 
        myScene.add(muroMesh10) 
        boxes.push(muro10) 
        boxMeshes.push(muroMesh10) 
 
 
        const cinema2 = new CANNON.Vec3(7.5, 4, 1) 
        const cinemaShape2 = new CANNON.Box(cinema2) 
        const cinemaGeometry2 = new THREE.BoxBufferGeometry(cinema2.x *2 , cinema2.y *2, cinema2.z *2) 
 
        const muro11 = new CANNON.Body({ mass: 100 }) 
        muro11.addShape(cinemaShape2) 
        const muroMesh11 = new THREE.Mesh(cinemaGeometry2, material) 
        muro11.position.set(0.3, 6, -50) 
        muro11.castShadow = true 
        muro11.receiveShadow = true 
        world.addBody(muro11) 
        myScene.add(muroMesh11) 
        boxes.push(muro11) 
        boxMeshes.push(muroMesh11) 
 
         
        //Trasversal walls in center zone 
        const piazza = new CANNON.Vec3(2, 4, 0.3) 
        const piazzaShape = new CANNON.Box(piazza) 
        const piazzaGeometry = new THREE.BoxBufferGeometry(piazza.x *2 , piazza.y *2, piazza.z *2) 
 
        const piazzatwo = new CANNON.Vec3(3, 4, 0.3) 
        const piazzaShapetwo = new CANNON.Box(piazzatwo) 
        const piazzaGeometrytwo = new THREE.BoxBufferGeometry(piazzatwo.x *2 , piazzatwo.y *2, piazzatwo.z *2) 
 
        const piazza1 = new CANNON.Body({ mass: 100 }) 
        piazza1.addShape(piazzaShape) 
        const piazzaMesh1 = new THREE.Mesh(piazzaGeometry, material) 
        piazza1.position.set(6, 6, -6) 
        piazza1.quaternion.setFromEuler(0, Math.PI / 1.3 , 0) 
        piazza1.castShadow = true 
        piazza1.receiveShadow = true 
        world.addBody(piazza1) 
        myScene.add(piazzaMesh1) 
        boxes.push(piazza1) 
        boxMeshes.push(piazzaMesh1) 
 
        const piazza2 = new CANNON.Body({ mass: 100 }) 
        piazza2.addShape(piazzaShapetwo) 
        const piazzaMesh2 = new THREE.Mesh(piazzaGeometrytwo, material) 
        piazza2.position.set(7.6, 6, 5) 
        piazza2.quaternion.setFromEuler(0, -Math.PI / 1.4 , 0) 
        piazza2.castShadow = true 
        piazza2.receiveShadow = true 
        world.addBody(piazza2)
        myScene.add(piazzaMesh2) 
        boxes.push(piazza2) 
        boxMeshes.push(piazzaMesh2)

        const piazza3 = new CANNON.Body({ mass: 100 }) 
        piazza3.addShape(piazzaShape) 
        const piazzaMesh3 = new THREE.Mesh(piazzaGeometry, material) 
        piazza3.position.set(-6, 6, -6) 
        piazza3.quaternion.setFromEuler(0, -Math.PI / 1.4 , 0) 
        piazza3.castShadow = true 
        piazza3.receiveShadow = true 
        world.addBody(piazza3)
        myScene.add(piazzaMesh3) 
        boxes.push(piazza3) 
        boxMeshes.push(piazzaMesh3)

        const piazzathree = new CANNON.Vec3(4.4, 4, 0.3) 
        const piazzaShapethree = new CANNON.Box(piazzathree) 
        const piazzaGeometrythree = new THREE.BoxBufferGeometry(piazzathree.x *2 , piazzathree.y *2, piazzathree.z *2) 

        const piazza4 = new CANNON.Body({ mass: 100 }) 
        piazza4.addShape(piazzaShapethree) 
        const piazzaMesh4 = new THREE.Mesh(piazzaGeometrythree, material) 
        piazza4.position.set(-5.4, 6, 6) 
        piazza4.quaternion.setFromEuler(0, Math.PI / 1.3 , 0) 
        piazza4.castShadow = true 
        piazza4.receiveShadow = true 
        world.addBody(piazza4)
        myScene.add(piazzaMesh4) 
        boxes.push(piazza4) 
        boxMeshes.push(piazzaMesh4)

        //Quadrato attorno WaterZone
        const muro12 = new CANNON.Body({ mass: 100 })
        muro12.addShape(muroWaterShape)
        const muroMesh12 = new THREE.Mesh(muroWaterGeometry, material)
        muro12.position.set(-64, 6, 3)
        muro12.quaternion.setFromEuler(0, -Math.PI / 1.97, 0)
        muro12.castShadow = true
        muro12.receiveShadow = true
        world.addBody(muro12)
        myScene.add(muroMesh12)
        boxes.push(muro12)
        boxMeshes.push(muroMesh12)

        const muro13 = new CANNON.Body({ mass: 100 })
        muro13.addShape(muroWaterShapeBig)
        const muroMesh13 = new THREE.Mesh(muroWaterGeometryBig, material)
        muro13.position.set(-82, 6, 8.5)
        muro13.quaternion.setFromEuler(0, -Math.PI / 1, 0)
        muro13.castShadow = true
        muro13.receiveShadow = true
        world.addBody(muro13)
        myScene.add(muroMesh13)
        boxes.push(muro13)
        boxMeshes.push(muroMesh13)

        const muro14 = new CANNON.Body({ mass: 100 })
        muro14.addShape(muroWaterShapeBig)
        const muroMesh14 = new THREE.Mesh(muroWaterGeometryBig, material)
        muro14.position.set(-82, 6, -26)
        muro14.quaternion.setFromEuler(0, -Math.PI / 1, 0)
        muro14.castShadow = true
        muro14.receiveShadow = true
        world.addBody(muro14)
        myScene.add(muroMesh14)
        boxes.push(muro14)
        boxMeshes.push(muroMesh14)

        const muro15 = new CANNON.Body({ mass: 100 })
        muro15.addShape(muroWaterShape)
        const muroMesh15 = new THREE.Mesh(muroWaterGeometry, material)
        muro15.position.set(-64, 6, -18)
        muro15.quaternion.setFromEuler(0, -Math.PI / 1.97, 0)
        muro15.castShadow = true
        muro15.receiveShadow = true
        world.addBody(muro15)
        myScene.add(muroMesh15)
        boxes.push(muro15)
        boxMeshes.push(muroMesh15)

        const muro16 = new CANNON.Body({ mass: 100 })
        muro16.addShape(muroWaterShapeBig)
        const muroMesh16 = new THREE.Mesh(muroWaterGeometryBig, material)
        muro16.position.set(-100, 6, -9)
        muro16.quaternion.setFromEuler(0, -Math.PI / 1.97, 0)
        muro16.castShadow = true
        muro16.receiveShadow = true
        world.addBody(muro16)
        myScene.add(muroMesh16)
        boxes.push(muro16)
        boxMeshes.push(muroMesh16)

        //Hitbox casa Waterzone
        const muro17 = new CANNON.Body({ mass: 100 })
        muro17.addShape(casaShape)
        const muroMesh17 = new THREE.Mesh(casaGeometry, material)
        muro17.position.set(-84, 6, -8)
        muro17.quaternion.setFromEuler(0, -Math.PI / 1.97, 0)
        muro17.castShadow = true
        muro17.receiveShadow = true
        world.addBody(muro17)
        myScene.add(muroMesh17)
        boxes.push(muro17)
        boxMeshes.push(muroMesh17)

        //Hitbox casa Waterzone
        const muro18 = new CANNON.Body({ mass: 100 })
        muro18.addShape(alberoShape)
        const muroMesh18 = new THREE.Mesh(alberoGeometry, material)
        muro18.position.set(-94, 6, -15)
        muro18.quaternion.setFromEuler(0, -Math.PI / 1.97, 0)
        muro18.castShadow = true
        muro18.receiveShadow = true
        world.addBody(muro18)
        myScene.add(muroMesh18)
        boxes.push(muro18)
        boxMeshes.push(muroMesh18)

        //LETS PLAY 
        const cuboBlu = new CANNON.Vec3(1, 1, 1) 
        const cuboBluShape = new CANNON.Box(cuboBlu) 
        const cuboBluGeometry = new THREE.BoxBufferGeometry(cuboBlu.x *2 , cuboBlu.y *2, cuboBlu.z *2) 

        for (let i = 0; i < 10; i++) {
        
        const gioco1 = new CANNON.Body({ mass: 1 })
        gioco1.addShape(cuboBluShape)
        const gioco1Mesh = new THREE.Mesh(cuboBluGeometry, materialBlu)

        const x = randomIntFromInterval(5, 10)
        const y = 6
        const z = randomIntFromInterval(40, 60)

        gioco1.position.set(x, y, z)
        muro18.quaternion.setFromEuler(0, -Math.PI / 1.97, 0)
        gioco1.castShadow = true
        gioco1.receiveShadow = true
        world.addBody(gioco1)
        myScene.add(gioco1Mesh)
        boxes.push(gioco1)
        boxMeshes.push(gioco1Mesh)

        }

        const sferaRossaShape = new CANNON.Sphere()
        const sferaRossaGeometry = new THREE.SphereBufferGeometry(1)

        for (let i = 0; i < 10; i++) {

        const sferaRossa = new CANNON.Body({ mass: 3})
        sferaRossa.addShape(sferaRossaShape)
        const sferaRossaMesh = new THREE.Mesh(sferaRossaGeometry, materialRosso)

        const x = randomIntFromInterval(15, 25)
        const y = 6
        const z = randomIntFromInterval(40, 60)

        sferaRossa.position.set(x, y, z)
        sferaRossa.castShadow = true
        sferaRossa.receiveShadow = true
        world.addBody(sferaRossa)
        myScene.add(sferaRossaMesh)
        boxes.push(sferaRossa)
        boxMeshes.push(sferaRossaMesh)

        }

        







        

        /*for (let i = 0; i < 3; i++) {
          const boxBody = new CANNON.Body({ mass: 5 })
          boxBody.addShape(boxShape)
          const boxMesh = new THREE.Mesh(boxGeometry, material)

          const x = (1 - 0.5) * 20
          const y = (2 - 0.5) * 1 + 1
          const z = (3 - 0.5) * 20

          boxBody.position.set(x, y, z)
          boxMesh.position.copy(boxBody.position)

          boxMesh.castShadow = true
          boxMesh.receiveShadow = true

          world.addBody(boxBody)
          myScene.add(boxMesh)
          boxes.push(boxBody)
          boxMeshes.push(boxMesh)
        }*/

        // Add linked boxes
        const size = 0.5
        const mass = 0.3
        const space = 0.1 * size
        const N = 5
        const halfExtents2 = new CANNON.Vec3(size, size, size * 0.1)
        const boxShape2 = new CANNON.Box(halfExtents2)
        const boxGeometry2 = new THREE.BoxBufferGeometry(halfExtents2.x * 2, halfExtents2.y * 2, halfExtents2.z * 2)

        
        let last

        for (let i = 0; i < N; i++) {
          // Make the fist one static to support the others
          const boxBody = new CANNON.Body({ mass: i === 0 ? 0 : mass })
          boxBody.addShape(boxShape2)
          const boxMesh = new THREE.Mesh(boxGeometry2, materialVerde)
          boxBody.position.set(15 , 6, 50)
          boxBody.linearDamping = 0.01
          boxBody.angularDamping = 0.01

          boxMesh.castShadow = true
          boxMesh.receiveShadow = true

          world.addBody(boxBody)
          myScene.add(boxMesh)
          boxes.push(boxBody)
          boxMeshes.push(boxMesh)

          if (i > 0) {
            // Connect the body to the last one
            const constraint1 = new CANNON.PointToPointConstraint(
              boxBody,
              new CANNON.Vec3(-size, size + space, 0),
              last,
              new CANNON.Vec3(-size, -size - space, 0)
            )
            const constranit2 = new CANNON.PointToPointConstraint(
              boxBody,
              new CANNON.Vec3(size, size + space, 0),
              last,
              new CANNON.Vec3(size, -size - space, 0)
            )
            world.addConstraint(constraint1)
            world.addConstraint(constranit2)
          }

          last = boxBody
        }

        // The shooting balls
        const shootVelocity = 15
        const ballShape = new CANNON.Sphere(0.2)
        const ballGeometry = new THREE.SphereBufferGeometry(ballShape.radius, 32, 32)

        // Returns a vector pointing the the diretion the camera is at
        function getShootDirection() {
          const vector = new THREE.Vector3(0, 0, 1)
          vector.unproject(myCam)
          const ray = new THREE.Ray(sphereBody.position, vector.sub(sphereBody.position).normalize())
          return ray.direction
        }

        window.addEventListener('click', (event) => {
          if (!controls.enabled) {
            return
          }

          const ballBody = new CANNON.Body({ mass: 1 })
          ballBody.addShape(ballShape)
          const ballMesh = new THREE.Mesh(ballGeometry, materialPalleGrosse)

          ballMesh.castShadow = true
          ballMesh.receiveShadow = true

          world.addBody(ballBody)
          myScene.add(ballMesh)
          balls.push(ballBody)
          ballMeshes.push(ballMesh)

          const shootDirection = getShootDirection()
          ballBody.velocity.set(
            shootDirection.x * shootVelocity,
            shootDirection.y * shootVelocity,
            shootDirection.z * shootVelocity
          )

          // Move the ball outside the player sphere
          const x = sphereBody.position.x + shootDirection.x * (sphereShape.radius * 1.02 + ballShape.radius)
          const y = sphereBody.position.y + shootDirection.y * (sphereShape.radius * 1.02 + ballShape.radius)
          const z = sphereBody.position.z + shootDirection.z * (sphereShape.radius * 1.02 + ballShape.radius)
          ballBody.position.set(x, y, z)
          ballMesh.position.copy(ballBody.position)
        })
      } 
      

      function initPointerLock() {
        controls = new PointerLockControlsCannon(myCam, sphereBody)
        myScene.add(controls.getObject())

        document.body.addEventListener('click', () => {
          controls.lock()
        })

        controls.addEventListener('lock', () => {
          controls.enabled = true
        })

        controls.addEventListener('unlock', () => {
          controls.enabled = false
        })
      }


      function loadPlane() {
        const loader = new GLTFLoader();
        loader.load('./resources/modelGLTF/TreeWeb.glb', (gltf) => {
          gltf.scene.scale.set(0.8, 0.8, 0.8);
            gltf.scene.traverse(c => {
              c.castShadow = true;

            });
        
        myScene.add(gltf.scene);
        });
      }

      
      //Function that load a text in the WorkInProgress Zone
      function loadWorkingZoneText(modelPath, x, y, z, modelScale) {
        const loader = new GLTFLoader();
        loader.load(modelPath, (gltf) => {
        const model = gltf.scene;
        model.scale.set(modelScale, modelScale, modelScale);
        model.rotation.set(0,4.7,0);
        model.position.set(x, y, z);
        model.traverse(c => {
          c.castShadow = true;
        });

        myScene.add(model);
        const m = new THREE.AnimationMixer(model);
        mixers.push(m);
        const clips = gltf.animations;
        clips.forEach(function(clip){
          const action = m.clipAction(clip);
          action.play();
        });
        });
      }

      //Function that loads an animated model from blender
      function loadAnimatedModelFromBlender(modelPath, x, y, z, modelScale) {
        const loader = new GLTFLoader();
        loader.load(modelPath, (gltf) => {
          const model = gltf.scene;
          model.scale.set(modelScale, modelScale, modelScale);
          model.position.set(x, y, z);
          model.traverse(c => {
              c.castShadow = true;
          });

        myScene.add(model);
        const m = new THREE.AnimationMixer(model);
        mixers.push(m);
        const clips = gltf.animations;
        clips.forEach(function(clip){
          const action = m.clipAction(clip);
          action.play();
        });
        });
      }

      //Function that loads an animated model from blender with rotation
      function loadAnimatedModelFromBlenderWithRotation(modelPath, x, y, z, modelScale, rotation) {
        const loader = new GLTFLoader();
        loader.load(modelPath, (gltf) => {
          const model = gltf.scene;
          model.scale.set(modelScale, modelScale, modelScale);
          model.position.set(x, y, z);
          model.rotation.set(0, rotation, 0);
          model.traverse(c => {
              c.castShadow = true;
          });

        myScene.add(model);
        const m = new THREE.AnimationMixer(model);
        mixers.push(m);
        const clips = gltf.animations;
        clips.forEach(function(clip){
          const action = m.clipAction(clip);
          action.play();
        });
        });
      }

      function randomIntFromInterval(min, max) { 
        return Math.floor(Math.random() * (max - min + 1) + min)
      }

			function onWindowResize() {

				myCam.aspect = window.innerWidth / window.innerHeight;
				myCam.updateProjectionMatrix();

				myRenderer.setSize( window.innerWidth, window.innerHeight );

			}

			function animate() {

        NPCOctahedronMesh1.rotation.y +=0.017;         
        NPCOctahedronMesh2.rotation.y +=0.017;
        NPCOctahedronMesh3.rotation.y +=0.017;
        NPCOctahedronMesh4.rotation.y +=0.017;
        NPCOctahedronMesh5.rotation.y +=0.017;

        const time = performance.now() / 1000;
        const dt = time - lastCallTime;
        lastCallTime = time;

        if (controls.enabled) {
          world.step(timeStep, dt)

          // Update ball positions
          for (let i = 0; i < balls.length; i++) {
            ballMeshes[i].position.copy(balls[i].position)
            ballMeshes[i].quaternion.copy(balls[i].quaternion)
          }

          // Update box positions
          for (let i = 0; i < boxes.length; i++) {
            boxMeshes[i].position.copy(boxes[i].position)
            boxMeshes[i].quaternion.copy(boxes[i].quaternion)
          }
        }

        controls.update(dt);
        stats.update();

        if (mixers) {
          mixers.map (m => m.update(dt));
        };      
				myRenderer.render( myScene, myCam );
        myRenderer.setAnimationLoop(animate);

			}