import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js';
import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/GLTFLoader.js';
import {OctahedronGeometry} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/src/geometries/OctahedronGeometry.js';
import {MeshNormalMaterial} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/src/materials/MeshNormalMaterial.js';
import {OBJLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/OBJLoader.js';
import {PointerLockControls} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/controls/PointerLockControls.js';
import { VRButton } from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/webxr/VRButton.js';


//Main class that instanciate all the other things
class TreeWebGame {
  constructor() {
    this._Initialize();
  }

  _Initialize() {
    this._threejs = new THREE.WebGLRenderer({
      antialias: true,
    });
    this._threejs.outputEncoding = THREE.sRGBEncoding;
    this._threejs.shadowMap.enabled = true;
    this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;
    this._threejs.setPixelRatio(window.devicePixelRatio);
    this._threejs.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(this._threejs.domElement);

    window.addEventListener('resize', () => {
      this._OnWindowResize();
    }, false);

    //Loading Camera
    const fov = 65;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 1;
    const far = 10000.0;
    this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this._camera.position.set(50, 19, 25);

    //Loading controls keys
    this._fpsControls = new PointerLockControls( this._camera, this._threejs.domElement );
    this._clock = new THREE.Clock();
    document.body.addEventListener('click', ()=> {
      this._fpsControls.lock();
    })
    this._keyboard = [];
    document.addEventListener('keydown', (e) => {
      this._keyboard[e.key] = true;
    });
    document.addEventListener('keyup', (e) => {
      this._keyboard[e.key] = false;
    });

    //Loading scene
    this._scene = new THREE.Scene();

    //Loading OctahedronGeometry on NPC
    const NPCOctahedronGeometry = new THREE.OctahedronGeometry(1.7, 0);
    const NPCOctahedronMaterial = new THREE.MeshNormalMaterial ({color: 0x00ff00});
    this.NPCOctahedronMesh1 = new THREE.Mesh( NPCOctahedronGeometry, NPCOctahedronMaterial);
    this.NPCOctahedronMesh2 = new THREE.Mesh( NPCOctahedronGeometry, NPCOctahedronMaterial);
    this.NPCOctahedronMesh3 = new THREE.Mesh( NPCOctahedronGeometry, NPCOctahedronMaterial);
    this.NPCOctahedronMesh4 = new THREE.Mesh( NPCOctahedronGeometry, NPCOctahedronMaterial);
    this.NPCOctahedronMesh1.position.set(-6, 26, 107);
    this.NPCOctahedronMesh2.position.set(110, 26, 350);
    this.NPCOctahedronMesh3.position.set(-970, 26, -100);
    this.NPCOctahedronMesh4.position.set(21, 32, -603);
    this._scene.add(this.NPCOctahedronMesh1);
    this._scene.add(this.NPCOctahedronMesh2);
    this._scene.add(this.NPCOctahedronMesh3);
    this._scene.add(this.NPCOctahedronMesh4);

    //Loading cube with a video playing on it (no audio)
    const video = document.getElementById('video');
    const textureVideo = new THREE.VideoTexture(video);
    const videoMaterial = new THREE.MeshBasicMaterial ({ map : textureVideo});
    const cubo = new THREE.BoxGeometry(1920/(1.2), 1080/(1.2), 1);
    const mesh = new THREE.Mesh( cubo, videoMaterial);
    mesh.position.set(-100, 600, -3000);
    this._scene.add(mesh);

    //Loading lights
    const ambientLight = new THREE.AmbientLight( 0xffffff, 0.2 );
    this._scene.add(ambientLight);

    const pointLight = new THREE.PointLight( 0xffffff, 0.30 );
    this._camera.add(pointLight);
    pointLight.position.set( 5, 5, 5 );
    this._scene.add(this._camera);

    const pointLight1 = new THREE.PointLight( 0xffffff, 0.3 );
    this._camera.add(pointLight1);
    pointLight1.position.set( 100, 100, 600 );
    this._scene.add(this._camera);

    //Creating box for raycasting
    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
    this._cube = new THREE.Mesh( geometry, material );
    this._scene.add( this._cube );

    //VR
    document.body.appendChild( VRButton.createButton( this._threejs ) );
    this._threejs.xr.enabled = true;

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
    this._scene.background = texture;


    this._mixers = [];
    this._previousRAF = null;

    //Loading the plane
    this._LoadPlane();

    //Loading IdleAnimatedModels
    this._LoadStaticModelEmptyZone();
    this._LoadStaticModelWaterZone();
    this._LoadStaticModelCenterZone();
    this._LoadStaticModelCinemaZone();

    //Loading animated bees and butterflies
    this._LoadAnimatedModelFromBlender('/resources/animals/farfallaAnimated.gltf', -60, 10, -100, 1);
    this._LoadAnimatedModelFromBlender('/resources/animals/farfallaAnimated.gltf', 80, 10, -500, 1);
    this._LoadAnimatedModelFromBlender('./resources/animals/bee1.gltf', 80, 10, -500, 1);
    this._LoadAnimatedModelFromBlender('./resources/animals/bee3.gltf', 80, 10, -460, 1);
    this._LoadAnimatedModelFromBlender('/resources/animals/farfallaAnimated.gltf', -60, 10, -600, 1);
    this._LoadAnimatedModelFromBlender('./resources/animals/bee1.gltf', 60, 15, -350, 0.7);
    this._LoadAnimatedModelFromBlender('./resources/animals/bee3.gltf', 60, 15, -350, 0.7);

    //Loading Texts
    this._LoadWorkingZoneText('./resources/modelGLTF/WorkText.gltf', 1000, 40, -330, 80);

    //RAF
    this._RAF();
    this._threejs.setAnimationLoop(this._RAF());
  }

  //FirstPersonMovements Controls Function
  _processKeyboard() {
    let speed = 70;
    let actualSpeed = speed * this._delta; 
    if(this._keyboard['w']) {
      this._fpsControls.moveForward(actualSpeed);
    }
    if (this._keyboard['s']) {
      this._fpsControls.moveForward(-actualSpeed);
    }
    
    //Up and down movements not used
    /*if (this._keyboard['q']) {
      this._fpsControls.getObject().position.y += actualSpeed;
    }
    if(this._keyboard['e']) {
      this._fpsControls.getObject().position.y -= actualSpeed;
    }*/

    if(this._keyboard['a']) {
      this._fpsControls.moveRight(-actualSpeed);
    }
    if (this._keyboard['d']) {
      this._fpsControls.moveRight(actualSpeed);
    }
  }

  //Function that loads the plane done with Blender
  _LoadPlane() {
    const loader = new GLTFLoader();
    loader.load('./resources/modelGLTF/TreeWeb.glb', (gltf) => {
      gltf.scene.scale.set(10, 10, 10);
        gltf.scene.traverse(c => {
            c.castShadow = true;

        });
        
        this._scene.add(gltf.scene);
    });
}

//Function that load a text in the WorkInProgress Zone
_LoadWorkingZoneText(modelPath, x, y, z, modelScale)
{
  const loader = new GLTFLoader();
  loader.load(modelPath, (gltf) => {
    const model = gltf.scene;
    model.scale.set(modelScale, modelScale, modelScale);
    model.rotation.set(0,4.7,0);
    model.position.set(x, y, z);
    model.traverse(c => {
      c.castShadow = true;
    });

    this._scene.add(model);
    const m = new THREE.AnimationMixer(model);
    this._mixers.push(m);
    const clips = gltf.animations;
    clips.forEach(function(clip){
      const action = m.clipAction(clip);
      action.play();
    });
    });
}

//Function that loads an animated model from blender
_LoadAnimatedModelFromBlender(modelPath, x, y, z, modelScale) {
  const loader = new GLTFLoader();
  loader.load(modelPath, (gltf) => {
    const model = gltf.scene;
    model.scale.set(modelScale, modelScale, modelScale);
    model.position.set(x, y, z);
    model.traverse(c => {
      c.castShadow = true;
    });

    this._scene.add(model);
    const m = new THREE.AnimationMixer(model);
    this._mixers.push(m);
    const clips = gltf.animations;
    clips.forEach(function(clip){
      const action = m.clipAction(clip);
      action.play();
    });
    });
  }

//Function that loads one character in the EmptyZone
_LoadStaticModelEmptyZone() {
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
        this._mixers.push(m);
        const idle = m.clipAction(anim.animations[0]);
        idle.play();
      });
      this._scene.add(fbx);
    });
}

