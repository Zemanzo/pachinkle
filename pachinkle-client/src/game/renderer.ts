import NetworkManager from "./networking";
import { type NetworkPacket } from "pachinkle-shared";

type PegMetaShapes =
  | {
      shape: "ball";
      shapeArgs: [number];
    }
  | {
      shape: "cuboid";
      shapeArgs: [number, number];
    };

type PegMeta = PegMetaShapes & {
  variant: "default" | "objective" | "power" | "points";
  isHit: boolean;
  isDestroyed: boolean;
};

const networkManager = new NetworkManager();

const baseColors = {
  default: "#09e",
  objective: "#f90",
  power: "#090",
  points: "#909",
};
const highlightColors = {
  default: "#6bf",
  objective: "#fb6",
  power: "#2a2",
  points: "#a2a",
};

export default class Renderer {
  private width: number;
  private height: number;
  private ctx: CanvasRenderingContext2D;
  private requestedFrame: number | undefined;
  private listenerRemovalFunctions: any[] = [];
  private resizeObserver: ResizeObserver;

  private ballTransforms: Float64Array = new Float64Array();
  private pegTransforms: Float64Array = new Float64Array();
  private pegMeta: Array<PegMeta> = [];
  private mouse: { x: number; y: number };
  private endPoint: { x: number; y: number } = { x: 0, y: 4 };

  constructor(public element: HTMLCanvasElement) {
    this.width = element.width = element.clientWidth;
    this.height = element.height = element.clientHeight;
    this.mouse = { x: this.width * 0.5, y: this.height * 0.5 };
    const ctx = element.getContext("2d");
    if (ctx === null) {
      console.error(this.element);
      throw new Error("Could not initialize renderer, ctx is null");
    }
    this.ctx = ctx;
    this.ctx.translate(this.width * 0.5, this.height * 0.5);
    this.ctx.scale(100, 100);
    this.ctx.save();
    this.render(performance.now());

    // Add listeners
    const clickFn = (evt: MouseEvent) => this.onClick(evt);
    element.addEventListener("click", clickFn, false);
    const mousemoveFn = (evt: MouseEvent) => this.onMousemove(evt);
    element.addEventListener("mousemove", mousemoveFn, false);

    // Add listener cleanup
    this.listenerRemovalFunctions.push(() => {
      element.removeEventListener("click", clickFn, false);
    });

    networkManager.messageCallback = (data: NetworkPacket) => {
      this.ballTransforms = data.b ?? this.ballTransforms;
      this.pegTransforms = data.p ?? this.pegTransforms;
      this.pegMeta = data.m ?? this.pegMeta;
    };

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          this.ctx.restore();
          this.element.width = this.width = entry.contentRect.width;
          this.element.height = this.height = entry.contentRect.height;
          this.ctx.translate(this.width * 0.5, this.height * 0.5);
          this.ctx.scale(100, 100);
          this.ctx.save();
        }
      }
    });
    this.resizeObserver.observe(this.element);
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

  private render(frameTimestamp: number) {
    this.clearScreen();
    this.ctx.fillStyle = "#555";
    this.ctx.fillRect(-10, 6, 20, 2); // bottom
    this.ctx.fillRect(-10, -8, 20, 2); // top
    this.ctx.fillRect(-26, -10, 18, 20); // left
    this.ctx.fillRect(8, -10, 18, 20); // right
    this.ctx.scale(1, -1);
    this.ctx.fillStyle = "white";
    for (let i = 0; i < this.ballTransforms.length * 0.5; i++) {
      const x = this.ballTransforms[i * 2];
      const y = this.ballTransforms[i * 2 + 1];
      this.ctx.beginPath();
      this.ctx.arc(x, y, 0.15, 0, 2 * Math.PI);
      this.ctx.fill();
    }

    for (let i = 0; i < this.pegMeta.length; i++) {
      const peg = this.pegMeta[i];
      const x = this.pegTransforms[i * 2];
      const y = this.pegTransforms[i * 2 + 1];
      this.ctx.fillStyle = peg.isDestroyed
        ? "transparent"
        : this.getPegColor(peg);
      if (peg.shape === "ball") {
        this.ctx.beginPath();
        this.ctx.arc(x, y, peg.shapeArgs[0], 0, 2 * Math.PI);
        this.ctx.fill();
      } else {
        const [halfWidth, halfHeight] = peg.shapeArgs;
        this.ctx.fillRect(
          x - halfWidth,
          y - halfHeight,
          halfWidth * 2,
          halfHeight * 2
        );
      }
    }

    // Calculate the distance between the fixed point and the mouse.
    const distance = Math.sqrt(
      (this.mouse.x - 0) ** 2 + (this.mouse.y - 6) ** 2
    );

    // If the distance is greater than 100 pixels, limit the line length to 100 pixels.
    const lineLength = 2;

    // Calculate the coordinates of the end point of the line.
    this.endPoint.x = 0 + (lineLength * (this.mouse.x - 0)) / distance;
    this.endPoint.y = 6 + (lineLength * (this.mouse.y - 6)) / distance;

    this.ctx.beginPath();
    this.ctx.moveTo(0, 6);
    this.ctx.lineTo(this.endPoint.x, this.endPoint.y);
    this.ctx.lineWidth = 0.1;
    this.ctx.strokeStyle = "white";
    this.ctx.lineCap = "round";
    this.ctx.stroke();

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
    this.resizeObserver.disconnect();
  }

  private onClick(evt: MouseEvent) {
    const newBallPosition = new Float64Array([
      this.endPoint.x,
      this.endPoint.y,
      Math.atan2(this.endPoint.y - 6, this.endPoint.x - 0),
    ]);
    networkManager.sendMessage(newBallPosition);
  }

  private onMousemove(evt: MouseEvent) {
    const { x, y } = evt;
    this.mouse = {
      x: (x - this.element.clientWidth * 0.5) * 0.01,
      y: -(y - this.element.clientHeight * 0.5) * 0.01,
    };
  }

  private getPegColor(peg: PegMeta) {
    if (peg.isDestroyed) {
      return "transparent";
    }
    if (!peg.isHit) {
      return baseColors[peg.variant];
    }
    return highlightColors[peg.variant];
  }

  private getAngle(ax: number, ay: number, bx: number, by: number) {
    var dy = by - ay;
    var dx = bx - ax;
    var theta = Math.atan2(dy, dx); // range (-PI, PI]
    theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
    //if (theta < 0) theta = 360 + theta; // range [0, 360)
    return theta;
  }
}
