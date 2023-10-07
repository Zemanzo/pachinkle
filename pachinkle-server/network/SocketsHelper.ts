
import uWS, { RecognizedString, WebSocketBehavior } from "uWebSockets.js";

type GetHandlerParam<THandler extends "open" | "close" | "message"> =
  Parameters<Required<WebSocketBehavior<unknown>>[THandler]>;

const app = uWS.App();
const port = 3015;

export default class SocketsHelper {
  token?: uWS.us_listen_socket;
  openSockets: uWS.WebSocket<unknown>[] = [];

  constructor(public route: string, public options = {
		maxBackpressure: 64 * 1024
  }) {
    app.listen(port, (token) => {
      if (token) {
        this.token = token;
        console.info(`µWS: Listening to port ${port}`);
      } else {
        console.warn(`µWS: Failed to listen to port ${port}`);
      }
    });

    app.ws(`/ws${route}`,
        {
          ...options,
          open: this.open,
          message: this.message,
          close: this.close
        }
      )
  }

  private open(...[ws]: GetHandlerParam<"open">) {
		// Add socket to the list
		this.openSockets.push(ws);

		// Call open event
		// this.eventEmitter.emit("open", ws);
	};

	private close(...[ws, req]: GetHandlerParam<"close">) {
		// Call close event
		// this.eventEmitter.emit("close", ws, req);

		//Remove socket from the list
		this.openSockets.splice(this.openSockets.indexOf(ws), 1);
	};

	private message(...[ws, message, isBinary]: GetHandlerParam<"message">) {
		// Convert non-binary messages back to a string
		if (!isBinary) {
			// message = Buffer.from(message).toString("utf-8");
		}

		// Only call event if there is no backpressure built up
		if (ws.getBufferedAmount() < this.options.maxBackpressure) {
			// Call message event
			// this.eventEmitter.emit("message", ws, message, isBinary);
		} else {
			console.warn(`µWS: Too much backpressure has built up in the ${this.route} sockets, will not run associated functions until backpressure has been cleared.`);
		}
	};


	// Function that sends message data to all currently connected sockets
	emit(message: RecognizedString) {
		for (let i = 0; i < this.openSockets.length; i++) {
			if (this.openSockets[i].getBufferedAmount() < this.options.maxBackpressure) {
				this.openSockets[i].send(message, typeof message !== "string");
			} else {
				return false;
			}
		}
		return true;
	};

	closeAll() {
		for (let socket of this.openSockets) {
			// HTTP 503 Service Unavailable
			socket.end(503);
		}
	};

	stopListening() {
    if (this.token) {
      uWS.us_listen_socket_close(this.token);
    }
	};
}
