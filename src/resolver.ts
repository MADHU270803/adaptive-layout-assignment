// The final position/size we calculate for one element
export interface ResolvedElement {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
}

import type { AdSpec, AdElement } from "./spec";
import type { SurfaceProfile } from "./surfaces";

function getNaturalSize(
  element: AdElement,
  surface: SurfaceProfile,
  isWide: boolean
): { width: number; height: number } {
  const tapTarget = surface.minTapTarget ?? 32;
  const textSize = surface.minTextSize ?? 16;

  switch (element.role) {
    case "primary":
      return isWide
        ? { width: surface.width * 0.3, height: surface.height }
        : { width: surface.width, height: textSize * 2 };
    case "hero":
      return isWide
        ? { width: surface.width * 0.3, height: surface.height }
        : { width: surface.width, height: surface.height * 0.4 };
    case "action":
      return { width: Math.max(120, tapTarget * 2), height: tapTarget };
    case "secondary":
      return isWide
        ? { width: surface.width * 0.15, height: surface.height }
        : { width: surface.width * 0.5, height: textSize * 1.5 };
    case "branding":
      return { width: 80, height: 40 };
  }
}

// Places a group of elements stacked vertically inside one column of a
// fixed width, starting at the given horizontal offset. Uses the same
// priority-ordered fit-or-drop rule as the single-column resolver below.
function placeColumn(
  elements: AdElement[],
  surface: SurfaceProfile,
  columnWidth: number,
  xOffset: number
): ResolvedElement[] {
  const results: ResolvedElement[] = [];
  let currentY = 0;
  let remainingHeight = surface.height;

  for (const element of elements) {
    const natural = getNaturalSize(element, surface, false);

    if (natural.height > remainingHeight) {
      results.push({
        id: element.id,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        visible: false,
      });
      continue;
    }

    const clampedWidth = Math.min(natural.width, columnWidth);
    const clampedHeight = Math.min(natural.height, surface.height);

    results.push({
      id: element.id,
      x: xOffset,
      y: currentY,
      width: clampedWidth,
      height: clampedHeight,
      visible: true,
    });

    currentY += clampedHeight;
    remainingHeight -= clampedHeight;
  }

  return results;
}

// Roughly square surfaces get a genuinely different 2D composition instead
// of reusing the single-column stack: primary content (headline/hero) in a
// left column, secondary content (CTA/price/branding) in a right column.
function resolveGridLayout(
  sortedElements: AdElement[],
  surface: SurfaceProfile
): ResolvedElement[] {
  const leftColumnWidth = surface.width * 0.6;
  const rightColumnWidth = surface.width - leftColumnWidth;

  const leftElements = sortedElements.filter(
    (el) => el.role === "primary" || el.role === "hero"
  );
  const rightElements = sortedElements.filter(
    (el) => el.role !== "primary" && el.role !== "hero"
  );

  return [
    ...placeColumn(leftElements, surface, leftColumnWidth, 0),
    ...placeColumn(rightElements, surface, rightColumnWidth, leftColumnWidth),
  ];
}

export function resolveLayout(
  spec: AdSpec,
  surface: SurfaceProfile
): ResolvedElement[] {
  const sortedElements = [...spec.elements].sort(
    (a, b) => a.priority - b.priority
  );

  const aspectRatio = surface.width / surface.height;
  const isWide = aspectRatio > 1.2;
  const isSquarish = aspectRatio >= 0.8 && aspectRatio <= 1.2;

  if (isSquarish) {
    return resolveGridLayout(sortedElements, surface);
  }

  const results: ResolvedElement[] = [];
  let currentPos = 0;
  let remainingSpace = isWide ? surface.width : surface.height;

  for (const element of sortedElements) {
    const natural = getNaturalSize(element, surface, isWide);
    const neededSpace = isWide ? natural.width : natural.height;

    if (neededSpace > remainingSpace) {
      results.push({
        id: element.id,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        visible: false,
      });
      continue;
    }

    const clampedWidth = isWide
      ? natural.width
      : Math.min(natural.width, surface.width);
    const clampedHeight = isWide
      ? Math.min(natural.height, surface.height)
      : natural.height;

    results.push({
      id: element.id,
      x: isWide ? currentPos : 0,
      y: isWide ? 0 : currentPos,
      width: clampedWidth,
      height: clampedHeight,
      visible: true,
    });

    currentPos += neededSpace;
    remainingSpace -= neededSpace;
  }

  return results;
}