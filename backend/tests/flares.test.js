const { router } = require('../routes/flares'); 

const mockFlareLogic = (flare) => {
    const loc = flare.sourceLocation;
    if (!loc) return null;
    const match = loc.match(/([NS])(\d+)([EW])(\d+)/);
    if (!match) return null;

    const lat = match[1] === 'N' ? parseInt(match[2]) : -parseInt(match[2]);
    const lng = match[3] === 'E' ? parseInt(match[4]) : -parseInt(match[4]);

    const classMagnitude = parseFloat(flare.classType.substring(1)) || 1.0;
    let baseMultiplier = 0.5;
    if (flare.classType.startsWith('M')) baseMultiplier = 1.0;
    else if (flare.classType.startsWith('X')) baseMultiplier = 2.0;

    const size = baseMultiplier * (1 + classMagnitude / 10);
    return { lat, lng, size, class: flare.classType };
};

describe('Solar Flare API Logic', () => {

    test('Should parse N20W23 to +20 lat and -23 lng', () => {
        const sample = { sourceLocation: 'N20W23', classType: 'X1.0' };
        const result = mockFlareLogic(sample);
        expect(result.lat).toBe(20);
        expect(result.lng).toBe(-23);
    });

    test('Should parse S15E40 to -15 lat and +40 lng', () => {
        const sample = { sourceLocation: 'S15E40', classType: 'M1.0' };
        const result = mockFlareLogic(sample);
        expect(result.lat).toBe(-15);
        expect(result.lng).toBe(40);
    });

    test('X-Class flares should be significantly larger than C-Class', () => {
        const flareC = mockFlareLogic({ sourceLocation: 'N01E01', classType: 'C1.0' });
        const flareX = mockFlareLogic({ sourceLocation: 'N01E01', classType: 'X1.0' });
        const flareM = mockFlareLogic({ sourceLocation: 'N01E01', classType: 'M1.0' });
        expect(flareX.size).toBeGreaterThan(flareC.size);
        expect(flareX.size).toBeGreaterThan(flareM.size);

    });

    test('Magnitude should influence size (X2.0 > X1.0)', () => {
        const x1 = mockFlareLogic({ sourceLocation: 'N01E01', classType: 'X1.0' });
        const x2 = mockFlareLogic({ sourceLocation: 'N01E01', classType: 'X2.0' });
        expect(x2.size).toBeGreaterThan(x1.size);
    });
});