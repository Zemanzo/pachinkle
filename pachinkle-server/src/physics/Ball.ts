import RAPIER, { RigidBody, World } from "@dimforge/rapier2d-compat";

export default class Ball {
  rigidBody: RigidBody;

  constructor(world: World, position?: [number, number]) {
    const [x, y] = position ?? [Math.random(), 50.0];
    const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y);

    // Create a spherical collider attached to the dynamic rigidBody.
    const colliderDesc = RAPIER.ColliderDesc.ball(0.5)
      .setRestitution(0.4)
      .setFriction(3);

    this.rigidBody = world.createRigidBody(rigidBodyDesc);
    world.createCollider(colliderDesc, this.rigidBody);
  }
}
