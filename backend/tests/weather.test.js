const { calculateRisk } = require('../routes/weather');

describe('Space Weather Risk Calculation', () => {
    test('X-Class flares should return HIGH risk', () => {
        const mockFlares = [{ classType: 'X1.5' }];
        const result = calculateRisk(mockFlares);
        expect(result.risk).toBe('HIGH');
    });

    test('M-Class flares should return MEDIUM risk', () => {
        const mockFlares = [{ classType: 'M2.0' }];
        const result = calculateRisk(mockFlares);
        expect(result.risk).toBe('MEDIUM');
    });

    test('Empty flare list should return LOW risk', () => {
        const result = calculateRisk([]);
        expect(result.risk).toBe('LOW');
    });
});