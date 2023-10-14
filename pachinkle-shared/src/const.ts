export const NETWORK_PACKET_KEYS = {
  PEG_TRANSFORMS: "p",
  PEG_META: "m",
  BALL_TRANSFORMS: "b",
} as const;

export type NetworkPacket = Partial<{
  /**
   * 2 entries per ball.
   * [BallAXPos, BallAYPos, BallBXPos...]
   */
  [NETWORK_PACKET_KEYS.BALL_TRANSFORMS]: Float64Array;
  /**
   * 2 entries per peg.
   * [PegAXPos, PegAYPos, PegBXPos...]
   */
  [NETWORK_PACKET_KEYS.PEG_TRANSFORMS]: Float64Array;
  [NETWORK_PACKET_KEYS.PEG_META]: any;
}>;
