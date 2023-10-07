import RAPIER from "@dimforge/rapier2d-compat";
import { ServerWebSocket } from "bun";

let websocket: ServerWebSocket<any> | null = null;

Bun.serve({
  port: 3015,
  fetch(req, server) {
    if (server.upgrade(req)) {
      return;
    }
    return new Response("Upgrade failed :(", { status: 500 });
  }, // upgrade logic
  websocket: {
    message(ws, message) {}, // a message is received
    open(ws) {websocket = ws}, // a socket is opened
    close(ws, code, message) {}, // a socket is closed
    drain(ws) {}, // the socket is ready to receive more data
  },
});

RAPIER.init().then(() => {
  const world = new RAPIER.World({ x: 0.0, y: -9.81 });

  // Create the ground
  const groundColliderDesc = RAPIER.ColliderDesc.cuboid(100.0, 2).setFriction(2).setTranslation(0, -20);
  world.createCollider(groundColliderDesc);
  // Create the walls
  const wallLeft = RAPIER.ColliderDesc.cuboid(2, 100).setFriction(2).setTranslation(-50, -20);
  world.createCollider(wallLeft);
  const wallRight = RAPIER.ColliderDesc.cuboid(2, 100).setFriction(2).setTranslation(50, -20);
  world.createCollider(wallRight);

  const rigidBodies: RAPIER.RigidBody[] = [];

  setInterval(() => {
    // Create a dynamic rigid-body.
    const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(Math.random(), 50.0);
    const rigidBody = world.createRigidBody(rigidBodyDesc);

    // Create a spherical collider attached to the dynamic rigidBody.
    const colliderDesc = RAPIER.ColliderDesc.ball(0.5).setRestitution(.4).setFriction(3);
    world.createCollider(colliderDesc, rigidBody);

    rigidBodies.push(rigidBody)
  }, 10);

  // Game loop. Replace by your own game loop system.
  const gameLoop = () => {
    // Ste the simulation forward.
    world.step();

    // Get and print the rigid-body's position.
    const positions = new Float64Array(rigidBodies.length * 2);
    rigidBodies.forEach((body, i) => {
      const {x, y} = body.translation();
      positions[i * 2] = x;
      positions[i * 2 + 1] = y;
      if (y < -50) {
        // world.removeRigidBody(body);
      }
    });
    websocket?.sendBinary(positions);

    setTimeout(gameLoop, 16);
  };

  gameLoop();
});
