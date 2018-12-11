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
    framerate = 1000 / 60;
    updateInterval;
    tempTheta = 1;
    muscle1;
    muscle2;

    constructor() {
        const gravity = new b2Vec2(0, 9.8)
        this.world = new b2World(gravity, true);
        this.world.m_allowSleep = false;
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

        //create some objects
        // bodyDef.type = b2Body.b2_dynamicBody;
        // for (var i = 0; i < 10; ++i) {
        //     if (Math.random() > 0.5) {
        //         fixDef.shape = new b2PolygonShape;
        //         fixDef.shape.SetAsBox(
        //             Math.random() + 0.1 //half width
        //             , Math.random() + 0.1 //half height
        //         );
        //         fixDef
        //     } else {
        //         fixDef.shape = new b2CircleShape(
        //             Math.random() + 0.1 //radius
        //         );
        //     }
        //     bodyDef.position.x = Math.random() * 10;
        //     bodyDef.position.y = Math.random() * 10;
        //     this.world.CreateBody(bodyDef).CreateFixture(fixDef);
        // }

        const body1 = this.createBody(4.0, 8.0);
        body1.body.angle = 20;
        const wbody1 = this.world.CreateBody(body1.body);
        wbody1.CreateFixture(body1.fixture, 2.0);
    
        const body2 = this.createBody(8.0, 5.0, 6);
        body2.body.angle = 0;
        const wbody2 = this.world.CreateBody(body2.body);
        wbody2.CreateFixture(body2.fixture, 2.0);

        {
            const rjd = new b2RevoluteJointDef;
            // rjd.Initialize(wbody1, wbody2, new b2Vec2(-2.0, 0));
            rjd.bodyA = wbody1;
            rjd.bodyB = wbody2;
            rjd.localAnchorA.Set(-2,0);
            rjd.localAnchorB.Set(-6,0);
            rjd.collideConnected = false;
            rjd.enableMotor = false;
            rjd.enableLimit = false;
            this.world.CreateJoint(rjd);
        }

        const body3 = this.createBody(15.0, 7.0);
        body3.body.angle = 20;
        const wbody3 = this.world.CreateBody(body3.body);
        wbody3.CreateFixture(body3.fixture, 2.0);


        {
            const rjd = new b2RevoluteJointDef;
            // rjd.Initialize(wbody1, wbody2, new b2Vec2(3.0, 6.0));
            rjd.bodyA = wbody2;
            rjd.bodyB = wbody3;
            rjd.localAnchorA.Set(6,0);
            rjd.localAnchorB.Set(-2,0);
            rjd.referenceAngle = 123;
            rjd.collideConnected = true;
            this.world.CreateJoint(rjd);
        }

        // muscle joint
        {
            const axis = new b2Vec2(1.0, 1.0);

            this.muscle1 = new b2DistanceJointDef
            this.muscle1.bodyA = wbody1;
            this.muscle1.bodyB = wbody2;
            // this.muscle1.localAnchorA.Set(0,0);
            // this.muscle1.localAnchorB.Set(0,0);
            this.muscle1.length = 4;
            // this.muscle1.referenceAngle = 1;

            this.muscle1.Initialize(wbody1, wbody2, wbody1.GetWorldCenter(), wbody2.GetWorldCenter());
            // this.muscle1.enableMotor = false;
            // this.muscle1.enableLimit = false;
            // this.world.CreateJoint(this.muscle1);
            console.log('muscle 1', this.muscle1);
        }
        {
            this.muscle2 = new b2DistanceJointDef;
            this.muscle2.bodyA = wbody2;
            this.muscle2.bodyB = wbody3;
            // this.muscle2.localAnchorA.Set(0,0);
            // this.muscle2.localAnchorB.Set(0,0);
            // this.muscle2.length = 7;
            this.muscle2.Initialize(wbody3, wbody2, wbody3.GetWorldCenter(), wbody2.GetWorldCenter());
            // this.muscle2.collideConnected = false;
            this.world.CreateJoint(this.muscle2);
        }

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

            this.muscle1.length = 5.5 + Math.sin(this.tempTheta / 5) * 3
            this.muscle2.length = 7 + Math.sin(this.tempTheta / 5) * 1
            this.world.CreateJoint(this.muscle1);
            this.world.CreateJoint(this.muscle2);
            this.tempTheta++;
            // console.log('muscle length', this.muscle1.length)

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