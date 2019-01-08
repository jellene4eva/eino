import * as box2d from 'box2dweb';
const Box2D = box2d;

// const b2Vec2: Box2D.Common.Math.b2Vec2                          = Box2D.Common.Math.b2Vec2;
// const b2BodyDef: Box2D.Dynamics.b2BodyDef                       = Box2D.Dynamics.b2BodyDef;
// const b2Body: Box2D.Dynamics.b2Body                             = Box2D.Dynamics.b2Body;
// const b2FixtureDef: Box2D.Dynamics.b2FixtureDef                 = Box2D.Dynamics.b2FixtureDef;
// const b2Fixture: Box2D.Dynamics.b2Fixture                       = Box2D.Dynamics.b2Fixture;
// const b2World: Box2D.Dynamics.b2World                           = Box2D.Dynamics.b2World;
// const b2MassData: Box2D.Collision.Shapes.b2MassData             = Box2D.Collision.Shapes.b2MassData;
// const b2PolygonShape: Box2D.Collision.Shapes.b2PolygonShape     = Box2D.Collision.Shapes.b2PolygonShape;
// const b2CircleShape: Box2D.Collision.Shapes.b2CircleShape       = Box2D.Collision.Shapes.b2CircleShape;
// const b2DebugDraw: Box2D.Dynamics.b2DebugDraw                   = Box2D.Dynamics.b2DebugDraw;
// const b2RevoluteJointDef: Box2D.Dynamics.Joints.b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef;
// const b2LineJointDef: Box2D.Dynamics.Joints.b2LineJointDef         = Box2D.Dynamics.Joints.b2LineJointDef;
// const b2DistanceJointDef: Box2D.Dynamics.Joints.b2DistanceJointDef = Box2D.Dynamics.Joints.b2DistanceJointDef;
// const b2PrismaticJointDef: Box2D.Dynamics.Joints.b2PrismaticJointDef = Box2D.Dynamics.Joints.b2PrismaticJointDef;

const b2Vec2 = Box2D.Common.Math.b2Vec2;
const b2BodyDef = Box2D.Dynamics.b2BodyDef;
const b2Body = Box2D.Dynamics.b2Body;
const b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
const b2Fixture = Box2D.Dynamics.b2Fixture;
const b2World = Box2D.Dynamics.b2World;
const b2MassData = Box2D.Collision.Shapes.b2MassData;
const b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
const b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
const b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
const b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef;
const b2LineJointDef = Box2D.Dynamics.Joints.b2LineJointDef;
const b2DistanceJointDef = Box2D.Dynamics.Joints.b2DistanceJointDef;
const b2PrismaticJointDef = Box2D.Dynamics.Joints.b2PrismaticJointDef;
const b2GroundBody = Box2D.Dynamics.b2GroundBody;
const b2EdgeShape = Box2D.Collision.Shapes.b2EdgeShape
const b2Color = Box2D.Common.b2Color;

export class Box2DWorld {
    world: Box2D.Dynamics.b2World;
    framerate = 1000 / 60;
    gravity = 9.8;
    updateInterval;
    debounce = 0;
    muscle1;
    muscle2;
    muscle3;
    body1;
    body2;
    body3;
    debugDraw: Box2D.Dynamics.b2DebugDraw;

    bodyfilter = -1;

    canvas;
    ctx;

    constructor() {
        const gravity = new b2Vec2(0, this.gravity) as Box2D.Common.Math.b2Vec2;
        this.world = new b2World(gravity, true);
        this.world.SetContinuousPhysics(true);
        this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
        this.ctx    = this.canvas.getContext('2d') as CanvasRenderingContext2D
    }


