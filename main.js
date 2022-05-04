import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js';
import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/GLTFLoader.js';
import {OctahedronGeometry} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/src/geometries/OctahedronGeometry.js';
import {MeshNormalMaterial} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/src/materials/MeshNormalMaterial.js';
import {OBJLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/OBJLoader.js';

class BasicCharacterControllerProxy {
  constructor(animations) {
    this._animations = animations;
  }

  get animations() {
    return this._animations;
  }
};



class BasicCharacterController {
  constructor(params) {
    this._Init(params);
  }

  _Init(params) {
    this._params = params;
    this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
    this._acceleration = new THREE.Vector3(1, 0.25, 50.0);
    this._velocity = new THREE.Vector3(0, 0, 0);
    this._position = new THREE.Vector3();

    this._animations = {};
    this._input = new BasicCharacterControllerInput();
    this._stateMachine = new CharacterFSM(
        new BasicCharacterControllerProxy(this._animations));

    this._LoadModels();
  }

  //It loads the character, its movements and its animation
  _LoadModels() {
    const loader = new FBXLoader();
    loader.setPath('./resources/character/');
    loader.load('ty.fbx', (fbx) => {
      fbx.scale.setScalar(0.1);
      fbx.traverse(c => {
        c.castShadow = true;
      });

      this._target = fbx;
      this._params.scene.add(this._target);

      this._mixer = new THREE.AnimationMixer(this._target);

      this._manager = new THREE.LoadingManager();
      this._manager.onLoad = () => {
        this._stateMachine.SetState('idle');
      };

      const _OnLoad = (animName, anim) => {
        const clip = anim.animations[0];
        const action = this._mixer.clipAction(clip);
  
        this._animations[animName] = {
          clip: clip,
          action: action,
        };
      };

      const loader = new FBXLoader(this._manager);
      loader.setPath('./resources/actions/');
      loader.load('walk.fbx', (a) => { _OnLoad('walk', a); });
      loader.load('run.fbx', (a) => { _OnLoad('run', a); });
      loader.load('idle.fbx', (a) => { _OnLoad('idle', a); });
      //loader.load('dance.fbx', (a) => { _OnLoad('dance', a); }); //Dance state removed for a bug
    });
  }

  get Position() {
    return this._position;
  }

  get Rotation() {
    if (!this._target) {
      return new THREE.Quaternion();
    }
    return this._target.quaternion;
  }

  Update(timeInSeconds) {
    if (!this._stateMachine._currentState) {
      return;
    }

    this._stateMachine.Update(timeInSeconds, this._input);

    const velocity = this._velocity;
    const frameDecceleration = new THREE.Vector3(
        velocity.x * this._decceleration.x,
        velocity.y * this._decceleration.y,
        velocity.z * this._decceleration.z
    );
    frameDecceleration.multiplyScalar(timeInSeconds);
    frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(
        Math.abs(frameDecceleration.z), Math.abs(velocity.z));

    velocity.add(frameDecceleration);

    const controlObject = this._target;
    const _Q = new THREE.Quaternion();
    const _A = new THREE.Vector3();
    const _R = controlObject.quaternion.clone();

    const acc = this._acceleration.clone();
    if (this._input._keys.shift) {
      acc.multiplyScalar(5.0);
    }

    if (this._stateMachine._currentState.Name == 'dance') {
      acc.multiplyScalar(0.0);
    }

    if (this._input._keys.forward) {
      velocity.z += acc.z * timeInSeconds;
    }
    if (this._input._keys.backward) {
      velocity.z -= acc.z * timeInSeconds;
    }
    if (this._input._keys.left) {
      _A.set(0, 1, 0);
      _Q.setFromAxisAngle(_A, 4.0 * Math.PI * timeInSeconds * this._acceleration.y);
      _R.multiply(_Q);
    }
    if (this._input._keys.right) {
      _A.set(0, 1, 0);
      _Q.setFromAxisAngle(_A, 4.0 * -Math.PI * timeInSeconds * this._acceleration.y);
      _R.multiply(_Q);
    }

    controlObject.quaternion.copy(_R);

    const oldPosition = new THREE.Vector3();
    oldPosition.copy(controlObject.position);

    const forward = new THREE.Vector3(0, 0, 1);
    forward.applyQuaternion(controlObject.quaternion);
    forward.normalize();

    const sideways = new THREE.Vector3(1, 0, 0);
    sideways.applyQuaternion(controlObject.quaternion);
    sideways.normalize();

    sideways.multiplyScalar(velocity.x * timeInSeconds);
    forward.multiplyScalar(velocity.z * timeInSeconds);

    controlObject.position.add(forward);
    controlObject.position.add(sideways);

    this._position.copy(controlObject.position);

    if (this._mixer) {
      this._mixer.update(timeInSeconds);
    }
  }
};

//
class BasicCharacterControllerInput {
  constructor() {
    this._Init();    
  }

  _Init() {
    this._keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      space: false,
      shift: false,
    };
    document.addEventListener('keydown', (e) => this._onKeyDown(e), false);
    document.addEventListener('keyup', (e) => this._onKeyUp(e), false);
  }

  _onKeyDown(event) {
    switch (event.keyCode) {
      case 87: // w
        this._keys.forward = true;
        break;
      case 65: // a
        this._keys.left = true;
        break;
      case 83: // s
        this._keys.backward = true;
        break;
      case 68: // d
        this._keys.right = true;
        break;
      case 32: // SPACE
        this._keys.space = true;
        break;
      case 16: // SHIFT
        this._keys.shift = true;
        break;
    }
  }

  _onKeyUp(event) {
    switch(event.keyCode) {
      case 87: // w
        this._keys.forward = false;
        break;
      case 65: // a
        this._keys.left = false;
        break;
      case 83: // s
        this._keys.backward = false;
        break;
      case 68: // d
        this._keys.right = false;
        break;
      case 32: // SPACE
        this._keys.space = false;
        break;
      case 16: // SHIFT
        this._keys.shift = false;
        break;
    }
  }
};

