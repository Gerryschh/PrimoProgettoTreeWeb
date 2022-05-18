import * as THREE from 'https://unpkg.com/three@0.122.0/build/three.module.js'

import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.122.0/examples/jsm/loaders/FBXLoader.js';
import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.122.0/examples/jsm/loaders/GLTFLoader.js';
import {OctahedronGeometry} from 'https://cdn.jsdelivr.net/npm/three@0.122.0/src/geometries/OctahedronGeometry.js';
import {MeshNormalMaterial} from 'https://cdn.jsdelivr.net/npm/three@0.122.0/src/materials/MeshNormalMaterial.js';
import {OBJLoader} from 'https://cdn.jsdelivr.net/npm/three@0.122.0/examples/jsm/loaders/OBJLoader.js';
import {PointerLockControls} from 'https://cdn.jsdelivr.net/npm/three@0.122.0/examples/jsm/controls/PointerLockControls.js';
import { VRButton } from 'https://cdn.jsdelivr.net/npm/three@0.122.0/examples/jsm/webxr/VRButton.js';
import {XRControllerModelFactory} from 'https://cdn.jsdelivr.net/npm/three@0.122.0/examples/jsm/webxr/XRControllerModelFactory.js';
import {XRHandModelFactory} from 'https://cdn.jsdelivr.net/npm/three@0.122.0/examples/jsm/webxr/XRHandModelFactory.js';

import * as CANNON from './dist/cannon-es.js';
import Stats from 'https://unpkg.com/three@0.122.0/examples/jsm/libs/stats.module.js';
import { PointerLockControlsCannon } from './js/PointerLockControlsCannon.js';


let myCam, myScene, myRenderer, stats;

      var myRay = new THREE.Raycaster();
      var mouse = new THREE.Vector2();
      let material = new THREE.MeshPhongMaterial({
        color : 0xffffff,
        opacity: 0,
        transparent: true,
      });
      let materialPalleGrosse = new THREE.MeshBasicMaterial();
      let hand1, hand2;
      let controller1, controller2;
      let controllerGrip1, controllerGrip2;
			let intersectMeshes = [];
      let mixers = [];
      let NPCOctahedronMesh1, NPCOctahedronMesh2, NPCOctahedronMesh3, NPCOctahedronMesh4;

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
      loadWorkingZoneText('./resources/modelGLTF/WorkText.gltf', 111, 4.4, -36.6, 8.8);
      loadAnimatedModelFromBlender('/resources/animals/farfallaAnimated.gltf', -6.6, 1.1, -11.1, 0.11);
      loadAnimatedModelFromBlender('/resources/animals/farfallaAnimated.gltf', 8.8, 1.1, -55.5, 0.11);
      loadAnimatedModelFromBlender('./resources/animals/bee1.gltf', 8.8, 1.1, -55.5, 0.11);
      loadAnimatedModelFromBlender('./resources/animals/bee3.gltf', 8.8, 1.1, -51.1, 0.11);
      loadAnimatedModelFromBlender('/resources/animals/farfallaAnimated.gltf', -6.66, 1.1, -66.6, 0.11);
      loadAnimatedModelFromBlender('./resources/animals/bee1.gltf', 6.66, 1.66, -38.8, 0.077);
      loadAnimatedModelFromBlender('./resources/animals/bee3.gltf', 6.66, 1.66, -38.8, 0.077);

      loadModelEmptyZ();
      loadModelWaterZ();
      loadModelCenterZ();
      loadModelCinemaZ();

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
        const NPCOctahedronGeometry = new THREE.OctahedronGeometry(1.7, 0);
        const NPCOctahedronMaterial = new THREE.MeshNormalMaterial ({color: 0x00ff00});
        NPCOctahedronMesh1 = new THREE.Mesh( NPCOctahedronGeometry, NPCOctahedronMaterial);
        NPCOctahedronMesh2 = new THREE.Mesh( NPCOctahedronGeometry, NPCOctahedronMaterial);
        NPCOctahedronMesh3 = new THREE.Mesh( NPCOctahedronGeometry, NPCOctahedronMaterial);
        NPCOctahedronMesh4 = new THREE.Mesh( NPCOctahedronGeometry, NPCOctahedronMaterial);
        NPCOctahedronMesh1.position.set(-6, 26, 107);
        NPCOctahedronMesh2.position.set(110, 26, 350);
        NPCOctahedronMesh3.position.set(-870, 26, -100);
        NPCOctahedronMesh4.position.set(21, 32, -540);
        myScene.add(NPCOctahedronMesh1);
        myScene.add(NPCOctahedronMesh2);
        myScene.add(NPCOctahedronMesh3);
        myScene.add(NPCOctahedronMesh4);

        //Loading cube with a video playing on it (no audio)
        const video = document.getElementById('video');
        const textureVideo = new THREE.VideoTexture(video);
        const videoMaterial = new THREE.MeshBasicMaterial ({ map : textureVideo});
        const cubo = new THREE.BoxGeometry(1920/(1.2), 1080/(1.2), 1);
        const mesh = new THREE.Mesh( cubo, videoMaterial);
        mesh.position.set(-100, 600, -3000);
        myScene.add(mesh);
        intersectMeshes.push(mesh);

        //Loading lights
        const ambientLight = new THREE.AmbientLight( 0xffffff, 1 );
        myScene.add(ambientLight);

        const pointLight = new THREE.PointLight( 0xffffff, 1.1 );
        pointLight.position.set( 0, 120, 0 );
        myScene.add(pointLight);
