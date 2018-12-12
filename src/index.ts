import { Box2DWorld } from './main/main';

const mainHtml = `
    <button id="start-btn">START / PAUSE</button>
    <button id="reset-btn">RESET</button>
`
let div = document.createElement('div');
div.innerHTML = mainHtml.trim();
document.body.appendChild(div);

var c = document.createElement('canvas');
// var w = window.innerWidth,
//     h = window.innerHeight;
c.width = 1240;
c.height = 680;
c.id = 'canvas';

document.body.appendChild(c);

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
if (canvas) {
    // canvas.style.backgroundColor = '#111';
}

let world = new Box2DWorld();
world.init();
let worldStarted = true;
world.start();

const startstop = document.getElementById('start-btn') as HTMLElement;
startstop.addEventListener('click', () => {
    if (!worldStarted) {
        world.start();
        worldStarted = true;
    } else {
        world.pause();
        worldStarted = false;
    }
})

const reset = document.getElementById('reset-btn') as HTMLElement;
reset.addEventListener('click', () => {
    world.destroyWorld();
    world = new Box2DWorld();
    world.init();
    worldStarted = true;
    world.start();
})