import {
  AnimationMixer,
  Clock,
  Group,
  LoopOnce,
  Mesh,
  PerspectiveCamera,
  Scene,
  Vector3,
} from 'three';
import { createCamera, loadGltf, loadHdri } from './utils';

import { CAMERA_PADDING, SCENE_DIMENSIONS } from './constants';

export class CommonScene {
  public cameraOrigin: Vector3 = new Vector3();
  public cameraTarget: Vector3 = new Vector3();
  public camera: PerspectiveCamera;
  public scene: Scene;
  private mixer: AnimationMixer;
  public clock: Clock;
  public group: Group;
  public x: number;
  public y: number;
  public z: number;

  constructor(private renderer, private app, assets: Record<string, string>) {
    this.camera = createCamera(app.aspect);
    this.scene = new Scene();
    this.clock = new Clock();
    this.group = new Group();

    Promise.all([loadHdri(assets.hdri), loadGltf(assets.model)]).then(([hdri, gltf]) => {
      this.configScene(hdri, gltf);
      this.addGeometry(gltf);
      this.addAnimation(gltf);
      this.resizeCamera();
    });
  }

  configScene(texture, gltf) {
    throw 'should be overriden.';
  }

  addGeometry(model) {
    const mesh = model.scene as Mesh;
    this.scene.add(mesh);
  }

  addAnimation(model) {
    const { animations, scene } = model;
    this.mixer = new AnimationMixer(scene);
    for (let i = 0; i < animations.length; i++) {
      const elem = animations[i];
      let action = this.mixer.clipAction(elem);
      action.play();
      action.setLoop(LoopOnce, 1);
      action.clampWhenFinished = true;
    }
  }

  public animate(delta) {
    this.mixer?.update(delta);
  }
  public resizeCamera() {
    // https://discourse.threejs.org/t/camera-zoom-to-fit-object/936/24
    this.camera.aspect = this.app.aspect;
    const fitHeightDistance = SCENE_DIMENSIONS / (2 * Math.atan((Math.PI * this.camera.fov) / 360));
    const fitWidthDistance = fitHeightDistance / this.camera.aspect;
    const distance = CAMERA_PADDING * Math.max(fitHeightDistance, fitWidthDistance);
    this.camera.position.copy(this.cameraOrigin).multiplyScalar(distance);
    this.camera.lookAt(this.cameraTarget);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(...this.app.dimensions);
  }
}
