// The kind of content this element holds
export type ElementType = "text" | "image" | "button";

// The purpose this element plays in the ad
export type ElementRole = "primary" | "hero" | "action" | "branding" | "secondary";

// One element inside an ad spec
export interface AdElement {
  id: string;
  type: ElementType;
  role: ElementRole;
  priority: number;
}
// A full ad: just a list of elements
export interface AdSpec {
  elements: AdElement[];
}

// Helper function to create an ad spec
export function defineAd(spec: AdSpec): AdSpec {
  return spec;
}
export const productAd = defineAd({
  elements: [
    { id: "headline", type: "text", role: "primary", priority: 1 },
    { id: "product-image", type: "image", role: "hero", priority: 1 },
    { id: "cta", type: "button", role: "action", priority: 2 },
    { id: "price", type: "text", role: "secondary", priority: 2 },
    { id: "logo", type: "image", role: "branding", priority: 3 },
  ],
});
const badTest: AdElement = { id: "x", type: "text", role: "featured", priority: 1 };