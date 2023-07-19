import { ACESFilmicToneMapping, Clock, sRGBEncoding, WebGLRenderer, MathUtils } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { ORBIT_DAMPING, INTERSECTION_THRESHOLD } from './constants';
import { AppScene } from './Scene';
import { createCamera, isMobile } from './utils';

const IS_DESKTOP = !isMobile();



export class App2 {
  private scene;
  private clock;
  private renderer;
  private composer;
  private frameId;
  private stats;
  private controls;
  private intersectionObserver;

  constructor(canvas) {
    this.clock = new Clock();
    this.init(canvas);
    this.onResize();
    this.onShow();
  }

  public get dimensions() {
    // const container = this.renderer.domElement.parentElement;

    const container = document.querySelector('.tabs__img')

    return [container.clientWidth, container.clientHeight];
  }

  public  get aspect() {
    const [w, h] = this.dimensions;
    return w / h;
  }

  private init(canvas) {

    this.renderer = new WebGLRenderer({
      alpha: true,
      antialias: true,
      canvas,
    });

    const [w, h] = this.dimensions;

    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.renderer.outputEncoding = sRGBEncoding;
    this.renderer.toneMapping = ACESFilmicToneMapping;


    this.renderer.physicallyCorrectLights = true;
    // renderer.outputEncoding = THREE.GammaEncoding;
    // renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1)


    this.composer = new EffectComposer(this.renderer);

    this.scene = new AppScene(createCamera(this.aspect));

    const { scene, camera } = this.scene;

    this.composer.insertPass(new RenderPass(scene, camera), 0)

    if (IS_DESKTOP) {
      // this.composer.addPass(this.antialiasPass());
    }

    // this.composer.addPass(new ShaderPass(OverlayGradient));

    if (IS_DESKTOP) {
      this.controls = new OrbitControls(camera, this.renderer.domElement);
      this.controls.enablePan = false;
      this.controls.enableZoom = false;
      this.controls.enableDamping = true;
      this.controls.dampingFactor = ORBIT_DAMPING;
    }
  }

  public animate() {
    this.frameId = window.requestAnimationFrame(() => this.animate());

    try {
      const delta = this.clock.getDelta();
      this.scene.animate(delta);
      this.composer.render();
      this.controls?.update();
    } catch (e) {
      this.stopAnimation();
      console.error(e);
      return;
    }
  }

  public stopAnimation() {
    cancelAnimationFrame(this.frameId);
  }

  onResize() {

    const onWindowResize = () => {
      this.scene.camera.aspect = this.aspect;
      if (window.innerWidth < 500) {
        this.scene.camera.fov = (1920*5)/document.querySelector('.tabs__img').clientWidth;
      } else if (window.innerWidth > 2000) {
        this.scene.camera.fov = 20;
      } else {
        this.scene.camera.fov = (1920*16)/document.querySelector('.tabs__img').clientWidth;
      }
      this.scene.camera.updateProjectionMatrix();
      this.renderer.setSize( ...this.dimensions );
    }

    window.addEventListener( 'resize', onWindowResize, false );
  }

  onShow() {
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animate();
        } else {
          this.stopAnimation();
        }
      });
    }, { threshold: INTERSECTION_THRESHOLD });
    this.intersectionObserver.observe(this.renderer.domElement);
  }

}
