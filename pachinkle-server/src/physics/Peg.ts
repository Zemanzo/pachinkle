import RAPIER, { World } from "@dimforge/rapier2d-compat";
import { kMaxLength } from "buffer";

export default class Peg {
  colliderDesc = RAPIER.ColliderDesc.ball(2);
  collider: RAPIER.Collider;

  constructor(
    world: World,
    public position: [x: number, y: number] = [0, 0],
  ) {
    this.colliderDesc.setTranslation(...position);
    this.collider = world.createCollider(this.colliderDesc);

    setInterval(() => {
      const [x, y] = position;
      const newX = x + Math.sin(Date.now() * 0.001) * 0.1;
      this.collider.setTranslation(new RAPIER.Vector2(newX, y));
      this.position[0] = newX;
    }, 16);
  }
}
