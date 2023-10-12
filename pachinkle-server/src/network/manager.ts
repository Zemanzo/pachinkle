import { WebSocketHandler } from "bun";
import SocketsHelper from "./SocketsHelper";
import { Packr, pack } from "msgpackr";

const packer = new Packr({ moreTypes: true });

export default class NetworkManager {
  public data: unknown;
  private socketsHelper: SocketsHelper;

  constructor() {
    this.socketsHelper = new SocketsHelper();

    setInterval(() => this.update(), 20);
  }

  setMessageCallback(callback: WebSocketHandler["message"]) {
    this.socketsHelper.messageCallback = callback;
  }

  update() {
    if (this?.data) {
      const packedData = packer.pack(this.data);
      this.socketsHelper.emitBinary(packedData);
    }
  }
}
