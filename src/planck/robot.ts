import { rand } from "@tensorflow/tfjs";
declare const planck;

export class Robot {
    // BODY PART DIMENSIONS, edit here, not inside testbed()
    // Will calculate placement & joint placement automatically
    l = {
        chest: 0.45,
        waist: 0.25,
        leg: 0.8,
        arm: 0.8,
        head: 0.32,
        foot: 0.08
    };
    w = {
        chest: 0.25,
        waist: 0.25,
        leg: 0.17,
        arm: 0.13,
        foot: 0.3
    };
    bodyPartDef = {
        friction: 0.6,         
        density: 1.0,           // kg / m2
        filterGroupIndex: -1,   // body parts will not collide to each others (overlap OK)
        restitution: 0.6        // bounciness - 1 = bouncy
    };

    // JOINT DATA, edit here, not inside testbed()
    // Do not add a deeper hierarchy; we only shallow copy each.
    // min, max, rest: angles in degrees
    // torque: max torque by muscles
    jointData = {
        shoulder: { min: -90, rest: -4, max: 160, torque: 180 }, // rest -4
        elbow: { min: 0, rest: 30, max: 150, torque: 180 }, // rest 25
        hip: { min: -20, rest: 1, max: 110, torque: 300 }, // 60 Nm needed for slow walking
        knee: { min: -120, rest: -6, max: 0, torque: 230 }, // should be the same torque as hip
        angle: { min: -50, rest: 3, max: 10, torque: 200 }, // should be the same torque as hip
        neck: { min: -20, rest: -10, max: 20, torque: 50 }, //
        spine: { min: -45, rest: -5, max: 35, torque: 250 }, // 100 Nm seems to be a realistic value for "barely holding one's weight with abs"
    }
    // Defaults for definitions, each will extend inside testbed()
    jointDef = {
        enableMotor: true,
        motorSpeed: 0,
        enableLimit: true,
    }

    // ROBOT CONSTRUCTORS
    world;
    planck;
    brain;
    x; 
    y;
    canUpdateScore;

    // BODY PARTS
    head;
    neck;
    spine;
    chest;
    waist;
    lHip;
    rHip;
    lThigh;
    rThigh;
    lKnee;
    rKnee;
    lShin;
    rShin;
    lFoot;
    rFoot;
    lArmUpper;
    rArmUpper;
    lArmLower;
    rArmLower;
    lShoulder;
    rShoulder;
    lElbow;
    rElbow;
    lAngle;
    rAngle;

    constructor(genome, world, x = 0, y = 0) {
        this.brain = genome
        this.world = world;
        this.x = 0; 
        this.y = y;
        this.canUpdateScore = true;
        this.createBody();
    }