//Declaring stateMachine for character's states
class FiniteStateMachine {
  constructor() {
    this._states = {};
    this._currentState = null;
  }

  _AddState(name, type) {
    this._states[name] = type;
  }

  SetState(name) {
    const prevState = this._currentState;
    
    if (prevState) {
      if (prevState.Name == name) {
        return;
      }
      prevState.Exit();
    }

    const state = new this._states[name](this);

    this._currentState = state;
    state.Enter(prevState);
  }

  Update(timeElapsed, input) {
    if (this._currentState) {
      this._currentState.Update(timeElapsed, input);
    }
  }
};


class CharacterFSM extends FiniteStateMachine {
  constructor(proxy) {
    super();
    this._proxy = proxy;
    this._Init();
  }

  _Init() {
    this._AddState('idle', IdleState);
    this._AddState('walk', WalkState);
    this._AddState('run', RunState);
    //this._AddState('dance', DanceState); //Dance state removed for a bug
  }
};

//Defining state class for Character's states
class State {
  constructor(parent) {
    this._parent = parent;
  }

  Enter() {}
  Exit() {}
  Update() {}
};

//DanceState (When the character is dancing) //Dance state removed for a bug
/*class DanceState extends State {
  constructor(parent) {
    super(parent);

    this._FinishedCallback = () => {
      this._Finished();
    }
  }

  get Name() {
    return 'dance';
  }

  Enter(prevState) {
    const curAction = this._parent._proxy._animations['dance'].action;
    const mixer = curAction.getMixer();
    mixer.addEventListener('finished', this._FinishedCallback);

    if (prevState) {
      const prevAction = this._parent._proxy._animations[prevState.Name].action;

      curAction.reset();  
      curAction.setLoop(THREE.LoopOnce, 1);
      curAction.clampWhenFinished = true;
      curAction.crossFadeFrom(prevAction, 0.2, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  _Finished() {
    this._Cleanup();
    this._parent.SetState('idle');
  }

  _Cleanup() {
    const action = this._parent._proxy._animations['dance'].action;
    
    action.getMixer().removeEventListener('finished', this._CleanupCallback);
  }

  Exit() {
    this._Cleanup();
  }

  Update(_) {
  }
};*/

//WalkState(When the character is walking)
class WalkState extends State {
  constructor(parent) {
    super(parent);
  }

  get Name() {
    return 'walk';
  }

