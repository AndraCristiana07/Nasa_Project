const { calculateFlareData } = require('../routes/flares'); 

describe('Solar Flare API Logic', () => {

    test('Should parse N20W23 to +20 lat and -23 lng', () => {
        const sample = { sourceLocation: 'N20W23', classType: 'X1.0' };
        const result = calculateFlareData(sample);
        expect(result.lat).toBe(20);
        expect(result.lng).toBe(-23);
    });

    test('Should parse S15E40 to -15 lat and +40 lng', () => {
        const sample = { sourceLocation: 'S15E40', classType: 'M1.0' };
        const result = calculateFlareData(sample);
        expect(result.lat).toBe(-15);
        expect(result.lng).toBe(40);
    });

    test('X-Class flares should be significantly larger than C-Class', () => {
        const flareC = calculateFlareData({ sourceLocation: 'N01E01', classType: 'C1.0' });
        const flareX = calculateFlareData({ sourceLocation: 'N01E01', classType: 'X1.0' });
        const flareM = calculateFlareData({ sourceLocation: 'N01E01', classType: 'M1.0' });
        expect(flareX.size).toBeGreaterThan(flareC.size);
        expect(flareX.size).toBeGreaterThan(flareM.size);

    });

    test('Magnitude should influence size (X2.0 > X1.0)', () => {
        const x1 = calculateFlareData({ sourceLocation: 'N01E01', classType: 'X1.0' });
        const x2 = calculateFlareData({ sourceLocation: 'N01E01', classType: 'X2.0' });
        expect(x2.size).toBeGreaterThan(x1.size);
    });
});
