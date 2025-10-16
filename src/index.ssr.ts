// SSR-safe stub for server-side rendering environments
// This file is used during SSR to prevent errors from browser-only dependencies

import type { ManualGeolocateControlOptions } from "./types";

/**
 * SSR-safe stub of ManualGeolocateControl
 * This class is only used during server-side rendering and should never be instantiated.
 * The actual browser implementation will be used at runtime.
 */
export class ManualGeolocateControl {
  constructor(_options: ManualGeolocateControlOptions) {
    if (typeof window === "undefined") {
      // Running in SSR environment - this is expected
      // The actual control will be instantiated in the browser
    } else {
      throw new Error(
        "SSR stub should not be used in browser environment. Please check your build configuration.",
      );
    }
  }

  onAdd(): HTMLElement {
    throw new Error("ManualGeolocateControl cannot be used during SSR");
  }

  onRemove(): void {
    throw new Error("ManualGeolocateControl cannot be used during SSR");
  }

  getDefaultPosition(): string {
    return "top-right";
  }

  setPosition(_position: { lng: number; lat: number }): void {
    throw new Error("ManualGeolocateControl cannot be used during SSR");
  }

  trigger(): void {
    throw new Error("ManualGeolocateControl cannot be used during SSR");
  }
}

export type { ManualGeolocateControlOptions };
