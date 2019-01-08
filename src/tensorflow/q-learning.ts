
const actionValues = ['1', '2', '3', '4', '5'];

function enumerate(digits: number, vals: string[], baseString: string = ''): string {
	var ret = '';
	for (var i = 0; i < vals.length; i++) {
        ret += (digits == 1 ? baseString + vals[i] : enumerate(digits - 1, vals, baseString + vals[i]));
        if (i < vals.length -1) ret += ','; 
	}
    return ret;
}


class State {
    name: string;
    actions: any = {};
    constructor(stateName, actions) {
        this.name = stateName;
        // Actions of State
        for (let action of actions) {
            this.actions[action] = 0;
        }
    }
}

export class QLearn {
    actions: string[];
    lr: number;
    gamma: number;
    epsilon: number;
    // Q Table Structure
    states: any = {};
    term = 'term';

    // defaults: learningRate = 0.01, discountFactor = 0.9, eGreedy = 0.9
    constructor(actionAmount: number, learningRate = 0.01, discountFactor = 0.9, eGreedy = 0.9) {
        this.actions = enumerate(actionAmount, actionValues).split(',');
        this.lr = learningRate;
        this.gamma = discountFactor;
        this.epsilon = eGreedy;
    }

    setParams(learningRate = 0.01, discountFactor = 0.9, eGreedy = 0.6) {
        this.lr = learningRate;
        this.gamma = discountFactor;
        this.epsilon = eGreedy;
    }

    checkStateExist(stateName) {
        if (!this.states[stateName]) this.addState(stateName, this.actions);
    }
    addState(name, actions) {
        const state = new State(name, actions);
        this.states[name] = state;
        return state;
    }

    bestAction(stateActions) {
        let bestAction = null;
        let bestActionReward = null;

        for (let actionName in stateActions) {
            if (!bestActionReward) {
                bestActionReward = stateActions[actionName];
            }
            if (stateActions[actionName] > bestActionReward) {
                bestAction = actionName;
                bestActionReward = stateActions[actionName];
            } else if (stateActions[actionName] === bestActionReward && (Math.random() > 0.5)) {
                bestAction = actionName;
            } else {
                bestAction = bestAction || actionName;
            }
        }
        return (bestAction);
    }



    chooseAction(stateName) {
        this.checkStateExist(stateName);

        // console.log('Q Value: ' + JSON.stringify(this.states[stateName].actions, undefined, 2));

        let nextAction = null;
        if (Math.random() < this.epsilon) {
            // choose next action based on Q Value
            const stateActions = this.states[stateName].actions;
            nextAction = this.bestAction(stateActions);
            // console.log('%cpickAction: ' + nextAction, 'color: green');
        } else {
            // choose next action randomly
            nextAction = this.actions[Math.floor(Math.random() * this.actions.length)];
            // console.log('%crandomAction: ' + nextAction, 'color: orange');
        }
        return nextAction;
    }

    learn(stateName, actionName, reward, nextStateName) {
        this.checkStateExist(stateName);
        this.checkStateExist(nextStateName);

        const qPredict = this.states[stateName].actions[actionName];

        // γ*maxQ(s′,a′)
        const qTarget = (stateName !== this.term) ?
            reward + this.gamma * Math.max(...Object.keys(this.states[nextStateName].actions).map(key => this.states[nextStateName].actions[key]))
            : reward;

        this.states[stateName].actions[actionName] += this.lr * (qTarget - qPredict);
    }
}