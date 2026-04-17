import { convertCoords } from '../src/planets';
import { describe, it, expect } from 'vitest';

describe('Math Utilities', () => {
  it('converts lat/lng to 3D vectors correctly', () => {
    const vec = convertCoords(90, 0, 100); // North Pole
    expect(vec.y).toBeCloseTo(100);
    expect(vec.x).toBeCloseTo(0);
    expect(vec.z).toBeCloseTo(0);
  });
});