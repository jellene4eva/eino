import { initWorld } from './planck/planck';

const mainHtml = `
    <button id="start-btn">START / PAUSE</button>
    <button id="reset-btn">RESET</button>
`
// let div = document.createElement('div');
// div.innerHTML = mainHtml.trim();
// document.body.appendChild(div);


// var c = document.createElement('canvas');
// c.width = 1240;
// c.height = 680;
// c.id = 'canvas';

// document.body.appendChild(c);

// const canvas = document.getElementById('canvas') as HTMLCanvasElement;

setTimeout( () =>
    initWorld()
, 100)

// const startstop = document.getElementById('start-btn') as HTMLElement;
// startstop.addEventListener('click', () => {
//     if (!worldStarted) {
//         agent.main(world);
//         worldStarted = true;
//     } else {
//         world.pause();
//         worldStarted = false;
//     }
// })

// const reset = document.getElementById('reset-btn') as HTMLElement;
// reset.addEventListener('click', () => {
//     world.destroyWorld();
//     world = new Box2DWorld();
//     world.init();
//     worldStarted = true;
//     agent.main(world);
// })


// Right arrow key steps the physics forward 1 frame
// window.addEventListener('keydown', (ev) => {
//     if (ev.keyCode === 39) {
        // world.step(); 
        // main();
//      }
// })