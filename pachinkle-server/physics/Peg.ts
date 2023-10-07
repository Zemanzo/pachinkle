import RAPIER from "@dimforge/rapier2d-compat";

export default class Peg {
  collider = RAPIER.ColliderDesc.ball(1);

  constructor() {

  }
}