//Function that loads one character in the WaterZone
_LoadStaticModelWaterZone() {
  const loader = new FBXLoader();
    loader.setPath('./resources/character/');
    loader.load('Doozy.fbx', (fbx) => {
      fbx.scale.setScalar(0.14);
      fbx.rotation.set(0,20,0);
      fbx.position.set(-970,0,-100);
      fbx.traverse(c => {
        c.castShadow = true;
        
      });

      const anim = new FBXLoader();
      anim.setPath('./resources/actions/idleActions/');
      anim.load('WavingDoozy.fbx', (anim) => {
        const m = new THREE.AnimationMixer(fbx);
        this._mixers.push(m);
        const idle = m.clipAction(anim.animations[0]);
        idle.play();
      });
      this._scene.add(fbx);
    });
}

//Function that loads one character in the CenterZone
_LoadStaticModelCenterZone() {
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
        this._mixers.push(m);
        const idle = m.clipAction(anim.animations[0]);
        idle.play();
      });
      this._scene.add(fbx);
    });
}

//Function that loads one character in the CinemaZone
_LoadStaticModelCinemaZone() {
  const loader = new FBXLoader();
    loader.setPath('./resources/character/');
    loader.load('aj.fbx', (fbx) => {
      fbx.scale.setScalar(0.15);
      fbx.rotation.set(0,25,0);
      fbx.position.set(20,0,-605);
      fbx.traverse(c => {
        c.castShadow = true;
        
      });

      const anim = new FBXLoader();
      anim.setPath('./resources/actions/idleActions/');
      anim.load('PointingAJ.fbx', (anim) => {
        const m = new THREE.AnimationMixer(fbx);
        this._mixers.push(m);
        const idle = m.clipAction(anim.animations[0]);
        idle.play();
      });
      this._scene.add(fbx);
    });
}

  _OnWindowResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this._threejs.setSize(window.innerWidth, window.innerHeight);
  }

  //Request Animation Frame for the renderer
  _RAF() {
    requestAnimationFrame((t) => {
      if (this._previousRAF === null) {
        this._previousRAF = t;
      }

      this._RAF();
      this.NPCOctahedronMesh1.rotation.y +=0.017;         
      this.NPCOctahedronMesh2.rotation.y +=0.017;
      this.NPCOctahedronMesh3.rotation.y +=0.017;
      this.NPCOctahedronMesh4.rotation.y +=0.017;

      this._delta = this._clock.getDelta();
      this._processKeyboard(this._delta);
      
      this._threejs.render(this._scene, this._camera);
      this._Step(t - this._previousRAF);
      this._previousRAF = t;
    });
  }

  _Step(timeElapsed) {
    const timeElapsedS = timeElapsed * 0.001;
    if (this._mixers) {
      this._mixers.map(m => m.update(timeElapsedS));
    }
  }
}


let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
  _APP = new TreeWebGame();
});