  Enter(prevState) {
    const curAction = this._parent._proxy._animations['walk'].action;
    if (prevState) {
      const prevAction = this._parent._proxy._animations[prevState.Name].action;

      curAction.enabled = true;

      if (prevState.Name == 'run') {
        const ratio = curAction.getClip().duration / prevAction.getClip().duration;
        curAction.time = prevAction.time * ratio;
      } else {
        curAction.time = 0.0;
        curAction.setEffectiveTimeScale(1.0);
        curAction.setEffectiveWeight(1.0);
      }

      curAction.crossFadeFrom(prevAction, 0.5, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  Exit() {
  }

  Update(timeElapsed, input) {
    if (input._keys.forward || input._keys.backward) {
      if (input._keys.shift) {
        this._parent.SetState('run');
      }
      return;
    }

    this._parent.SetState('idle');
  }
};

//RunState(WHen the character is running)
class RunState extends State {
  constructor(parent) {
    super(parent);
  }

  get Name() {
    return 'run';
  }

  Enter(prevState) {
    const curAction = this._parent._proxy._animations['run'].action;
    if (prevState) {
      const prevAction = this._parent._proxy._animations[prevState.Name].action;

      curAction.enabled = true;

      if (prevState.Name == 'walk') {
        const ratio = curAction.getClip().duration / prevAction.getClip().duration;
        curAction.time = prevAction.time * ratio;
      } else {
        curAction.time = 0.0;
        curAction.setEffectiveTimeScale(1.0);
        curAction.setEffectiveWeight(1.0);
      }

      curAction.crossFadeFrom(prevAction, 0.5, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  Exit() {
  }

  Update(timeElapsed, input) {
    if (input._keys.forward || input._keys.backward) {
      if (!input._keys.shift) {
        this._parent.SetState('walk');
      }
      return;
    }

    this._parent.SetState('idle');
  }
};

//IdleState(When the character is doing nothing)
class IdleState extends State {
  constructor(parent) {
    super(parent);
  }

  get Name() {
    return 'idle';
  }

  Enter(prevState) {
    const idleAction = this._parent._proxy._animations['idle'].action;
    if (prevState) {
      const prevAction = this._parent._proxy._animations[prevState.Name].action;
      idleAction.time = 0.0;
      idleAction.enabled = true;
      idleAction.setEffectiveTimeScale(1.0);
      idleAction.setEffectiveWeight(1.0);
      idleAction.crossFadeFrom(prevAction, 0.5, true);
      idleAction.play();
    } else {
      idleAction.play();
    }
  }

  Exit() {
  }

  Update(_, input) {
    if (input._keys.forward || input._keys.backward) {
      this._parent.SetState('walk');
    } /*else if (input._keys.space) {
      this._parent.SetState('dance');
    }*/ //Dance state removed for a bug
  }
};

//Defining ThirdPersonCamera for our character that follows what the player is looking at
class ThirdPersonCamera {
  constructor(params) {
    this._params = params;
    this._camera = params.camera;

    this._currentPosition = new THREE.Vector3();
    this._currentLookat = new THREE.Vector3();
  }

  _CalculateIdealOffset() {
    const idealOffset = new THREE.Vector3(-15, 20, -30);
    idealOffset.applyQuaternion(this._params.target.Rotation);
    idealOffset.add(this._params.target.Position);
    return idealOffset;
  }

  _CalculateIdealLookat() {
    const idealLookat = new THREE.Vector3(0, 10, 50);
    idealLookat.applyQuaternion(this._params.target.Rotation);
    idealLookat.add(this._params.target.Position);
    return idealLookat;
  }

  Update(timeElapsed) {
    const idealOffset = this._CalculateIdealOffset();
    const idealLookat = this._CalculateIdealLookat();
  
    const t = 1.0 - Math.pow(0.001, timeElapsed);

    this._currentPosition.lerp(idealOffset, t);
    this._currentLookat.lerp(idealLookat, t);
    this._camera.position.copy(this._currentPosition);
    this._camera.lookAt(this._currentLookat);
  }
}

//Main class that instanciate all the other things
class ThirdPersonCameraDemo {
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
    const fov = 60;
    const aspect = 1920 / 1080;
    const near = 1.0;
    const far = 10000.0;
    this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this._camera.position.set(50, 10, 25);

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

    //Functions
    this._LoadModel();
    this._LoadAnimatedModel();
    this._LoadStaticModelEmptyZone();
    this._LoadStaticModelWaterZone();
    this._LoadStaticModelCenterZone();
    this._LoadStaticModelCinemaZone();
    this._LoadAnimatedModelFromBlender('/resources/animals/farfallaAnimated.gltf', -60, 10, -100, 1);
    this._LoadAnimatedModelFromBlender('./resources/animals/bee1.gltf', 60, 15, -350, 0.7);
    this._LoadAnimatedModelFromBlender('./resources/animals/bee2.gltf', 60, 15, -350, 0.7);
    this._LoadAnimatedModelFromBlender('./resources/animals/bee3.gltf', 60, 15, -350, 0.7);
    this._LoadWorkingZoneText('./resources/modelGLTF/WorkText.gltf', 1000, 40, -330, 80);
    this._RAF();
  }

  //Function that loads the plane done with Blender
  _LoadModel() {
    const loader = new GLTFLoader();
    loader.load('./resources/modelGLTF/TreeWeb.glb', (gltf) => {
      gltf.scene.scale.set(10, 10, 10);
        gltf.scene.traverse(c => {
            c.castShadow = true;

        });
        
        this._scene.add(gltf.scene);
    });
}

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



//Function that loads the Main Character with its camera and controls
  _LoadAnimatedModel() {
    const params = {
      camera: this._camera,
      scene: this._scene,
    }
    this._controls = new BasicCharacterController(params);

    this._thirdPersonCamera = new ThirdPersonCamera({
      camera: this._camera,
      target: this._controls,
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
    if (this._controls) {
      this._controls.Update(timeElapsedS);
    }
    this._thirdPersonCamera.Update(timeElapsedS);
  }
}


let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
  _APP = new ThirdPersonCameraDemo();
});