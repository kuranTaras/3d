import {
  AmbientLight,
  AnimationMixer,
  Camera,
  Clock,
  EquirectangularReflectionMapping,
  Group,
  LoopOnce,
  Mesh,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  RectAreaLight,
  Scene,
} from 'three';
import { createCamera, loadGltf, loadHdri } from './utils';

import URL_MODEL from 'assets/Lending_Earth.glb';
import URL_HDRI from 'assets/peppermint_powerplant_2_4k.hdr';
import { degToRad } from 'three/src/math/MathUtils';
import { App } from './App';

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

    this.camera.copy(cam);
    this.camera.quaternion.copy(cam.quaternion);

    this.scene.rotation.z = degToRad(-10);
    this.scene.position.y = -1;
    this.scene.position.x = -0.2;

    const light = new AmbientLight(0x404040); // soft white light
    this.scene.add(light);

    gltf.scene.children.forEach((m) => {
      if (/area\d+/i.test(m.name)) {
        const areaLight = new RectAreaLight(0xffffff, 0.5);
        areaLight.position.copy(m.position);
        areaLight.quaternion.copy(m.quaternion);
        this.scene.add(areaLight);
      }

      const mat = m.material as MeshPhysicalMaterial;
      if (mat) {
        if (/(dark|coin)/i.test(mat.name)) {
          mat.clearcoatRoughness = 0.0;
          mat.roughness = 0;
          mat.metalness = 0.9;
          mat.needsUpdate = true;
        }
      }
    });
    this.camera.updateProjectionMatrix();
  }

  addGeometry(model) {
    const ballsMesh = model.scene as Mesh;

    this.group.add(ballsMesh);

    ballsMesh.position.x = -0.1;
    // ballsMesh.position.z = -2.78
    ballsMesh.position.y = -0.5;
    // ballsMesh.position.z = 1

    // this.group.lookAt(this.camera.position.x,this.camera.position.y,this.camera.position.z)
    // this.group.position.z = 3
    this.scene.add(this.group);
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
    this.camera.aspect = this.app.aspect;
    // this.scene.camera.fov = (1920 * 3.2) / document.querySelector('.planet__img').clientWidth;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(...this.app.dimensions);
  }
}
