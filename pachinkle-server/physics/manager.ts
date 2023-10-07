/**
 * This file is imported once RAPIER is initialized, so we can use it without
 * restricitions from here on out.
 */
import RAPIER, { World } from "@dimforge/rapier2d-compat";
import Ball from "./Ball";

export default class PhysicsManager {
  public positions = new Float64Array();

  private world: World;
  private rigidBodies: RAPIER.RigidBody[] = [];

  constructor(onPhysicsUpdate: (physicsManager: PhysicsManager) => void) {
    this.world = new RAPIER.World({ x: 0.0, y: -9.81 });

    // Create the ground
    const groundColliderDesc = RAPIER.ColliderDesc.cuboid(100.0, 2)
      .setFriction(2)
      .setTranslation(0, -50);
    this.world.createCollider(groundColliderDesc);
    // Create the walls
    const wallLeft = RAPIER.ColliderDesc.cuboid(2, 100)
      .setFriction(2)
      .setTranslation(-100, 0);
    this.world.createCollider(wallLeft);
    const wallRight = RAPIER.ColliderDesc.cuboid(2, 100)
      .setFriction(2)
      .setTranslation(100, 0);
    this.world.createCollider(wallRight);

    setInterval(() => {
      // Create a dynamic rigid-body.
      const ball = new Ball(this.world);

      this.rigidBodies.push(ball.rigidBody);
    }, 500);

    // Game loop. Replace by your own game loop system.
    const gameLoop = () => {
      // Ste the simulation forward.
      this.world.step();

      // Get and print the rigid-body's position.
      const positions = new Float64Array(this.rigidBodies.length * 2);
      this.rigidBodies.forEach((body, i) => {
        const { x, y } = body.translation();
        positions[i * 2] = x;
        positions[i * 2 + 1] = y;
        if (y < -50) {
          // this.world.removeRigidBody(body);
        }
      });
      this.positions = positions;
      onPhysicsUpdate(this);

      setTimeout(gameLoop, 16);
    };

    gameLoop();
  }

  createBall(position: [number, number]) {
    console.log(position);
    const ball = new Ball(this.world, position);
    this.rigidBodies.push(ball.rigidBody);
  }
}