    createBody() {
        const pl          = planck;
        const Vec2        = planck.Vec2;

        const world       = this.world;
        const bodyPartDef = this.bodyPartDef;
        const l           = this.l;
        const w           = this.w;
        const jointDef    = this.jointDef;
        const jointData   = this.jointData;
        
        // Define torso (should be 50% of weight)
        bodyPartDef.density = 200;

        const chest = world
            .createDynamicBody(Vec2(this.x, l.leg + l.waist + l.chest / 2));
        chest
            .createFixture(pl.Box(w.chest / 2, l.chest / 2), bodyPartDef);
        
        bodyPartDef.density = 200;
        const waist = world
            .createDynamicBody(Vec2(this.x, l.leg + l.waist / 2));
        waist
            .createFixture(pl.Box(w.waist / 2, l.waist / 2), bodyPartDef);


        // Define legs (should be 15% of weight each)
        bodyPartDef.density = 70;
        const thighToShinRatio = 0.85;

        const lThigh = world
            .createDynamicBody(Vec2(this.x, 3 * l.leg / 4));
        lThigh
            .createFixture(pl.Box(w.leg / 2, l.leg / 4), bodyPartDef);
        const rThigh = world
            .createDynamicBody(Vec2(this.x, 3 * l.leg / 4));
        rThigh
            .createFixture(pl.Box(w.leg / 2, l.leg / 4), bodyPartDef);

        bodyPartDef.density *= thighToShinRatio;
        const lShin = world
            .createDynamicBody(Vec2(this.x, l.leg / 4));
        lShin
            .createFixture(pl.Box(thighToShinRatio * w.leg / 2, l.leg / 4), bodyPartDef);
        const rShin = world
            .createDynamicBody(Vec2(this.x, l.leg / 4));
        rShin
            .createFixture(pl.Box(thighToShinRatio * w.leg / 2, l.leg / 4), bodyPartDef);

        const lFoot = world
            .createDynamicBody(Vec2(w.foot / 2 - thighToShinRatio * w.leg / 2, -l.foot/2));
        lFoot
            .createFixture(pl.Box(w.foot / 2, l.foot / 2), bodyPartDef);
        const rFoot = world
            .createDynamicBody(Vec2(w.foot / 2 - thighToShinRatio * w.leg / 2, -l.foot/2));
        rFoot
            .createFixture(pl.Box(w.foot / 2, l.foot / 2), bodyPartDef);


        // Define arms (should be 6% of weight each)
        bodyPartDef.density = 50;
        const lower2UpperRatio = 0.85;

        const lArmUpper = world
            .createDynamicBody(Vec2(this.x, l.leg + l.chest + l.waist - l.arm / 4));
        lArmUpper
            .createFixture(pl.Box(w.arm / 2, l.arm / 4), bodyPartDef);
        const rArmUpper = world
            .createDynamicBody(Vec2(this.x, l.leg + l.chest + l.waist - l.arm / 4));
        rArmUpper
            .createFixture(pl.Box(w.arm / 2, l.arm / 4), bodyPartDef);

        bodyPartDef.density *= lower2UpperRatio;

        const lArmLower = world
            .createDynamicBody(Vec2(this.x, l.leg + l.chest + l.waist - 3 * l.arm / 4));
        lArmLower
            .createFixture(pl.Box(lower2UpperRatio * w.arm / 2, l.arm / 4), bodyPartDef);
        const rArmLower = world
            .createDynamicBody(Vec2(this.x, l.leg + l.chest + l.waist - 3 * l.arm / 4));
        rArmLower
            .createFixture(pl.Box(lower2UpperRatio * w.arm / 2, l.arm / 4), bodyPartDef);

        // Define head (should be 8% of weight)
        bodyPartDef.density = 60;

        const head = world
            .createDynamicBody(Vec2(this.x, l.leg + l.waist + l.chest + l.head / 2 + 0.1));
        head
            .createFixture(pl.Circle(l.head / 2), bodyPartDef);



        // ADD JOINTS -------------------------------------------

        // Hips
        const hipDef = {
            ...jointDef,
            maxMotorTorque: jointData.hip.torque,
            lowerAngle: jointData.hip.min * Math.PI / 180,
            upperAngle: jointData.hip.max * Math.PI / 180
        }

        const lHip = world.createJoint(
            pl.RevoluteJoint(
                hipDef,
                waist,
                lThigh,
                Vec2(this.x, l.leg)
            )
        );
        lHip.setUserData({ ...jointData.hip });
        const rHip = world.createJoint(
            pl.RevoluteJoint(
                hipDef,
                waist,
                rThigh,
                Vec2(this.x, l.leg)
            )
        );
        rHip.setUserData({ ...jointData.hip });

        // Knees
        const kneeDef = {
            ...jointDef,
            maxMotorTorque: jointData.knee.torque,
            lowerAngle: jointData.knee.min * Math.PI / 180,
            upperAngle: jointData.knee.max * Math.PI / 180
        }

        const lKnee = world.createJoint(
            pl.RevoluteJoint(
                kneeDef,
                lThigh,
                lShin,
                Vec2(0, l.leg / 2)
            )
        );
        lKnee.setUserData({ ...jointData.knee });
        const rKnee = world.createJoint(
            pl.RevoluteJoint(
                kneeDef,
                rThigh,
                rShin,
                Vec2(0, l.leg / 2)
            )
        );
        rKnee.setUserData({ ...jointData.knee });

        // Angles
        const angleDef = {
            ...jointDef,
            maxMotorTorque: jointData.angle.torque,
            lowerAngle: jointData.angle.min * Math.PI / 180,
            upperAngle: jointData.angle.max * Math.PI / 180
        }

        const lAngle = world.createJoint(
            pl.RevoluteJoint(
                angleDef,
                lShin,
                lFoot,
                Vec2(0, 0)
            )
        );
        lAngle.setUserData({ ...jointData.angle });
        const rAngle = world.createJoint(
            pl.RevoluteJoint(
                angleDef,
                rShin,
                rFoot,
                Vec2(0, 0)
            )
        );
        rAngle.setUserData({ ...jointData.angle });

        // Shoulders
        const shoulderDef = {
            ...jointDef,
            maxMotorTorque: jointData.shoulder.torque,
            lowerAngle: jointData.shoulder.min * Math.PI / 180,
            upperAngle: jointData.shoulder.max * Math.PI / 180
        }
        const rShoulder = world.createJoint(
            pl.RevoluteJoint(
                shoulderDef,
                chest,
                rArmUpper,
                Vec2(0, l.leg + l.chest + l.waist)
            )
        );
        rShoulder.setUserData({ ...jointData.shoulder });
        shoulderDef.motorSpeed = 0.2;
        const lShoulder = world.createJoint(
            pl.RevoluteJoint(
                shoulderDef,
                chest,
                lArmUpper,
                Vec2(0, l.leg + l.chest + l.waist)
            )
        );
        lShoulder.setUserData({ ...jointData.shoulder });

        // Elbows
        const elbowDef = {
            ...jointDef,
            maxMotorTorque: jointData.elbow.torque,
            lowerAngle: 0 * Math.PI / 180,
            upperAngle: 170 * Math.PI / 180
        }
        const lElbow = world.createJoint(
            pl.RevoluteJoint(
                elbowDef,
                lArmUpper,
                lArmLower,
                Vec2(w.arm / 2, l.leg + l.chest + l.waist - l.arm / 2)
            )
        );
        lElbow.setUserData({ ...jointData.elbow });
        const rElbow = world.createJoint(
            pl.RevoluteJoint(
                elbowDef,
                rArmUpper,
                rArmLower,
                Vec2(w.arm / 2, l.leg + l.chest + l.waist - l.arm / 2)
            )
        );
        rElbow.setUserData({ ...jointData.elbow });

        // Spine
        const spine = world.createJoint(
            pl.RevoluteJoint(
                {
                    ...jointDef,
                    maxMotorTorque: jointData.spine.torque,
                    lowerAngle: jointData.spine.min * Math.PI / 180,
                    upperAngle: jointData.spine.max * Math.PI / 180
                },
                waist,
                chest,
                Vec2(-w.waist/3, l.leg + l.waist)
            )
        );
        spine.setUserData({ ...jointData.spine });

        // Neck
        const neck = world.createJoint(
            pl.RevoluteJoint(
                {
                    ...jointDef,
                    maxMotorTorque: jointData.neck.torque,
                    lowerAngle: jointData.neck.min * Math.PI / 180,
                    upperAngle: jointData.neck.max * Math.PI / 180
                },
                chest,
                head,
                Vec2(0, l.leg + l.waist + l.chest)
            )
        );
        neck.setUserData({ ...jointData.neck });

        // console.log('head', head.m_mass, 'kg');
        // console.log('torso', chest.m_mass + waist.m_mass, 'kg');
        // console.log('arm', lArmUpper.m_mass + lArmUpper.m_mass, 'kg');
        // console.log('leg', lThigh.m_mass + lShin.m_mass + lFoot.m_mass, 'kg');
        // console.log('TOTAL',
        //     head.m_mass + chest.m_mass + waist.m_mass + 
        //     (lArmUpper.m_mass + lArmLower.m_mass) *2 +
        //     (lThigh.m_mass + lShin.m_mass + lFoot.m_mass) *2
        //     , 'kg');


        // parts
        this.head = head;
        this.chest = chest;
        this.waist = waist;
        this.lThigh = lThigh;
        this.rThigh = rThigh;
        this.lShin = lShin;
        this.rShin = rShin;
        this.lFoot = lFoot;
        this.rFoot = rFoot;
        this.lArmUpper = lArmUpper;
        this.rArmUpper = rArmUpper;
        this.lArmLower = lArmLower;
        this.rArmLower = rArmLower;

        // joints
        this.neck = neck;
        this.spine = spine;
        this.lHip = lHip;
        this.rHip = rHip;
        this.lKnee = lKnee;
        this.rKnee = rKnee;
        this.lShoulder = lShoulder;
        this.rShoulder = rShoulder;
        this.lElbow = lElbow;
        this.rElbow = rElbow;
        this.lAngle = lAngle;
        this.rAngle = rAngle;
    }

