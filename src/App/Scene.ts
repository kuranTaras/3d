import {
  AmbientLight,
  AnimationMixer,
  BackSide,
  Clock,
  DirectionalLight,
  EquirectangularReflectionMapping,
  Group,
  LoopOnce,
  Mesh,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  RectAreaLight,
  Scene,
  Vector2,
  Vector3,
} from 'three';
import { createCamera, loadGltf, loadHdri } from './utils';

import URL_MODEL from 'assets/Personal_Account.glb';

import URL_HDRI from 'assets/peppermint_powerplant_2_4k.hdr';
import { CAMERA_PADDING, SCENE_DIMENSIONS } from './constants';

let cameraOrigin = new Vector3(-1.3, 2.8, 6.08);
export class AppScene {
  public camera: PerspectiveCamera;
  public scene: Scene;
  private mixer: AnimationMixer;
  public clock: Clock;
  public group: Group;
  public x: number;
  public y: number;
  public z: number;

  constructor(private renderer, private app) {
    this.camera = createCamera(app.aspect);
    this.scene = new Scene();
    this.clock = new Clock();
    this.group = new Group();

    Promise.all([loadHdri(URL_HDRI), loadGltf(URL_MODEL)]).then(([hdri, gltf]) => {
      this.configScene(hdri, gltf);
      this.addGeometry(gltf);
      this.addAnimation(gltf);
      this.resizeCamera();
    });
  }

  configScene(texture, gltf) {
    texture.mapping = EquirectangularReflectionMapping;
    this.scene.environment = texture;

    const [cam] = gltf.cameras;

    cameraOrigin.copy(cam.position);
    this.camera.copy(cam);

    gltf.scene.traverse((m) => {
      if (/area\d+/i.test(m.name)) {
        const areaLight = new RectAreaLight(0xffffff, 1);
        areaLight.position.copy(m.position);
        areaLight.quaternion.copy(m.quaternion);
        this.scene.add(areaLight);
      }

      const mat = m.material as MeshPhysicalMaterial;
      if (mat) {
        if (/(dark)/i.test(mat.name)) {
          mat.clearcoatRoughness = 0.01;
          mat.roughness = 0.2;
          mat.metalness = 0.9;
        }
        if (/(gold|metal_dark)/i.test(mat.name)) {
          mat.metalness = 0.9;
          mat.roughness = 0;
        }

        mat.needsUpdate = true;
      }
    });
    this.camera.updateProjectionMatrix();
  }

  addGeometry(model) {
    const mesh = model.scene as Mesh;
    this.scene.add(mesh);
    const light = new AmbientLight(0x404040); // soft white light
    this.scene.add(light);

    const directionalLight = new DirectionalLight(0xffffff, 10);
    directionalLight.position.set(0.1, 1, -1).multiplyScalar(2);
    this.scene.add(directionalLight);
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
      // setTimeout(()=> {
      //   action.timeScale = 0
      // },9000)
    }
    // animations.fo((clip: any)=>{
    //   action = this.mixer.clipAction( clip );
    // return action

    // action.play()

    // action.play();
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
    this.camera.position.copy(cameraOrigin).multiplyScalar(distance);
    this.camera.lookAt(0, 0, 0);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(...this.app.dimensions);
  }
}
