/**
 * This file is imported once RAPIER is initialized, so we can use it without
 * restricitions from here on out.
 */
import RAPIER, { Vector2, World } from "@dimforge/rapier2d-compat";
import Ball from "./Ball";
import LevelManager from "./LevelManager";

export default class PhysicsManager {
  public ballPositions = new Float64Array();
  public pegPositions = new Float64Array();

  private world: World;
  private balls: Ball[] = [];
  private eventQueue = new RAPIER.EventQueue(true);
  private levelManager: LevelManager;

  constructor() {
    this.world = new RAPIER.World({ x: 0.0, y: -9.81 });

    this.levelManager = new LevelManager(this.world);

    // Game loop. Replace by your own game loop system.
    const gameLoop = () => {
      // Ste the simulation forward.
      this.world.step(this.eventQueue);

      this.eventQueue.drainCollisionEvents((handle1, handle2, started) => {
        this.levelManager.onPegHit(handle1, handle2, started);
      });

      // Get and print the rigid-body's position.
      const positions = new Float64Array(this.balls.length * 2);
      this.balls.forEach((ball, i) => {
        const { x, y } = ball.rigidBody.translation();
        positions[i * 2] = x;
        positions[i * 2 + 1] = y;
        if (y < -5) {
          ball.destroy();
          this.balls = this.balls.filter((listedBall) => listedBall !== ball);
        }
      });
      this.ballPositions = positions;
      this.pegPositions = this.levelManager.getPegTransforms();

      setTimeout(gameLoop, 16);
    };

    gameLoop();
  }

  getPegMeta() {
    return this.levelManager.getPegMeta();
  }

  createBall(position: [number, number], angle: number) {
    const ball = new Ball(this.world, position);
    const power = 0.75;
    ball.rigidBody.applyImpulse(
      new Vector2(power * Math.cos(angle), power * Math.sin(angle)),
      true,
    );
    this.balls.push(ball);
  }
}
