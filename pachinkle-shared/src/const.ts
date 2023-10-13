export const NETWORK_PACKET_KEYS = {
  TYPE: "t",
  PEG_TRANSFORMS: "p",
  BALL_TRANSFORMS: "b",
} as const;

export const NETWORK_PACKET_TYPES = {
  TRANSFORM_UPDATE: 1,
  PEG_META: 2,
} as const;

type PacketTransformUpdate = {
  [NETWORK_PACKET_KEYS.TYPE]: typeof NETWORK_PACKET_TYPES.TRANSFORM_UPDATE;
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
};

type PacketPegMeta = {
  [NETWORK_PACKET_KEYS.TYPE]: typeof NETWORK_PACKET_TYPES.PEG_META;
};

export type NetworkPacket = PacketTransformUpdate | PacketPegMeta;

/**
 * Peg data structure is this:
 * [
 *   xPosition: Float64 value,
 *   yPosition: Float64 value,
 * ]
 */
export const PEG_FLAGS = {};
