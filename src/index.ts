import { Box2DWorld } from './main';

var c = document.createElement('canvas');
// var w = window.innerWidth,
//     h = window.innerHeight;
c.width = 800;
c.height = 600;
c.id = 'canvas';

document.body.appendChild(c);

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
if (canvas) {
    // canvas.style.backgroundColor = '#111';
}

const world = new Box2DWorld();
world.init();