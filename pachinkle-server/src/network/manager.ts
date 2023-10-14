import { WebSocketHandler } from "bun";
import SocketsHelper from "./SocketsHelper";
import { Packr, pack } from "msgpackr";
import { NetworkPacket } from "pachinkle-shared";

const packer = new Packr({ moreTypes: true });

export default class NetworkManager {
  public data: unknown;
  public onUpdate?: () => NetworkPacket;

  private socketsHelper: SocketsHelper;

  constructor() {
    this.socketsHelper = new SocketsHelper();

    setInterval(() => this.update(), 20);
  }

  setMessageCallback(callback: WebSocketHandler["message"]) {
    this.socketsHelper.messageCallback = callback;
  }

  private update() {
    const data = this.onUpdate?.();
    if (data) {
      const packedData = packer.pack(data);
      this.socketsHelper.emitBinary(packedData);
    }
  }

  sendImmediate(data: any) {
    const packedData = packer.pack(data);
    this.socketsHelper.emitBinary(packedData);
  }
}
