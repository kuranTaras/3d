import {
  AnimationClip,
  AnimationMixer, Clock,
  Fog, Group, LoopOnce,
  Mesh,
  MeshStandardMaterial, PointLight,
  Scene,
} from "three";
import { loadGltf, loadHdri } from "./utils";

import URL_MODEL from 'assets/Lending_Earth.glb';
import URL_HDRI  from 'assets/studio.hdr';

import { ANIMATION_SPEED, MATERIAL_PROPS } from "./constants";


export class AppScene {
  public scene: Scene;
  private mixer: AnimationMixer;
  public clock: Clock
    public group: Group
    public x: number
    public y: number
    public z: number

  constructor(public camera) {
    this.scene = new Scene();
    this.clock = new Clock();
    this.group = new Group()
    this.x = -0.37172927066884237;
    this.y = 3.8338281729372046;
    this.z = 14.548125957985139;
    Promise.all([
      loadHdri(URL_HDRI),
      loadGltf(URL_MODEL),
    ]).then(([hdri, gltf]) => {
      this.configScene(hdri);
      this.addGeometry(gltf);
      this.addAnimation(gltf);
    })
  }

  configScene(texture) {

    this.camera.fov = (1920*3.2)/document.querySelector('.planet__img').clientWidth;





    this.camera.position.x = -3.37172927066884237
    this.camera.position.y = 4.8338281729372046
    this.camera.position.z = 14.548125957985139


    this.scene.rotation.z = -0.15

    this.scene.position.y = -1
    this.camera.updateProjectionMatrix();


    // Add ambient light
    const pointLight = new PointLight(0xFFFFFF, 60);
    pointLight.position.set(this.x, this.y, this.z);
    this.scene.add(pointLight);


    // document.querySelector('.plusingY').addEventListener('click' , () => plusY(this.scene, this.camera))
    // document.querySelector('.plusingX').addEventListener('click' , () => plusX(this.scene,this.camera))
    // document.querySelector('.plusingZ').addEventListener('click' , () => plusZ(this.scene,this.camera))
    //
    // function plusY (camera,scene) {
    //
    //   camera.rotation.y = camera.rotation.y + 0.5
    //
    //   console.log('y' + camera.rotation.y)
    //
    //   scene.updateProjectionMatrix()
    // }
    // function plusX (camera,scene) {
    //   console.log(camera);
    //   camera.rotation.x = camera.rotation.x + 0.5
    //
    //   console.log('x' +camera.rotation.x)
    //   scene.updateProjectionMatrix()
    // }
    // function plusZ (camera,scene) {
    //   camera.rotation.z=  camera.rotation.z - 0.1
    //
    //   console.log('z' +camera.rotation.z)
    //   scene.updateProjectionMatrix()
    // }
    // this.scene.fog = new Fog(0x000000, 100, 100.00);
  }

  addGeometry (model) {
    const ballsMesh= model.scene as Mesh;

    this.group.add(ballsMesh)


    ballsMesh.position.x = -0.1
    // ballsMesh.position.z = -2.78
    ballsMesh.position.y = -0.5
    // ballsMesh.position.z = 1

    // this.group.lookAt(this.camera.position.x,this.camera.position.y,this.camera.position.z)
    // this.group.position.z = 3
    this.scene.add(this.group)
  }

  addAnimation (model) {
    const {animations, scene} = model;
    this.mixer = new AnimationMixer(scene);
    for (let i = 0; i < animations.length; i++){
      const elem = animations[i]
      let action = this.mixer.clipAction(elem)
      action.play()
      action.setLoop(LoopOnce, 1)
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


  public animate (delta) {
    this.mixer?.update(delta);
  }
}
