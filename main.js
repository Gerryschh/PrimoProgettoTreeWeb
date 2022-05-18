import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.127.0/build/three.module.js';

import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.127.0/examples/jsm/loaders/FBXLoader.js';
import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.127.0/examples/jsm/loaders/GLTFLoader.js';
import {OctahedronGeometry} from 'https://cdn.jsdelivr.net/npm/three@0.127.0/src/geometries/OctahedronGeometry.js';
import {MeshNormalMaterial} from 'https://cdn.jsdelivr.net/npm/three@0.127.0/src/materials/MeshNormalMaterial.js';
import {OBJLoader} from 'https://cdn.jsdelivr.net/npm/three@0.127.0/examples/jsm/loaders/OBJLoader.js';
import {PointerLockControls} from 'https://cdn.jsdelivr.net/npm/three@0.127.0/examples/jsm/controls/PointerLockControls.js';
import { VRButton } from 'https://cdn.jsdelivr.net/npm/three@0.127.0/examples/jsm/webxr/VRButton.js';
import {XRControllerModelFactory} from 'https://cdn.jsdelivr.net/npm/three@0.127.0/examples/jsm/webxr/XRControllerModelFactory.js';
import {XRHandModelFactory} from 'https://cdn.jsdelivr.net/npm/three@0.127.0/examples/jsm/webxr/XRHandModelFactory.js';

let myCam, myScene, myRenderer, fpsControls, clock;

      var myRay = new THREE.Raycaster();
      var mouse = new THREE.Vector2();
      let hand1, hand2;
      let controller1, controller2;
      let controllerGrip1, controllerGrip2;
			let intersectMeshes = [];
      let keyboard = [];
      let mixers = [];
      let NPCOctahedronMesh1, NPCOctahedronMesh2, NPCOctahedronMesh3, NPCOctahedronMesh4;

			init();
			animate();
      loadPlane();
      loadWorkingZoneText('./resources/modelGLTF/WorkText.gltf', 1000, 40, -330, 80);
      loadAnimatedModelFromBlender('/resources/animals/farfallaAnimated.gltf', -60, 10, -100, 1);
      loadAnimatedModelFromBlender('/resources/animals/farfallaAnimated.gltf', 80, 10, -500, 1);
      loadAnimatedModelFromBlender('./resources/animals/bee1.gltf', 80, 10, -500, 1);
      loadAnimatedModelFromBlender('./resources/animals/bee3.gltf', 80, 10, -460, 1);
      loadAnimatedModelFromBlender('/resources/animals/farfallaAnimated.gltf', -60, 10, -600, 1);
      loadAnimatedModelFromBlender('./resources/animals/bee1.gltf', 60, 15, -350, 0.7);
      loadAnimatedModelFromBlender('./resources/animals/bee3.gltf', 60, 15, -350, 0.7);

      loadModelEmptyZ();
      loadModelWaterZ();
      loadModelCenterZ();
      loadModelCinemaZ();

			function init() {

        //Initializing Camera
				myCam = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
			  myCam.position.set(50,19,25);

        //Initializing Scene and Fog
				myScene = new THREE.Scene();
				myScene.fog = new THREE.Fog( 0xffffff, 0, 7500 );

        //Initializing Renderer
				myRenderer = new THREE.WebGLRenderer( { antialias: true } );
        myRenderer.outputEncoding = THREE.sRGBEncoding;
        myRenderer.shadowMap.enabled = true;
        myRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
				myRenderer.setPixelRatio( window.devicePixelRatio );
				myRenderer.setSize( window.innerWidth, window.innerHeight );
				document.body.appendChild( myRenderer.domElement );

        //On Window Resize
				window.addEventListener( 'resize', onWindowResize );

        //Initializing Controls
				fpsControls = new PointerLockControls( myCam, document.body );
        clock = new THREE.Clock();
				document.body.addEventListener( 'click', function () {
					fpsControls.lock();
				});
        
        document.addEventListener('keydown', (e) => {
          keyboard[e.key] = true;
        });
        document.addEventListener('keyup', (e) => {
          keyboard[e.key] = false;
        });

				myScene.add(fpsControls.getObject());

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
        const ambientLight = new THREE.AmbientLight( 0xffffff, 0.9 );
        myScene.add(ambientLight);

        const pointLight = new THREE.PointLight( 0xffffff, 0.5 );
        pointLight.position.set( 5, 200, 5 );
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

				//

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

        //try
        const geometry2 = new THREE.BoxGeometry( 10, 10, 10 );
        const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
        const cube = new THREE.Mesh( geometry2, material );
        cube.position.set(0,10,0);
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
      

      function processKeyboard(delta) {
        let speed = 70;
        let actualSpeed = speed * delta; 
        if(keyboard['w']) {
          fpsControls.moveForward(actualSpeed);
        }
        if (keyboard['s']) {
          fpsControls.moveForward(-actualSpeed);
        }
    
        //Up and down movements not used
        /*if (keyboard['q']) {
          fpsControls.getObject().position.y += actualSpeed;
        }
        if(keyboard['e']) {
          fpsControls.getObject().position.y -= actualSpeed;
        }*/

        if(keyboard['a']) {
          fpsControls.moveRight(-actualSpeed);
        }
        if (keyboard['d']) {
          fpsControls.moveRight(actualSpeed);
        }
      }

      function loadPlane() {
        const loader = new GLTFLoader();
        loader.load('./resources/modelGLTF/TreeWeb.glb', (gltf) => {
          gltf.scene.scale.set(9, 9, 9);
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
            fbx.scale.setScalar(0.13);
            fbx.rotation.set(0,9.5,0);
            fbx.position.set(110,0,350);
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
            fbx.scale.setScalar(0.14);
            fbx.rotation.set(0,20,0);
            fbx.position.set(-870,0,-100);
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
            fbx.scale.setScalar(0.15);
            fbx.rotation.set(0,9.5,0);
            fbx.position.set(-6,0,107);
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
            fbx.scale.setScalar(0.15);
            fbx.rotation.set(0,25,0);
            fbx.position.set(20,0,-540);
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

			function animate(event) {

        NPCOctahedronMesh1.rotation.y +=0.017;         
        NPCOctahedronMesh2.rotation.y +=0.017;
        NPCOctahedronMesh3.rotation.y +=0.017;
        NPCOctahedronMesh4.rotation.y +=0.017;

        let delta = clock.getDelta();
        processKeyboard(delta);
        if (mixers) {
          mixers.map (m => m.update(delta));
        };      
				myRenderer.render( myScene, myCam );
        myRenderer.setAnimationLoop(animate);

			}