import * as tf from '@tensorflow/tfjs';
import { Box2DWorld } from 'src/main/main';

export class Agent {

    params = {
        // minibatchSize: 32,
        // replayMemorySize: 10000,
        stackFrames: 2,

        targetUpdateFreq: 100,
        discount: 0.99,
        actionRepeat: 4,

        learningRate: 0.01,
        initExp: 1.0,
        finExp: 0.1,
        finExpFrame: 10000,
        replayStartSize: 100,

        numSensors: 20,
        sensorRange: 600,
        sensorDepthResolution: 4,

        hiddenLayers: [64, 64],
        activation: 'elu',

        maxEpisodeFrames: 2000,

        optimizer: 'rmsprop',
        batchSize: 300,
    };
    model: tf.Model;
    trainer;
    replayMemory;
    optimizer = tf.train[this.params.optimizer](this.params.learningRate);
    actions = [0, 0, 0];

    constructor() {}

    // build model
    // update model
    // train 
    // log episode 
    // update model 
    // frame
    // replay
    // tensor numbers
    // loss adjust
    // log episode 
    // loss
    // update model
    // frame

    /**
     * 
     * @param env Game environment e.g. Box2DWorld
     */
    main(env: Box2DWorld) {

        // 1. Get Image with {tf.fromPixels}
        // 2. Sample action with {tf.squeeze}
        // 3. get state, results, from game.step(action);
        // 4. save state for next round
        // 5. store results in a batch
        // 6. train batch with optimizer {tf.train.rmsprop}
        // 7. calculate losses {tf.losses.softmaxCrossEntropy}

        /**
         * Collect possible actions
         */
        // actions = env.getActions();

        /**
         * Epsilon-greedy policy for selecting an action from the Q-values.
         * During training the epsilon is decreased linearly over the given
         * number of iterations. During testing the fixed epsilon is used.
         */
        // epsilon = EpsilonGreedy()

        this.model = this.createModel();
        /*
            this.model.compile({
                loss:
                optimizer: 'adam',
                metrics: ['accuracy']
            })

            const history = await this.model.fit({ x: y: batchSize: BATCH_SIZE })
        */

        let replayMemory
        let epCounter = 0;

        // while( STATE_COUNTER < this.params.batchSize) {
            // get this.model.qValues i.e. percentage for all actions
            // action = epsilon(qValues) i.e. actual actions after processing qValues
            // reward = env.step(action)
            // STATE_COUNTER++;

            // replayMemory.add(state, qValue, action, reward)
            // if (replayMemory.isFull()) { replayMemory.updateQValues() }

            // saveResult = await this.model.save('localstorage://model');
        // if (epCounter < this.params.maxEpisodeFrames) {//2000 
            // let $action = Math.floor(Math.random() * this.actions.length);
            const obs = this.getStateTensor() // this is a tensor;
            // const obsTensor = tf.tensor2d(obs);
            console.log('input image()', obs);
            const action = this.model.predict(obs);
            console.log('action', action);

            // const result = env.step(action);
            const result = env.step({muscle1: 3, muscle2: 3, muscle3: 4});
            const nextObs = this.getStateTensor();

            replayMemory.push({action, result, obs, nextObs});
            if (replayMemory.length > this.params.batchSize) {
                const loss = this.learn();
            }
             
            epCounter++;
            console.log('episode', epCounter)
        // }
        // }
    }

    run() {
    }

    trainGen(env) {
    }


    /**
     * Convert image into tensor
     */
    getStateTensor() {
        const canvas = document.getElementById('canvas') as HTMLCanvasElement;
        const ctx = canvas.getContext("2d");
        const imageData = ctx.getImageData(0, 0, 1240, 680);
        const meanImageNetRGB= tf.tensor1d([123.68,116.779,103.939]);
        return tf.fromPixels(imageData)
                    .resizeNearestNeighbor([224, 224])
                    .toFloat()
                    .sub(meanImageNetRGB)
                    .reverse(2)
                    .expandDims();
    }

    createModel() {
        const model = tf.sequential();

        model.add(tf.layers.dense({
            units: 1,
            activation: this.params.activation, // elu
            // inputDim: (this.params.numSensors + 1) * this.params.stackFrames // (20 + 1) * 2 
            inputDim: 4
            // inputShape: [4,4]
        }));

        for (let i = 0; i < this.params.hiddenLayers.length - 1; i++) {
            model.add(tf.layers.dense({
                units: this.params.hiddenLayers[i + 1], // 64
                activation: this.params.activation, // elu
                inputDim: this.params.hiddenLayers[i] // 64
            }));
        }

        model.add(tf.layers.dense({
            units: this.actions.length,
            activation: 'linear',
            inputDim: this.params.hiddenLayers[this.params.hiddenLayers.length - 1] // 64
        }));

        return model;
    }

    mse(predictions, targets, mask) {
        const e = tf.mul(predictions.sub(targets.expandDims(1)).square(), mask.asType('float32')).mean();
        console.log('loss function()', e);
        return e;
    }

    tidy(targetModel, batchNextS, batchR, batchDone){
        return tf.tidy(() => {
            const maxQ = targetModel.predict(batchNextS).max(1);
            const targets = batchR.add(maxQ.mul(tf.scalar(this.params.discount)).mul(batchDone));
            console.log('tidy()', targets);
            return targets;
        });
    }

    learn() {
        const arrayPrevS = [];
        const arrayA = [];
        const arrayR = [];
        const arrayNextS = [];
        const arrayDone = [];

        for (let i = 0; i < 30; i++) {
            const exp = this.replayMemory[Math.floor(Math.random() * this.replayMemory.length)];
            arrayPrevS.push(exp.prevS);
            arrayA.push(exp.action);
            arrayNextS.push(exp.nextS);
            arrayR.push(exp.reward);
            arrayDone.push(exp.done ? 0 : 1);
        }

        const batchPrevS = tf.tensor2d(arrayPrevS);
        const batchA = tf.tensor1d(arrayA, 'int32');
        const batchR = tf.tensor1d(arrayR);
        const batchNextS = tf.tensor2d(arrayNextS);
        const batchDone = tf.tensor1d(arrayDone);

        const predMask = tf.oneHot(batchA, this.actions.length);

        const targets = this.tidy(this.model, batchR, batchNextS, batchDone);

        const loss = this.optimizer.minimize(() => {
            const x = tf.variable(batchPrevS);
            const predictions = this.model.predict(x);
            const re = this.mse(predictions, targets, predMask);
            x.dispose();

            return re;
        }, true);

        // clean up
        targets.dispose();

        batchPrevS.dispose();
        batchA.dispose();
        batchR.dispose();
        batchNextS.dispose();
        batchDone.dispose();

        predMask.dispose();

        return loss;
    }
}

// export class QLearningTable {
//     actions = [];
//     learningRate: number;
//     rewardDecay: number;
//     epsilonGreedy: number;
//     optimizer = tf.train['rmsprop'](this.learningRate);

//     action() {
            
//     }

// }