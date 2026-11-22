/**
 * Palette tokens from visual-design-guide.md. Shared by the main site, the
 * HTML resume overlay, and the 3D scene so everything reads as one world.
 */
export const PALETTE = {
  sky: "#0B1426", // sky / deepest shadow
  mountainShadow: "#17263C",
  slate: "#344254", // rock
  snow: "#E6EDF5", // snow highlight
  ice: "#A9C7D8",
  amber: "#FBBF24", // warm windows
  brass: "#B88A45",
  rail: "#454B52", // iron
  timber: "#76543A",
} as const;

export type PaletteKey = keyof typeof PALETTE;
