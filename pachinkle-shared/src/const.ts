export const NETWORK_PACKET_KEYS = {
  PEGS: "p",
  BALLS: "b",
} as const;

export type NetworkPacket = {
  [NETWORK_PACKET_KEYS.BALLS]: Float64Array;
  [NETWORK_PACKET_KEYS.PEGS]: Float64Array;
};
