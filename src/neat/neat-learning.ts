declare const neataptic;
import { Robot } from '../planck/robot';

// GA settings
const START_HIDDEN_SIZE = 0;
const MUTATION_RATE = 0.5;
const ELITISM_PERCENT = 0.1;

/** NEAT class for running NEAT processes  */
export class NEAT{
    world;
    bots = [];
    neat

    /**
     * Constructor
     * @param {Planck.World} world 
     */
    constructor(world, pop_size) {
        /** Rename vars */
        const Neat = neataptic.Neat;
        const Methods = neataptic.methods;
        const Config = neataptic.Config;
        const Architect = neataptic.architect;

        /** Turn off warnings */
        if (Config) Config.warnings = false;

        this.world = world;
        this.bots = [];
        const len_input = 12;
        const len_output = 12;
        this.neat = new Neat(len_input, len_output,
            null,
            {
                mutation: [
                    Methods.mutation.ADD_NODE,
                    Methods.mutation.SUB_NODE,
                    Methods.mutation.ADD_CONN,
                    Methods.mutation.SUB_CONN,
                    Methods.mutation.MOD_WEIGHT,
                    Methods.mutation.MOD_BIAS,
                    Methods.mutation.MOD_ACTIVATION,
                    Methods.mutation.ADD_GATE,
                    Methods.mutation.SUB_GATE,
                    Methods.mutation.ADD_SELF_CONN,
                    Methods.mutation.SUB_SELF_CONN,
                    Methods.mutation.ADD_BACK_CONN,
                    Methods.mutation.SUB_BACK_CONN
                ],
                popsize: pop_size,
                mutationRate: MUTATION_RATE,
                elitism: Math.round(ELITISM_PERCENT * pop_size),
                network: new Architect.Random(
                    len_input,
                    START_HIDDEN_SIZE,
                    len_output
                )
            }
        );
    };

    /** 
     * starts the evaluation of the current generation 
    */
    initialize() {

        // destroy all players
        this.bots.forEach((bot) => {
            bot.kill();
        });

        this.bots = [];

        const y = -2;

        // if (pretrained == true) this.neat.population = pretrained_population;

        for (let genome in this.neat.population) {
            genome = this.neat.population[genome];
            const x = 0;
            const bot = new Robot(genome, this.world, x, y);
            this.bots.push(bot);
        }
    };

    /** end the evaluation of the current generation 
     * and continues the evolution
    */
    evolve() {
        this.neat.sort();

        console.log('neat score', this.neat);
        if (this.neat.population[0].score) {
            this.updateStats();
        }

        const new_pop = [];

        // Elitism
        for (let i = 0; i < this.neat.elitism; i++) {
            new_pop.push(this.neat.population[i]);
        }

        // Breed the next individuals
        for (let i = 0; i < this.neat.popsize - this.neat.elitism; i++) {
            new_pop.push(this.neat.getOffspring());
        }

        // Replace the old population with the new population
        this.neat.population = new_pop;
        this.neat.mutate();

        this.neat.generation++;
        this.initialize();
    };

    updateStats() {
        console.log("generation", parseInt(this.neat.generation + 1).toString());
        console.log("score", (this.neat.getAverage()).toFixed(2));
        console.log("mutation", (this.neat.mutationRate * 100).toFixed(0) + '%');
        console.log("maxscore", this.neat.population[0]['score'].toFixed(2).toString());
    }

};
