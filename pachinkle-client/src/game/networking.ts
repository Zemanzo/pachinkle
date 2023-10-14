import ReconnectingWebSocket, { Message } from "reconnecting-websocket";
import { Unpackr } from "msgpackr/unpack";

const unpacker = new Unpackr({ moreTypes: true });

export default class NetworkManager {
  private ws: any;
  private websocketOpen: boolean;
  public messageCallback: (data: any) => void = () => {};

  constructor() {
    this.ws = new ReconnectingWebSocket(
      `ws://${window.location.hostname}:3015/ws/gameplay`,
      [],
      {
        minReconnectionDelay: 1000,
        maxReconnectionDelay: 30000,
        reconnectionDelayGrowFactor: 2,
      }
    );
    this.websocketOpen = false;

    this.ws.binaryType = "arraybuffer";

    this.ws.addEventListener("open", () => {
      this.websocketOpen = true;
    });

    this.ws.addEventListener("close", () => {
      this.websocketOpen = false;
    });

    this.ws.addEventListener("message", (event: any) => {
      if (event.data.byteLength === 0) {
        return;
      }
      const data = unpacker.unpack(event.data);
      if (data.p || data.b || data.m) {
        this.messageCallback(data);
      }
    });
  }

  public sendMessage(message: Message) {
    console.log(message);
    this.ws.send(message);
  }
}
