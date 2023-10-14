import RAPIER from "@dimforge/rapier2d-compat";
import NetworkManager from "./src/network/manager";
import { NETWORK_PACKET_KEYS, NetworkPacket } from "pachinkle-shared";

const networkManager = new NetworkManager();

RAPIER.init().then(async () => {
  const { default: PhysicsManager } = await import("./src/physics/manager");
  const physicsManager = new PhysicsManager();

  networkManager.onUpdate = () => {
    const packet: NetworkPacket = {
      [NETWORK_PACKET_KEYS.BALL_TRANSFORMS]: physicsManager.ballPositions,
      [NETWORK_PACKET_KEYS.PEG_TRANSFORMS]: physicsManager.pegPositions,
      [NETWORK_PACKET_KEYS.PEG_META]: physicsManager.getPegMeta(),
    };

    return packet;
  };

  networkManager.setMessageCallback((ws, message) => {
    if (typeof message !== "string") {
      const [x, y, angle] = [
        message.readDoubleLE(0),
        message.readDoubleLE(8),
        message.readDoubleLE(16),
      ] as [number, number, number];
      physicsManager.createBall([x, y], angle);
    }
  });
});
