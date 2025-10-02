import { describe, it, expect, vi } from 'vitest';
import { MockGeolocateControl } from './MockGeolocateControl';
import type { MockGeolocateOptions } from './types';

describe('MockGeolocateControl (Simple Tests)', () => {
  describe('initialization', () => {
    it('should create control with required position', () => {
      const control = new MockGeolocateControl({
        position: { lng: 139.7, lat: 35.6 }
      });
      expect(control).toBeInstanceOf(MockGeolocateControl);
    });

    it('should create control with custom options', () => {
      const options: MockGeolocateOptions = {
        position: { lng: 139.7, lat: 35.6 },
        accuracy: 50,
        showAccuracyCircle: true,
        fitBoundsOptions: { maxZoom: 15 },
      };
      const control = new MockGeolocateControl(options);
      expect(control).toBeInstanceOf(MockGeolocateControl);
    });
  });

  describe('setPosition', () => {
    it('should accept position updates', () => {
      const control = new MockGeolocateControl({
        position: { lng: 139.7, lat: 35.6 }
      });

      // Should not throw
      expect(() => {
        control.setPosition({ lng: 140.7, lat: 36.6 });
      }).not.toThrow();
    });
  });

  describe('setAccuracy', () => {
    it('should accept accuracy updates', () => {
      const control = new MockGeolocateControl({
        position: { lng: 139.7, lat: 35.6 }
      });

      expect(() => {
        control.setAccuracy(50);
      }).not.toThrow();
    });
  });

  describe('setShowAccuracyCircle', () => {
    it('should accept show accuracy circle updates', () => {
      const control = new MockGeolocateControl({
        position: { lng: 139.7, lat: 35.6 }
      });

      expect(() => {
        control.setShowAccuracyCircle(true);
        control.setShowAccuracyCircle(false);
      }).not.toThrow();
    });
  });

  describe('setFitBoundsOptions', () => {
    it('should accept fit bounds options updates', () => {
      const control = new MockGeolocateControl({
        position: { lng: 139.7, lat: 35.6 }
      });

      expect(() => {
        control.setFitBoundsOptions({ maxZoom: 18, padding: 50 });
      }).not.toThrow();
    });
  });

  describe('event handling', () => {
    it('should support on/off for events', () => {
      const control = new MockGeolocateControl({
        position: { lng: 139.7, lat: 35.6 }
      });
      const handler = vi.fn();

      // Add event listener
      control.on('geolocate', handler);

      // Remove event listener
      control.off('geolocate', handler);

      // Should not throw
      expect(() => {
        control.on('error', handler);
        control.off('error', handler);
      }).not.toThrow();
    });
  });
});