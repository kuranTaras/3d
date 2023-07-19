import {
  AnimationMixer, Clock,
   Group, LoopOnce,
  Mesh,
   PointLight,
  Scene,
} from "three";
import { loadGltf, loadHdri } from "./utils";

import URL_MODEL from 'assets/1234.glb';
import URL_HDRI  from 'assets/studio.hdr';


export class AppScene {
  public scene: Scene;
  private mixer: AnimationMixer;
  public clock: Clock
  public  group: Group
  public animationShow: boolean

  constructor(public camera) {
    this.scene = new Scene();
    this.clock = new Clock();
    this.group = new Group()
    this.animationShow = false
    Promise.all([
      loadHdri(URL_HDRI),
      loadGltf(URL_MODEL),
    ]).then(([hdri, gltf]) => {
      this.configScene(hdri);
      this.addGeometry(gltf);
      this.addAnimation(gltf);
      this.startAnimation(this.animationShow, gltf)
    })
  }

  configScene(texture) {
    this.camera.position.x = 8.8;
    this.camera.position.y = 1.430;
    this.camera.position.z = -5.1;
    if (window.innerWidth < 500) {
      this.camera.fov = (1920*5)/document.querySelector('.tabs__img').clientWidth;
    } else if (window.innerWidth > 2000) {
      this.camera.fov = 20;
    } else {
      this.camera.fov = (1920*16)/document.querySelector('.tabs__img').clientWidth;
    }

    this.camera.updateProjectionMatrix();

    // Add ambient light
    const pointLight = new PointLight(0xFFFFFF, 650);
    pointLight.position.set(40, 20, 30);
    this.scene.add(pointLight);


  }

  addGeometry (model) {
    const ballsMesh= model.scene as Mesh;

    this.group.add(ballsMesh)
    ballsMesh.position.x = 3
    ballsMesh.position.z = -3.6
    ballsMesh.position.y = 0.1

    this.scene.add(this.group)
  }

  addAnimation (model) {
    if(!this.animationShow && window.scrollY >= document.querySelector('.tabs__img').getBoundingClientRect().y + document.body.scrollTop + window.innerHeight*1.5) {
      const {animations, scene} = model;
      this.mixer = new AnimationMixer(scene);
      for (let i = 0; i < animations.length; i++){
        const elem = animations[i]
        let action = this.mixer.clipAction(elem)
        action.play()
        action.setLoop(LoopOnce, 1)
        action.clampWhenFinished = true;
        setTimeout(()=> {
          action.timeScale = 0
          action.paused = true
        },4000)
      }
      this.animationShow= true
    }

  }

  startAnimation(animationShown , model){
    const startAnim =(e) => {
      if( !this.animationShow &&  window.scrollY >= document.querySelector('.tabs__img').getBoundingClientRect().y + document.body.scrollTop + window.innerHeight){

        console.log(123);
        const {animations, scene} = model;
        this.mixer = new AnimationMixer(scene);
        for (let i = 0; i < animations.length; i++){
          const elem = animations[i]
          let action = this.mixer.clipAction(elem)
          action.play()
          action.setLoop(LoopOnce, 1)
          action.clampWhenFinished = true;
          setTimeout(()=> {
              action.timeScale = 0
              action.paused = true
          },4000)
        }

        window.removeEventListener('scroll' , startAnim)
      }
    }

    window.addEventListener('scroll' , startAnim)
  }

  public animate (delta) {
    this.mixer?.update(delta);
  }
}
