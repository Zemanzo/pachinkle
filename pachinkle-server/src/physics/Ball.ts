import RAPIER, {
  RigidBody,
  World,
  ActiveEvents,
  Collider,
} from "@dimforge/rapier2d-compat";

export default class Ball {
  private collider: Collider;
  public rigidBody: RigidBody;

  constructor(
    private world: World,
    position?: [number, number],
  ) {
    const [x, y] = position ?? [Math.random(), 50.0];
    const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y);

    // Create a spherical collider attached to the dynamic rigidBody.
    const colliderDesc = RAPIER.ColliderDesc.ball(0.15)
      .setRestitution(0.7)
      .setFriction(3)
      .setActiveEvents(ActiveEvents.COLLISION_EVENTS);

    this.rigidBody = world.createRigidBody(rigidBodyDesc);
    this.collider = world.createCollider(colliderDesc, this.rigidBody);
  }

  destroy() {
    this.world.removeCollider(this.collider, false);
    // this.onDestroy?.();
  }
}
