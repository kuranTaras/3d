import { Clock, ReinhardToneMapping, Vector2, WebGLRenderer } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass';
import { INTERSECTION_THRESHOLD } from './constants';
import { isMobile } from './utils';

const IS_DESKTOP = !isMobile();

export class App {
  private scene;
  private clock;
  private renderer;
  private composer;
  private frameId;
  private stats;
  private controls;
  private intersectionObserver;

  constructor(canvas, scene, initProps = {}) {
    this.clock = new Clock();
    this.init(canvas, scene, initProps);
    this.onResize();
    this.onShow();
  }

  public get dimensions() {
    const container = this.renderer.domElement.parentElement;

    // const container = document.querySelector('.planet__img');

    return [container.clientWidth, container.clientHeight];
  }

  public get aspect() {
    const [w, h] = this.dimensions;
    return w / h;
  }

  private init(canvas, sceneClass, props: any = {}) {
    this.renderer = new WebGLRenderer({
      alpha: true,
      antialias: true,
      canvas,
    });

    const [w, h] = this.dimensions;

    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.composer = new EffectComposer(this.renderer);

    this.scene = new sceneClass(this.renderer, this);

    const { scene, camera } = this.scene;

    const bloomPass = new UnrealBloomPass(
      new Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85,
    );

    // bloomPass.threshold = 0.2;
    // bloomPass.strength = 0.05;
    // bloomPass.radius = 0.05;

    bloomPass.threshold = props.bloomPassThreshold;
    bloomPass.strength = props.bloomPassStrength;
    bloomPass.radius = props.bloomPassRadius;

    const outputPass = new OutputPass(ReinhardToneMapping, 1.1);

    this.composer.addPass(bloomPass);
    this.composer.addPass(outputPass);
    this.composer.insertPass(new RenderPass(scene, camera), 0);

    if (IS_DESKTOP) {
      // this.composer.addPass(this.antialiasPass());
    }

    // this.composer.addPass(new ShaderPass(OverlayGradient));

    // if (IS_DESKTOP) {
    //   this.controls = new OrbitControls(camera, this.renderer.domElement);
    //   this.controls.enablePan = false;
    //   this.controls.enableZoom = false;
    //   this.controls.enableDamping = true;
    //   this.controls.dampingFactor = ORBIT_DAMPING;
    // }
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
    window.addEventListener('resize', () => this.scene.resizeCamera(), false);
  }

  onShow() {
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.animate();
          } else {
            this.stopAnimation();
          }
        });
      },
      { threshold: INTERSECTION_THRESHOLD },
    );
    this.intersectionObserver.observe(this.renderer.domElement);
  }
}
