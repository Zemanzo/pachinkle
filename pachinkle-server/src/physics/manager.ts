/**
 * This file is imported once RAPIER is initialized, so we can use it without
 * restricitions from here on out.
 */
import RAPIER, { World } from "@dimforge/rapier2d-compat";
import Ball from "./Ball";
import Peg from "./Peg";

export default class PhysicsManager {
  public ballPositions = new Float64Array();
  public pegPositions = new Float64Array();

  private world: World;
  private rigidBodies: RAPIER.RigidBody[] = [];
  private pegs: Peg[] = [];

  constructor(onPhysicsUpdate: (physicsManager: PhysicsManager) => void) {
    this.world = new RAPIER.World({ x: 0.0, y: -9.81 });

    // Create the ground
    const groundColliderDesc = RAPIER.ColliderDesc.cuboid(100, 2)
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

    for (let a = -100; a < 100; a += 6) {
      for (let b = -30; b < 30; b += 7) {
        this.pegs.push(new Peg(this.world, [a + (isOdd(b) ? 3 : 0), b]));
      }
    }
    this.pegPositions = new Float64Array(this.pegs.length * 2);

    setInterval(() => {
      this.createBall([Math.random() * 150 - 75, 60]);
    }, 50);

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
      this.ballPositions = positions;
      this.pegs.forEach((peg, i) => {
        const [x, y] = peg.position;
        this.pegPositions[i * 2] = x;
        this.pegPositions[i * 2 + 1] = y;
      });

      onPhysicsUpdate(this);

      setTimeout(gameLoop, 16);
    };

    gameLoop();
  }

  createBall(position: [number, number]) {
    const ball = new Ball(this.world, position);
    this.rigidBodies.push(ball.rigidBody);
  }
}

function isOdd(x: number) {
  return Math.abs(x) % 2 === 1;
}
