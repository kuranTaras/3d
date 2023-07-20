import './types.d';
import './index.scss';

import { App } from './App/App';
import { App2 } from './App2/App';

let canvas1;

if (document.querySelector('.planet__img')) {
  canvas1 = document.createElement('canvas');
  canvas1.className = 'canvas1';

  document.querySelector('.planet__img').appendChild(canvas1);
} else {
  canvas1 = document.createElement('canvas');
  canvas1.className = 'canvas1';

  const container = document.createElement('div');
  container.className = 'planet__img';
  container.appendChild(canvas1);
  document.body.appendChild(container);
}

let canvas2;

if (document.querySelector('.tabs__img')) {
  canvas2 = document.createElement('canvas');
  canvas2.className = 'canvas2';

  document.querySelector('.tabs__img').appendChild(canvas2);
} else {
  canvas2 = document.createElement('canvas');
  canvas2.className = 'canvas2';

  const container = document.createElement('div');
  container.className = 'tabs__img';
  container.appendChild(canvas2);
  document.body.appendChild(container);
}

window.addEventListener('load', () => {
  const app = new App(canvas1);
  // const app2 = new App2(canvas2);
});
