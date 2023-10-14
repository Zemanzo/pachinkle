import RAPIER, { World } from "@dimforge/rapier2d-compat";

type RapierColliderDesc = typeof RAPIER.ColliderDesc;

interface Options<TShape extends "ball" | "cuboid" = "ball"> {
  position: [x: number, y: number];
  shape: TShape;
  shapeArgs: Parameters<RapierColliderDesc[TShape]>;
  variant: "default" | "objective" | "power" | "points";
}

export default class Peg<TShape extends "ball" | "cuboid"> {
  private colliderDesc: RAPIER.ColliderDesc;
  private collider: RAPIER.Collider;
  private position: Options["position"];
  private shapeArgs: Options<TShape>["shapeArgs"];
  private shape: TShape;
  public variant: Options["variant"];
  private isHit = false;
  private destroyed = false;

  public onDestroy?: () => void;
  public handle: number;

  constructor(
    private world: World,
    options?: Options<TShape>,
  ) {
    const { shape, shapeArgs, position, variant } = options ?? {
      shape: "ball" as TShape,
      shapeArgs: [1] as Options<TShape>["shapeArgs"],
      position: [0, 0] as Options["position"],
      variant: "default" as Options["variant"],
    };

    this.shape = shape;
    this.shapeArgs = shapeArgs;
    this.position = position;
    this.variant = variant;

    //@ts-ignore
    this.colliderDesc = RAPIER.ColliderDesc[shape](...shapeArgs)
      .setTranslation(...position)
      .setRestitution(0.5);
    this.collider = world.createCollider(this.colliderDesc);
    this.handle = this.collider.handle;
  }

  serializeTransform() {
    return new Float64Array([...this.position]);
  }

  serializeAttributes() {
    return {
      shapeArgs: this.shapeArgs,
      shape: this.shape,
      isHit: this.isHit,
      variant: this.variant,
      isDestroyed: this.destroyed,
    };
  }

  onHit() {
    this.isHit = true;
  }

  destroy() {
    this.world.removeCollider(this.collider, false);
    this.destroyed = true;
    this.onDestroy?.();
  }
}
