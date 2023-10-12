import RAPIER from "@dimforge/rapier2d-compat";
import NetworkManager from "./src/network/manager";
import type PhysicsManager from "./src/physics/manager";
import { NETWORK_PACKET_KEYS } from "pachinkle-shared";

const networkManager = new NetworkManager();

const onPhysicsUpdate = (physicsManager: PhysicsManager) => {
  networkManager.data = {
    [NETWORK_PACKET_KEYS.BALLS]: physicsManager.ballPositions,
    [NETWORK_PACKET_KEYS.PEGS]: physicsManager.pegPositions,
  };
};

RAPIER.init().then(async () => {
  const { default: PhysicsManager } = await import("./src/physics/manager");
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
