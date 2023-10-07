import { WebSocketHandler } from "bun";
import SocketsHelper from "./SocketsHelper";

export default class NetworkManager {
  public data = new Float64Array();
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
      this.socketsHelper.emitBinary(this.data);
    }
  }
}