    bodyParts() {
        return [
            this.head, this.chest, this.waist, 
            this.lThigh, this.rThigh, 
            this.lShin, this.rShin, 
            this.lFoot, this.rFoot,
            this.lArmUpper, this.rArmUpper,
            this.lArmLower, this.rArmLower
        ]
    }

    jointParts() {
        return [
            this.neck, this.spine,
            this.lHip, this.rHip,
            this.lKnee, this.rKnee,
            this.lShoulder, this.rShoulder,
            this.lElbow, this.rElbow,
            this.lAngle, this.rAngle
        ]
    }

    kill() {
        const body = this.bodyParts();
        body.forEach( part => 
            this.world.destroyBody(part)
        )
        const joints = this.jointParts();
        joints.forEach( part => 
            this.world.destroyJoint(part)
        )
    }

    step() {
        let input = this.createBrainInput();
        let result = this.brain.activate(input);
        const MOTOR_SPEED = 30;
        for (let i = 0; i < result.length; i++) {
            const jt = this.jointParts()[i];
            if (result[i] > .5) {
                jt.setMotorSpeed(MOTOR_SPEED);
            } else {
                jt.setMotorSpeed(-MOTOR_SPEED);
            }
        }
        this.updateScore();
    }

    updateScore() {
        if (this.canUpdateScore) {
            this.brain.score = this.chest.c_position.c.x * 1000;
        }
        const chestAngle = Math.round(getBodyDegrees(this.chest) / 10) * 10;
                
        let reward = 0;
        if (chestAngle < 11 || chestAngle > 349) { this.canUpdateScore = false; reward = 0; }
        else if (chestAngle < 21 || chestAngle > 339) { this.canUpdateScore = false; reward = -10; }
        else if (chestAngle < 31 || chestAngle > 329) { this.canUpdateScore = false; reward = -100; }
        else if (chestAngle < 51 || chestAngle > 309) { this.canUpdateScore = false; reward = -500; }
    }

