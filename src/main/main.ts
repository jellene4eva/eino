import * as Box2D from 'box2dweb';
import { rejects } from 'assert';

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


export class Box2DWorld {
    world;
    framerate = 1000 / 30;
    gravity = 9.8;
    updateInterval;
    tempTheta = 1;
    muscle1;
    muscle2;
    body1;
    body2;
    body3;

    constructor() {
        const gravity = new b2Vec2(0, this.gravity);
        this.world = new b2World(gravity, false);
        this.world.m_allowSleep = false;
        this.world.SetContinuousPhysics(true);
    }


    init() {
        // console.log('initing Box2D....')


        // create ground
        const bodyDef = new b2BodyDef;
        const fixDef = new b2FixtureDef;
        fixDef.density = 0.0;
        fixDef.friction = 0.6;

        // edgeShape not ready 
        // @see: https://github.com/hecht-software/box2dweb/issues/31
        fixDef.shape = new b2PolygonShape;
        fixDef.shape.SetAsEdge(new b2Vec2(-20.0, 18.0), new b2Vec2(40.0, 18.0))

        this.world.CreateBody(bodyDef).CreateFixture(fixDef);


        let wbody1;
        {
            // const body1 = this.createBody(4.0, 8.0);
            const body = new b2BodyDef;
            body.type = b2Body.b2_dynamicBody;
            body.position.Set(6.0, 18.0);
            body.angle = 50;
            body.angularDamping = 0.4;

            const shape = new b2PolygonShape();
            shape.SetAsBox(2, 0.1);

            const fixture = new b2FixtureDef();
            fixture.shape = shape;
            fixture.friction = 0.6;
            fixture.density = 2.0;
            fixture.restitution = 0.2;
            fixture.filter.groupIndex = 1;
            wbody1 = this.world.CreateBody(body);
            wbody1.CreateFixture(fixture, 2.0);
        }

        let wbody2;
        {
            const body = new b2BodyDef;
            body.type = b2Body.b2_dynamicBody;
            body.position.Set(4.0, 16.0);
            body.angularDamping = 0.4;

            const shape = new b2PolygonShape();
            shape.SetAsBox(4, 0.1);

            const fixture = new b2FixtureDef();
            fixture.shape = shape;
            fixture.friction = 0.6;
            fixture.density = 2.0;
            fixture.restitution = 0.2;
            fixture.filter.groupIndex = 1;
            wbody2 = this.world.CreateBody(body);
            this.body2 = wbody2;
            wbody2.CreateFixture(fixture, 2.0);
            console.log('body2', this.body2);
        }

        {
            const rjd = new b2RevoluteJointDef;
            rjd.Initialize(wbody1, wbody2, wbody1.GetWorldCenter());
            rjd.bodyA = wbody1;
            rjd.bodyB = wbody2;
            rjd.localAnchorA.Set(-2,0);
            rjd.localAnchorB.Set(-4,0);
            rjd.lowerAngle = -2.8;
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
            body.position.Set(4.0, 16.0);
            body.angularDamping = 0.4;

            const shape = new b2PolygonShape();
            shape.SetAsBox(2, 0.1);

            const fixture = new b2FixtureDef();
            fixture.shape = shape;
            fixture.friction = 0.6;
            fixture.density = 2.0;
            fixture.restitution = 0.2;
            fixture.filter.groupIndex = 1;
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

            rjd.collideConnected = false;
            rjd.enableMotor = true;
            rjd.enableLimit = true;
            // rjd.motorSpeed = 100;
            rjd.maxMotorTorque = 100.0;
            this.muscle2 = rjd;
            this.world.CreateJoint(rjd);
        }

        // muscle joint
        {
            // const axis = new b2Vec2(1.0, 1.0);

            // this.muscle1 = new b2DistanceJointDef
            // this.muscle1.bodyA = wbody1;
            // this.muscle1.bodyB = wbody2;
            // this.muscle1.localAnchorA.Set(0,0);
            // this.muscle1.localAnchorB.Set(0,0);
            // this.muscle1.length = 4;
            // this.muscle1.collideConnected = false;
            // this.muscle1.referenceAngle = 1;

            // this.muscle1.Initialize(wbody1, wbody2, wbody1.GetWorldCenter(), wbody2.GetWorldCenter());
            // this.muscle1.enableMotor = false;
            // this.muscle1.enableLimit = false;
            // this.world.CreateJoint(this.muscle1);
            console.log('muscle 1', this.muscle1);
        }
        // {
        //     this.muscle2 = new b2DistanceJointDef;
        //     this.muscle2.bodyA = wbody2;
        //     this.muscle2.bodyB = wbody3;
        //     // this.muscle2.localAnchorA.Set(0,0);
        //     // this.muscle2.localAnchorB.Set(0,0);
        //     // this.muscle2.length = 7;
        //     this.muscle2.Initialize(wbody3, wbody2, wbody3.GetWorldCenter(), wbody2.GetWorldCenter());
        //     // this.muscle2.collideConnected = false;
        //     this.world.CreateJoint(this.muscle2);
        // }

        this.showDebug();

        console.log('%cWorld created SUCCESSFULLY', 'color: green', this.world);
    }

    createBody(x, y, length = 2) {
        const body = new b2BodyDef;
        body.type = b2Body.b2_dynamicBody;
        body.position.Set(x, y);
        body.angularDamping = 0.4;

        const shape = new b2PolygonShape();
        shape.SetAsBox(length, 0.1);

        const fixture = new b2FixtureDef();
        fixture.shape = shape;
        fixture.friction = 0.6;
        fixture.density = 2.0;
        fixture.restitution = 0.2;
        return { body, fixture };
    }

    start() {
        this.updateInterval = setInterval( () => {
            this.update(this.world);
        }, this.framerate);
    }

    pause() {
        clearInterval(this.updateInterval);
        this.world.Step(null);
    }

    update(world) {
        if (world) {
            this.muscle1.motorSpeed = Math.cos(this.tempTheta/Math.random()*50) * 100
            this.world.CreateJoint(this.muscle1);
            this.muscle2.motorSpeed = Math.cos(this.tempTheta/Math.random()*50) * 100
            this.world.CreateJoint(this.muscle2);
            this.tempTheta++;
            if (this.tempTheta > 30) { this.tempTheta = 1 }
            // console.log('muscle speed', this.muscle1.GetMotorSpeed());
            // testbed.g_camera.m_center.x = this.m_car.GetPosition().x;

            if (this.body2.GetPosition().x > 10) {
                const position = new b2Vec2(20, this.body2.GetPosition().y)
                this.body2.SetPosition(position);
            }


            world.Step(
                1 / 60   //frame-rate
                , 10       //velocity iterations
                , 10       //position iterations
            );
            world.DrawDebugData();
            world.ClearForces();
        } 
    };

    showDebug() {
        //setup debug draw
        var debugDraw = new b2DebugDraw();
        const canvas = document.getElementById('canvas') as HTMLCanvasElement;
        debugDraw.SetSprite(canvas.getContext("2d"));
        debugDraw.SetDrawScale(30.0);
        debugDraw.SetFillAlpha(0.3);
        debugDraw.SetLineThickness(1.0);
        debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
        this.world.SetDebugDraw(debugDraw);
    }

    destroyWorld() {
        this.world = null;
    }
}