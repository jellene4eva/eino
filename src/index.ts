
var Box2D = require('box2dweb');

var c = document.createElement('canvas');
// var w = window.innerWidth,
//     h = window.innerHeight;
c.width = 800;
c.height = 600;
c.id = 'canvas';

document.body.appendChild(c);

const canvas = document.getElementById('canvas');
if (canvas){ 
    canvas.style.backgroundColor = '#111';
    canvas.innerHTML = 'Hello world';
}



function init() {
    console.log('initing Box2D....')
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

    let gravity = new b2Vec2(0, 9.8)
    let world = new b2World(gravity, true);
}
