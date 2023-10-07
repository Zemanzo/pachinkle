import ReconnectingWebSocket from "reconnecting-websocket";

export default class NetworkManager {
  private ws: any;
  private websocketOpen: boolean;
  public physicsState: Float64Array = new Float64Array();

  constructor() {
    this.ws = new ReconnectingWebSocket(`ws://${window.location.hostname}:3015/ws/gameplay`, [], {
      minReconnectionDelay: 1000,
      maxReconnectionDelay: 30000,
      reconnectionDelayGrowFactor: 2
    });
    this.websocketOpen = false;

    this.ws.binaryType = "arraybuffer";

    this.ws.addEventListener("open", () => {
      this.websocketOpen = true;
    });

    this.ws.addEventListener("close", () => {
      this.websocketOpen = false;
    });

    this.ws.addEventListener("message", (event: any) => {
      this.physicsState = new Float64Array(event.data);
      // @ts-ignore
      document.getElementById("dev").innerHTML = this.physicsState.length * .5;
    });
  }


}
