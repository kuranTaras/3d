import {
  AmbientLight,
  DirectionalLight,
  EquirectangularReflectionMapping,
  MeshPhysicalMaterial,
  RectAreaLight,
} from 'three';

import { CommonScene } from './CommonScene';

import URL_MODEL from 'assets/Personal_Account.glb';
import URL_HDRI from 'assets/peppermint_powerplant_2_1k.hdr';

export default class AppScene extends CommonScene {
  constructor(renderer: any, app: any) {
    super(renderer, app, { hdri: URL_HDRI, model: URL_MODEL });
  }

  configScene(texture, gltf) {
    texture.mapping = EquirectangularReflectionMapping;
    this.scene.environment = texture;

    const [cam] = gltf.cameras;

    this.cameraOrigin.copy(cam.position);
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

    const light = new AmbientLight(0x404040); // soft white light
    this.scene.add(light);

    const directionalLight = new DirectionalLight(0xffffff, 10);
    directionalLight.position.set(0.1, 1, -1).multiplyScalar(2);
    this.scene.add(directionalLight);
  }
}
