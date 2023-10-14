import { ServerWebSocket, WebSocketHandler } from "bun";

type SocketHandler<TKey extends keyof WebSocketHandler> = NonNullable<
  WebSocketHandler[TKey]
> extends (...args: any) => any
  ? Parameters<NonNullable<WebSocketHandler[TKey]>>
  : never;

export default class SocketsHelper {
  websockets: ServerWebSocket<any>[] = [];
  public messageCallback?: WebSocketHandler["message"];

  constructor() {
    Bun.serve<undefined>({
      port: 3015,
      fetch(req, server) {
        if (server.upgrade(req)) {
          console.log("Successfully started WS server!");
          return;
        }
        return new Response("Upgrade failed :(", { status: 500 });
      },
      websocket: {
        message: (...args) => this.message(...args),
        open: (...args) => this.open(...args),
        close: (...args) => this.close(...args),
      },
    });
  }

  private message(...args: Parameters<WebSocketHandler["message"]>) {
    this.messageCallback?.(...args);
  }
  private open(...[ws]: SocketHandler<"open">) {
    this.websockets.push(ws);
  }
  private close(...[ws, code, message]: SocketHandler<"close">) {
    const index = this.websockets.indexOf(ws);
    if (index > -1) {
      this.websockets.splice(index, 1);
    }
  }

  /**
   * Send message to all open websockets.
   */
  emit(message: string | BufferSource) {
    for (const ws of this.websockets) {
      ws.send(message);
    }
  }

  /**
   * Send message to all open websockets.
   */
  emitBinary(message: BufferSource) {
    for (const ws of this.websockets) {
      ws.sendBinary(message);
    }
  }
}
