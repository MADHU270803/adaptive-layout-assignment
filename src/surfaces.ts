// A surface profile describes one place an ad might be shown
export interface SurfaceProfile {
  id: string;
  width: number;
  height: number;
  minTapTarget?: number;
  minTextSize?: number;
  touchOnly?: boolean;
  viewingDistance?: "near" | "far";
}
export const mobilePortrait: SurfaceProfile = {
  id: "mobile-portrait",
  width: 320,
  height: 480,
  minTapTarget: 44,
};
export const mobileLandscape: SurfaceProfile = {
  id: "mobile-landscape",
  width: 480,
  height: 320,
  minTapTarget: 44,
};

export const broadcastLowerThird: SurfaceProfile = {
  id: "broadcast-lower-third",
  width: 1920,
  height: 250,
  minTextSize: 32,
  viewingDistance: "far",
};

export const retailKiosk: SurfaceProfile = {
  id: "retail-kiosk",
  width: 1080,
  height: 1080,
  minTapTarget: 60,
  touchOnly: true,
};
export const allSurfaces: SurfaceProfile[] = [
  mobilePortrait,
  mobileLandscape,
  broadcastLowerThird,
  retailKiosk,
];