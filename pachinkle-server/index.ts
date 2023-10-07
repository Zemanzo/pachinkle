import RAPIER from "@dimforge/rapier2d-compat";
import NetworkManager from "./network/manager";
import type PhysicsManager from "./physics/manager";

const networkManager = new NetworkManager();

RAPIER.init().then(async () => {
  const { default: PhysicsManager } = await import("./physics/manager");
  const onPhysicsUpdate = (physicsManager: PhysicsManager) => {
    networkManager.data = physicsManager.positions;
  };
  const physManager = new PhysicsManager(onPhysicsUpdate);
  networkManager.setMessageCallback((ws, message) => {
    if (typeof message !== "string") {
      const position = [
        message.readDoubleLE(0) * 0.1,
        message.readDoubleLE(8) * -0.1,
      ] as [number, number];
      physManager.createBall(position);
    }
  });
});
