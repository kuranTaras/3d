import {
  AmbientLight,
  EquirectangularReflectionMapping,
  MeshPhysicalMaterial,
  RectAreaLight,
} from 'three';

import { degToRad } from 'three/src/math/MathUtils';
import { CommonScene } from './CommonScene';

import URL_MODEL from 'assets/Lending_Earth.glb';
import URL_HDRI from 'assets/peppermint_powerplant_2_1k.hdr';
import { SCENE_OFFSET } from './constants';

export default class AppScene extends CommonScene {
  constructor(renderer: any, app: any) {
    super(renderer, app, { hdri: URL_HDRI, model: URL_MODEL });
  }
  configScene(texture, gltf) {
    texture.mapping = EquirectangularReflectionMapping;
    this.scene.environment = texture;

    const [cam] = gltf.cameras;
    this.cameraOrigin.copy(cam.position);
    this.cameraTarget.setY(SCENE_OFFSET);
    this.camera.copy(cam);

    this.scene.rotation.z = degToRad(-10);

    this.scene.position.x = -0.25;

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
}
