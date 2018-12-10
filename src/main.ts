const Box2D = require('box2dweb');

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

export class Box2DWorld {
    world;
    framerate = 1000 / 60;

    constructor() {
        const gravity = new b2Vec2(0, 9.8)
        this.world = new b2World(gravity, true);
    }


    init() {
        console.log('initing Box2D....')

        var fixDef = new b2FixtureDef;
        fixDef.density = 1.0;
        fixDef.friction = 0.5;
        fixDef.restitution = 0.2;

        var bodyDef = new b2BodyDef;

        //create ground
        bodyDef.type = b2Body.b2_staticBody;
        bodyDef.position.x = 9;
        bodyDef.position.y = 13;
        fixDef.shape = new b2PolygonShape;
        fixDef.shape.SetAsBox(10, 0.5);
        this.world.CreateBody(bodyDef).CreateFixture(fixDef);

        //create some objects
        bodyDef.type = b2Body.b2_dynamicBody;
        for (var i = 0; i < 10; ++i) {
            if (Math.random() > 0.5) {
                fixDef.shape = new b2PolygonShape;
                fixDef.shape.SetAsBox(
                    Math.random() + 0.1 //half width
                    , Math.random() + 0.1 //half height
                );
            } else {
                fixDef.shape = new b2CircleShape(
                    Math.random() + 0.1 //radius
                );
            }
            bodyDef.position.x = Math.random() * 10;
            bodyDef.position.y = Math.random() * 10;
            this.world.CreateBody(bodyDef).CreateFixture(fixDef);
        }
        this.showDebug();

        setInterval( () => {
            this.update(this.world);
        }, this.framerate);
        console.log('%cWorld created SUCCESSFULLY', 'color: green', this.world);
    }

    update(world) {
        if (world) {
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
}