import { Robot } from "./robot";
import { NEAT } from "../neat/neat-learning";


// Needs https://cdnjs.cloudflare.com/ajax/libs/planck-js/0.2.7/planck-with-testbed.min.js
declare const planck;
declare const neataptic;

// MAIN FUNCTION
export function initWorld(){
    if (typeof planck == 'undefined') return;

    planck.testbed('neurobot', (testbed) => {
        // ADD GEOMETRY -------------------------------------------

        const pl = planck,
            Vec2 = pl.Vec2;

        const world = new pl.World(Vec2(0, -9.82)); // Gravity

        const canvas = document.getElementsByTagName('canvas')[0] as HTMLCanvasElement;
        if (canvas) {
            let ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        }

        const popSize = 10;
        const generationPeriod = 10000;

        const generation = new NEAT(world, popSize);
        if (generation && generation.neat) {
            for (let i = 0; i < 100; i++) generation.neat.mutate();
        }


        // Define ground
        const ground = world.createBody(Vec2(0, -3));
        ground.createFixture(pl.Box(40, 1), {
            friction: 0.75,
            density: 1.0,
            restitution: 0.2
        });

        generation.initialize()

        setInterval(() => {
            generation.evolve();
        }, generationPeriod);

        let $i = 0;

        testbed.step = function (dt) {
            $i++;
            if ($i % 30 === 0) {
                generation.bots.forEach((bot) => {
                    bot.step();
                });
            }

        };

        // Set testbed size
        testbed.width = 10;
        testbed.height = 10;
        testbed.ratio = 100; // Important for resolution
        testbed.y = -2;

        // Always return world
        return world;
    });
}