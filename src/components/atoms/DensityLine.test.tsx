import { describe, expect, it } from 'vitest';

import { getColorStops } from './DensityLine';

describe('DensityLine', () => {
  describe('getColorStops', () => {
    it('should return an empty array if there are no periods', () => {
      expect(getColorStops([], 0, 10)).toEqual([]);
    });

    it('should return an empty array if all periods are outside the timeline', () => {
      expect(
        getColorStops([{ start: 20, end: 30, density: 0.5 }], 0, 10),
      ).toEqual([]);
    });

    it('should return a single pair of color stops if there is only one period', () => {
      expect(
        getColorStops([{ start: 0, end: 10, density: 0.5 }], 0, 10),
      ).toEqual(['rgba(0, 0, 0, 1) 1%', 'rgba(0, 0, 0, 1) 99%']);
    });
  });
});