        /**
     * Creates input for the neural networks brain
     * @returns {array} - the created input for the brain
     */
    createBrainInput() {
        /*
            // These can be randomized to learn
            let testSet = [
                this.rShoulder, this.lShoulder,
                // lElbow, rElbow,
                this.lHip, this.rHip,
                this.lKnee, this.rKnee,
                // lAngle, rAngle,
                this.spine,
            ];

            // Put joints here that do not need to be moved, but stabilized
            let stabilizeSet = [
                this.neck,
                // rShoulder, lShoulder, 
                this.lElbow, this.rElbow,
                // lHip, rHip,
                // lKnee, rKnee, 
                this.lAngle, this.rAngle,
                // spine,
            ];
        */

        let input = [];
        this.jointParts().forEach(joint => {
            joint
            let motorSpeed = getNewMotorSpeed(joint)
            input.push(motorSpeed);
        });
        return input;
    };
}


// HELPERS ---------------------------------


/**
 * Measure tilt of a body
 * @param body
 * @return tilt in degrees
 */ 
function getBodyDegrees(body) {
    let rad = body.getAngle();
    var tAngle = Math.round(rad * 180 / Math.PI);
    // Reset between 0...359 deg
    while (tAngle < 0){
        tAngle += 360;
     }
     while (tAngle >= 360){
        tAngle -= 360;
     }
    return tAngle;
}



/**
 * Get a joint's data
 * Does not mutate the jointData
 * @param jointData userData from the joint 
 * @return new copy of userData
 */
function getJointData(jointData: any, multiplier: number) {
    if (!jointData) return null;
    let newJointData = {...jointData};

    const min = newJointData.min;
    const max = newJointData.max;
    const rest = newJointData.rest;

    // let direction = Math.random() > 0.5 ? -1 : 1;

    // Discreet decisions (easier to teach later)
    // position 'rest', move a little, move medium, move a lot

    // const dice = Math.floor(Math.random() * 4);
    // let multiplier = 0;
    // switch (dice) {
    //     case 0:
    //     multiplier = 0;
    //     break;
    //     case 1:
    //     multiplier = 0.1;
    //     break;
    //     case 2:
    //     multiplier = 0.33;
    //     break;
    //     case 3:
    //     multiplier = 1;
    // }
    // newJointData.target = direction < 0 ?
    //     Math.round(min + multiplier * (rest - min)) :
    //     Math.round(rest + multiplier * (max - rest));
    

    switch (multiplier) {
        case 1:
        multiplier = -1;
        break;
        case 2:
        multiplier = -0.33;
        break;
        case 3:
        multiplier = 0;
        break;
        case 4:
        multiplier = 0.33;
        case 5:
        multiplier = 1;
    }

    newJointData.target = multiplier < 0 ?
        Math.round(min + multiplier * (rest - min)) :
        Math.round(rest + multiplier * (max - rest));

    return newJointData;
}


/**
 * Cacluclates the motor speed for a joint to aim for the target angle
 * Does not mutate the joint
 * @param joint the joint to calculate
 */
function getNewMotorSpeed(joint) {
    const currentAngle = joint.getJointAngle(); // radians

    const userData = joint.getUserData()
    if (!userData) return null;

    const target = (userData.target || userData.target === 0) ?
        userData.target : userData.rest;
    const angleError = currentAngle * 180 / Math.PI - target;
    const gain = userData.originalAngle ?
        ( currentAngle * 180 / Math.PI > 0.9 * userData.originalAngle ? 0.04 : 0.14)
        :
        0.14;

    return (-gain * angleError);
}

