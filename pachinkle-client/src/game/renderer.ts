import NetworkManager from "./networking";

const networkManager = new NetworkManager();

export default class Renderer {
  private width: number;
  private height: number;
  private ctx: CanvasRenderingContext2D;
  private requestedFrame: number | undefined;

  constructor(public element: HTMLCanvasElement) {
    this.width = element.width = element.clientWidth;
    this.height = element.height = element.clientHeight;
    const ctx = element.getContext("2d");
    if (ctx === null) {
      console.error(this.element);
      throw new Error("Could not initialize renderer, ctx is null");
    }
    this.ctx = ctx;
    this.ctx.translate(this.width * .5, this.height * .5);
    this.ctx.scale(10, 10);
    this.ctx.save();
    this.render(performance.now());
  }

  private clearScreen() {
    this.ctx.restore();
    this.ctx.clearRect(-this.width * .5, -this.height * .5, this.width, this.height);
    this.ctx.save();
  }

  private render(timestamp: number) {
    this.clearScreen();
    this.ctx.scale(1, -1);
    this.ctx.fillStyle = "red";
    for (let i = 0; i < networkManager.physicsState.length * .5; i++) {
      const x = networkManager.physicsState[i * 2];
      const y = networkManager.physicsState[i * 2 + 1];
      this.ctx.beginPath();
      this.ctx.arc(x, y, .5, 0, 2 * Math.PI);
      this.ctx.fill();
    }

    this.requestedFrame = window.requestAnimationFrame((timestamp) => this.render(timestamp))
  }

  destroy() {
    if (this.requestedFrame) {
      window.cancelAnimationFrame(this.requestedFrame);
    }
  }
}

