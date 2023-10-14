import RAPIER, { World } from "@dimforge/rapier2d-compat";
import Peg from "./Peg";

function createCube() {
  return {
    shape: "cuboid" as const,
    shapeArgs: [0.1 + Math.random() * 0.2, 0.1 + Math.random() * 0.2] as [
      number,
      number,
    ],
  };
}
function createBall() {
  return {
    shape: "ball" as const,
    shapeArgs: [0.2] as [number],
  };
}

export default class LevelManager {
  private pegs: Peg<any>[] = [];
  private pegPositions = new Float64Array();

  constructor(private world: World) {
    this.createWorldBoundaries();

    for (let a = -7; a < 7; a += 1.2) {
      for (let b = -3; b < 3; b += 0.7) {
        this.createPeg({
          variant: "default",
          position: [a + (isOdd(b * 10) ? 0.6 : 0), b],
          ...createBall(),
        });
      }
    }

    const shuffledPegs = getShuffledArray(this.pegs);
    shuffledPegs.slice(0, 25).forEach((peg) => {
      peg.variant = "objective";
    });
  }

  createPeg(pegOptions: ConstructorParameters<typeof Peg<any>>[1]) {
    const peg = new Peg(this.world, pegOptions);
    peg.onDestroy = () => {
      // this.pegs = this.pegs.filter((listedPeg) => listedPeg !== peg);
      // this.updatePegPositionsLength();
    };
    this.pegs.push(peg);
    this.updatePegPositionsLength();
  }

  private createWorldBoundaries() {
    // Create the floor and ceiling
    const floorColliderDesc = RAPIER.ColliderDesc.cuboid(100, 2)
      .setFriction(2)
      .setTranslation(0, 8);
    this.world.createCollider(floorColliderDesc);

    const ceilingColliderDesc = RAPIER.ColliderDesc.cuboid(100, 2)
      .setFriction(2)
      .setTranslation(0, -8);
    this.world.createCollider(ceilingColliderDesc);
    // Create the walls
    const wallLeft = RAPIER.ColliderDesc.cuboid(2, 100)
      .setFriction(2)
      .setTranslation(-10, 0);
    this.world.createCollider(wallLeft);
    const wallRight = RAPIER.ColliderDesc.cuboid(2, 100)
      .setFriction(2)
      .setTranslation(10, 0);
    this.world.createCollider(wallRight);
  }

  getPegTransforms() {
    this.pegs.forEach((peg, i) => {
      this.pegPositions.set(peg.serializeTransform(), i * 2);
    });
    return this.pegPositions;
  }

  getPegMeta() {
    return this.pegs.map((peg) => peg.serializeAttributes());
  }

  onPegHit(handle1: number, handle2: number, started: boolean) {
    const hitPeg = this.pegs.find(
      (peg) => peg.handle === handle1 || peg.handle === handle2,
    );
    if (hitPeg) {
      hitPeg.onHit();
      setTimeout(() => hitPeg.destroy(), 1000);
    }
  }

  private updatePegPositionsLength() {
    this.pegPositions = new Float64Array(this.pegs.length * 2);
  }
}

function isOdd(x: number) {
  return Math.abs(x) % 2 === 1;
}

function getShuffledArray<T extends any[]>(array: T) {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));

    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray as T;
}