    init() {
        // console.log('initing Box2D....')


        // create ground
        const bodyDef = new b2BodyDef
        bodyDef.position.Set(0.0, 25.0);
        const fixDef = new b2FixtureDef;
        fixDef.density = 1;
        fixDef.friction = 1;

        // edgeShape not ready 
        // @see: https://github.com/hecht-software/box2dweb/issues/31
        fixDef.shape = new b2PolygonShape; 
        fixDef.shape.SetAsBox(50, 5);

        this.world.CreateBody(bodyDef).CreateFixture(fixDef);


        let wbody1;
        {
            // const body1 = this.createBody(4.0, 8.0);
            const body = new b2BodyDef;
            body.type = b2Body.b2_dynamicBody;
            body.position.Set(10.0, 10.0);
            body.angle = 50;
            // body.angularDamping = 0.4;

            const shape = new b2PolygonShape();
            shape.SetAsBox(2, 0.1);

            const fixture = new b2FixtureDef();
            fixture.shape = shape;
            fixture.friction = 1;
            fixture.density = 0.5;
            fixture.filter.groupIndex = -1;
            wbody1 = this.world.CreateBody(body);
            wbody1.CreateFixture(fixture, 2.0);
        }

        let wbody2;
        {
            const body = new b2BodyDef;
            body.type = b2Body.b2_dynamicBody;
            body.position.Set(10.0, 14.0);
            body.angularDamping = 0.4;

            const shape = new b2PolygonShape();
            shape.SetAsBox(4, 0.1);

            const fixture = new b2FixtureDef();
            fixture.shape = shape;
            fixture.friction = 1;
            fixture.density = 1;
            fixture.filter.groupIndex = -1;
            wbody2 = this.world.CreateBody(body);
            wbody2.CreateFixture(fixture, 2.0);
            this.body2 = wbody2;
            console.log('body2', this.body2);
        }

        {
            const rjd = new b2RevoluteJointDef;
            rjd.Initialize(wbody1, wbody2, wbody1.GetWorldCenter());
            rjd.bodyA = wbody1;
            rjd.bodyB = wbody2;
            rjd.localAnchorA.Set(-2,0);
            rjd.localAnchorB.Set(-4,0);
            rjd.lowerAngle = -3;
            rjd.upperAngle = -0.6
            rjd.collideConnected = false;
            rjd.enableMotor = true;
            rjd.enableLimit = true;
            // rjd.motorSpeed = 100;
            rjd.maxMotorTorque = 200.0;
            // rjd.enableLimit = false;
            this.muscle1 = rjd;
            this.world.CreateJoint(rjd);
        }


        let wbody3;
        {
            const body = new b2BodyDef;
            body.type = b2Body.b2_dynamicBody;
            body.position.Set(10.0, 15.0);
            body.angularDamping = 0.4;

            const shape = new b2PolygonShape();
            shape.SetAsBox(2, 0.1);

            const fixture = new b2FixtureDef();
            fixture.shape = shape;;
            fixture.friction = 1;
            fixture.density = 0.5;
            fixture.filter.groupIndex = -1;
            wbody3 = this.world.CreateBody(body);
            wbody3.CreateFixture(fixture, 2.0);
        }


        {
            const rjd = new b2RevoluteJointDef;
            // rjd.Initialize(wbody1, wbody2, new b2Vec2(3.0, 6.0));
            rjd.bodyA = wbody2;
            rjd.bodyB = wbody3;
            rjd.localAnchorA.Set(4,0);
            rjd.localAnchorB.Set(-2,0);
            rjd.lowerAngle = 0.2 * Math.PI; // -90deg
            rjd.upperAngle = 0.9 * Math.PI; // 45 deg

            rjd.collideConnected = true;
            rjd.enableMotor = true;
            rjd.enableLimit = true;
            rjd.maxMotorTorque = 100.0;
            this.world.CreateJoint(rjd);
        }


        let wbody4;
        {
            const body = new b2BodyDef;
            body.type = b2Body.b2_dynamicBody;
            body.position.Set(2.0, 15);

            const shape = new b2PolygonShape();
            shape.SetAsBox(1, 0.1);

            const fixture: Box2D.Dynamics.b2FixtureDef = new b2FixtureDef();
            fixture.shape = shape;
            fixture.friction = 1;
            fixture.density = 1;
            fixture.filter.groupIndex = -1;
            wbody4 = this.world.CreateBody(body);
            wbody4.CreateFixture(fixture, 2.0);
        }
        {
            const rjd: Box2D.Dynamics.Joints.b2RevoluteJointDef = new b2RevoluteJointDef;
            // rjd.Initialize(wbody1, wbody2, new b2Vec2(3.0, 6.0));
            rjd.bodyA = wbody4;
            rjd.bodyB = wbody1;
            rjd.localAnchorA.Set(1,0);
            rjd.localAnchorB.Set(2,0);
            rjd.lowerAngle = 0.2 * Math.PI; 
            rjd.upperAngle = 0.8 * Math.PI;

            rjd.collideConnected = false;
            // rjd.enableMotor = true;
            // rjd.motorSpeed = 0;
            // rjd.maxMotorTorque = 100;
            rjd.enableLimit = true;
            this.world.CreateJoint(rjd);
        }


        // MUSCLES
        // ==================================
        {

            this.muscle1 = new b2DistanceJointDef
            this.muscle1.bodyA = wbody1;
            this.muscle1.bodyB = wbody2;
            this.muscle1.collideConnected = false;

            this.muscle1.Initialize(wbody1, wbody2, wbody1.GetWorldCenter(), wbody2.GetWorldCenter());
            this.muscle1 = this.world.CreateJoint(this.muscle1);
            // console.log('muscle 1', this.muscle1, wmuscle1);
        }
        {
            this.muscle2 = new b2DistanceJointDef;
            this.muscle2.bodyA = wbody2;
            this.muscle2.bodyB = wbody3;
            this.muscle2.Initialize(wbody3, wbody2, wbody3.GetWorldCenter(), wbody2.GetWorldCenter());
            this.muscle2.collideConnected = true;
            this.muscle2 = this.world.CreateJoint(this.muscle2);
        }
        {
            this.muscle3 = new b2DistanceJointDef;
            this.muscle3.bodyA = wbody1;
            this.muscle3.bodyB = wbody4;
            this.muscle3.Initialize(wbody1, wbody4, wbody1.GetWorldCenter(), wbody4.GetWorldCenter());
            this.muscle3.collideConnected = true;
            this.muscle3 = this.world.CreateJoint(this.muscle3);
        }


        // MEASURE YARD
        // =================================

        {
            let origin = 15;

            for (let i = 0; i < 10; i++) {
                const body = new b2BodyDef;
                body.type = b2Body.b2_staticBody;
                const fixture = new b2FixtureDef
                fixture.density = 0;
                fixture.friction = 0;
                fixture.shape = new b2PolygonShape
                fixture.shape.SetAsEdge(new b2Vec2(origin, 20), new b2Vec2(origin, 10))
                fixture.filter.groupIndex = -1;

                this.world.CreateBody(body).CreateFixture(fixture);
                origin += 5;
            }
        }


        this.showDebug();

        console.log('%cWorld created SUCCESSFULLY', 'color: green', this.world);
    }

