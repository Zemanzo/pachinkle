import NetworkManager from "./networking";
import { type NetworkPacket } from "pachinkle-shared";

const networkManager = new NetworkManager();

export default class Renderer {
  private width: number;
  private height: number;
  private ctx: CanvasRenderingContext2D;
  private requestedFrame: number | undefined;
  private listenerRemovalFunctions: any[] = [];

  private balls: Float64Array = new Float64Array();
  private pegs: Float64Array = new Float64Array();

  constructor(public element: HTMLCanvasElement) {
    this.width = element.width = element.clientWidth;
    this.height = element.height = element.clientHeight;
    const ctx = element.getContext("2d");
    if (ctx === null) {
      console.error(this.element);
      throw new Error("Could not initialize renderer, ctx is null");
    }
    this.ctx = ctx;
    this.ctx.translate(this.width * 0.5, this.height * 0.5);
    this.ctx.scale(10, 10);
    this.ctx.save();
    this.render(performance.now());
    const fn = (evt: MouseEvent) => this.onClick(evt);
    element.addEventListener("click", fn, false);
    this.listenerRemovalFunctions.push(() => {
      element.removeEventListener("click", fn, false);
    });

    networkManager.messageCallback = (data: NetworkPacket) => {
      this.balls = data.b;
      this.pegs = data.p;
    };
  }

  private clearScreen() {
    this.ctx.restore();
    this.ctx.clearRect(
      -this.width * 0.5,
      -this.height * 0.5,
      this.width,
      this.height
    );
    this.ctx.save();
  }

  private render(timestamp: number) {
    this.clearScreen();
    this.ctx.scale(1, -1);
    for (let i = 0; i < this.balls.length * 0.5; i++) {
      const x = this.balls[i * 2];
      const y = this.balls[i * 2 + 1];
      this.ctx.fillStyle = `hsl(${(y * 3) % 360}, 100%, ${
        100 - (Math.abs(x) % 100)
      }%)`;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 0.5, 0, 2 * Math.PI);
      this.ctx.fill();
    }

    for (let i = 0; i < this.pegs.length * 0.5; i++) {
      const x = this.pegs[i * 2];
      const y = this.pegs[i * 2 + 1];
      this.ctx.fillStyle = "#333";
      this.ctx.beginPath();
      this.ctx.arc(x, y, 2, 0, 2 * Math.PI);
      this.ctx.fill();
    }

    this.requestedFrame = window.requestAnimationFrame((timestamp) =>
      this.render(timestamp)
    );
  }

  destroy() {
    if (this.requestedFrame) {
      window.cancelAnimationFrame(this.requestedFrame);
    }
    for (const removeListener of this.listenerRemovalFunctions) {
      removeListener();
    }
  }

  onClick(evt: MouseEvent) {
    const { x, y } = evt;
    const newBallPosition = new Float64Array([
      x - this.element.clientWidth * 0.5,
      y - this.element.clientHeight * 0.5,
    ]);
    networkManager.sendMessage(newBallPosition);
  }
}