/*
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
*/
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

        //try
        const geometry2 = new THREE.BoxGeometry( 1, 1, 1 );
        const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
        const cube = new THREE.Mesh( geometry2, material );
        cube.position.set(0,1,0);
        myScene.add( cube );
        intersectMeshes.push(cube);
        
        document.addEventListener( 'mousedown', function( event ) {
    
          var rect = myRenderer.domElement.getBoundingClientRect();
         mouse.x = ( ( event.clientX - rect.left ) / ( rect.width - rect.left ) ) * 2 - 1;
         mouse.y = - ( ( event.clientY - rect.top ) / ( rect.bottom - rect.top) ) * 2 + 1;
           
           myRay.setFromCamera( mouse, myCam );
            
             var intersects = myRay.intersectObjects( intersectMeshes );
         
             if ( intersects.length > 0 ) {
                 
                 alert("hit");
                 
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
        const radius = 2
        sphereShape = new CANNON.Sphere(radius)
        sphereBody = new CANNON.Body({ mass: 5, material: physicsMaterial })
        sphereBody.addShape(sphereShape)
        sphereBody.position.set(0, 2, 0)
        sphereBody.linearDamping = 0.9
        world.addBody(sphereBody)

        // Create the ground plane
        const groundShape = new CANNON.Plane()
        const groundBody = new CANNON.Body({ mass: 0, material: physicsMaterial })
        groundBody.addShape(groundShape)
        groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
        world.addBody(groundBody)

        // Add boxes both in cannon.js and three.js
        const halfExtents = new CANNON.Vec3(11, 5, 0.5)
        const boxShape = new CANNON.Box(halfExtents)
        const boxGeometry = new THREE.BoxBufferGeometry(halfExtents.x *2 , halfExtents.y *2, halfExtents.z *2)

        // Adding a hitboxes for fences WORKSITE
        const muro1 = new CANNON.Body({ mass: 50 })
        muro1.addShape(boxShape)
        const muroMesh = new THREE.Mesh(boxGeometry, material)
        muro1.position.set(20, 6, 3.6)
        muro1.rotation = 32
        muro1.castShadow = true;
        muro1.receiveShadow = true;
        world.addBody(muro1)
        myScene.add(muroMesh)
        boxes.push(muro1)
        boxMeshes.push(muroMesh)

        const muro2 = new CANNON.Body({ mass: 50 })
        muro2.addShape(boxShape)
        const muroMesh2 = new THREE.Mesh(boxGeometry, material)
        muro2.position.set(20, 6, -4)
        muro2.rotation = 32
        muro2.castShadow = true;
        muro2.receiveShadow = true;
        world.addBody(muro2)
        myScene.add(muroMesh2)
        boxes.push(muro2)
        boxMeshes.push(muroMesh2)

        
        // Adding invisible boxes
        /*const muro = new CANNON.Body({ mass: 50 })
        muro.addShape(boxShape)
        const muroMesh = new THREE.Mesh(boxGeometry, material)
        muro.position.set(2, 0, 3)
        muro.castShadow = true;
        muro.receiveShadow = true;
        world.addBody(muro)
        myScene.add(muroMesh)
        boxes.push(muro)
        boxMeshes.push(muroMesh)*/

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
          const boxMesh = new THREE.Mesh(boxGeometry2, material)
          boxBody.position.set(60,10,20)
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

      //Function that loads one character in the EmptyZone
      function loadModelEmptyZ() {
        const loader = new FBXLoader();
          loader.setPath('./resources/character/');
          loader.load('jolleen.fbx', (fbx) => {
            fbx.scale.setScalar(0.014);
            fbx.rotation.set(0,9.5,0);
            fbx.position.set(12.2, 0, 38.8);
            fbx.traverse(c => {
              c.castShadow = true;
        
            });

        const anim = new FBXLoader();
        anim.setPath('./resources/actions/idleActions/');
        anim.load('SGJolleen.fbx', (anim) => {
          const m = new THREE.AnimationMixer(fbx);
          mixers.push(m);
          const idle = m.clipAction(anim.animations[0]);
          idle.play();
          });
        myScene.add(fbx);
        });
      }

      //Function that loads one character in the WaterZone
      function loadModelWaterZ() {
        const loader = new FBXLoader();
          loader.setPath('./resources/character/');
          loader.load('Doozy.fbx', (fbx) => {
            fbx.scale.setScalar(0.015);
            fbx.rotation.set(0,2,22,0);
            fbx.position.set(-96.6,0,-11.1);
            fbx.traverse(c => {
              c.castShadow = true;
              
            });
      
            const anim = new FBXLoader();
            anim.setPath('./resources/actions/idleActions/');
            anim.load('WavingDoozy.fbx', (anim) => {
              const m = new THREE.AnimationMixer(fbx);
              mixers.push(m);
              const idle = m.clipAction(anim.animations[0]);
              idle.play();
            });
            myScene.add(fbx);
          });
      }

      //Function that loads one character in the CenterZone
      function loadModelCenterZ() {
        const loader = new FBXLoader();
          loader.setPath('./resources/character/');
          loader.load('Amy.fbx', (fbx) => {
            fbx.scale.setScalar(0.016);
            fbx.rotation.set(0,1.05,0);
            fbx.position.set(-0.66,0,11.88);
            fbx.traverse(c => {
              c.castShadow = true;
              
            });
      
            const anim = new FBXLoader();
            anim.setPath('./resources/actions/idleActions/');
            anim.load('WavingAmy.fbx', (anim) => {
              const m = new THREE.AnimationMixer(fbx);
              mixers.push(m);
              const idle = m.clipAction(anim.animations[0]);
              idle.play();
            });
            myScene.add(fbx);
          });
      }

      //Function that loads one character in the CinemaZone
      function loadModelCinemaZ() {
        const loader = new FBXLoader();
          loader.setPath('./resources/character/');
          loader.load('aj.fbx', (fbx) => {
            fbx.scale.setScalar(0.016);
            fbx.rotation.set(0,2.77,0);
            fbx.position.set(2.22,0,-60);
            fbx.traverse(c => {
              c.castShadow = true;
              
            });
      
            const anim = new FBXLoader();
            anim.setPath('./resources/actions/idleActions/');
            anim.load('PointingAJ.fbx', (anim) => {
              const m = new THREE.AnimationMixer(fbx);
              mixers.push(m);
              const idle = m.clipAction(anim.animations[0]);
              idle.play();
            });
            myScene.add(fbx);
          });
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