    /**
     * @deprecated
     */
    createBody(x, y, length = 2) {
        const body = new b2BodyDef;
        body.type = b2Body.b2_dynamicBody;
        body.position.Set(x, y);
        body.angularDamping = 0.4;

        const shape = new b2PolygonShape();
        shape.SetAsBox(length, 0.1);

        const fixture = new b2FixtureDef();
        fixture.shape = shape;
        fixture.friction = 1;
        fixture.density = 50;
        fixture.restitution = 0.2;
        return { body, fixture };
    }

    start() {
        this.updateInterval = setInterval( () => {
            this.update(this.world);
        }, this.framerate);
    }

    step(act: { muscle1; muscle2; muscle3; }) {
        this.update(this.world, act);
    }

    pause() {
        clearInterval(this.updateInterval);
        this.world.Step(0, 0, 0);
    }

    update(world, actions?: { muscle1; muscle2; muscle3; }) {
        if (!actions.muscle1) { actions.muscle1 = 0; }
        if (!actions.muscle2) { actions.muscle2 = 0; }
        if (!actions.muscle3) { actions.muscle3 = 0; }

        if (world) {
            this.debounce++;
            if (this.debounce === 10) {
                if (actions) {
                    this.muscle1.SetLength(actions.muscle1);
                    this.muscle2.SetLength(actions.muscle2);
                    this.muscle3.SetLength(actions.muscle3);
                }
                this.debounce = 0;
            }

            // testbed.g_camera.m_center.x = this.m_car.GetPosition().x;

            // if (this.body2.GetPosition().x > 20) {
            //     const position = new b2Vec2(20, this.body2.GetPosition().y)
            //     this.body2.SetPosition(position);
            // }


            world.Step(
                1 / 60     //frame-rate
                , 10       //velocity iterations
                , 10       //position iterations
            );
            world.DrawDebugData();


            // DRAW LINE NUMBERS
            // needs to be in update, because world.drawDebugData keeps overriding 
            // canvas, and the text is lost
            // =====================
            {
                let origin = 10;
                let originX = 14;
                for (let i = 0; i < 10; i++) {
                    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
                    this.ctx.font = "15px DroidSans";
                    this.ctx.fillStyle = "#000";
                    this.ctx.fillText(origin+' meters', originX * 30, 9.5 * 30);
                    origin += 5;
                    originX += 5;
                }
            }

            // {
            //     this.ctx.font = "30px Verdana";
            //     this.ctx.fillStyle = "white";
            //     this.ctx.fillText(info.episode, render.canvas.width - this.ctx.measureText(info.episode).width - 20, 35);
            
            //     this.ctx.font = "25px Verdana";
            //     this.ctx.fillStyle = "white";
            //     this.ctx.fillText(info.frame, render.canvas.width - this.ctx.measureText(info.frame).width - 20, 65);
            
            //     this.ctx.font = "40px Verdana";
            //     this.ctx.fillStyle = "white";
            //     this.ctx.fillText(info.score, render.canvas.width - this.ctx.measureText(info.score).width - 20, 105);
            // }

            world.ClearForces();
        } 
    };

    showDebug() {
        //setup debug draw
        this.debugDraw = new b2DebugDraw();
        const canvas = document.getElementById('canvas') as HTMLCanvasElement;
        this.debugDraw.SetSprite(canvas.getContext("2d"));
        this.debugDraw.SetDrawScale(30.0);
        this.debugDraw.SetFillAlpha(0.3);
        this.debugDraw.SetLineThickness(1.0);
        this.debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
        this.world.SetDebugDraw(this.debugDraw);
    }

    destroyWorld() {
        this.world = new b2World();
    }
}