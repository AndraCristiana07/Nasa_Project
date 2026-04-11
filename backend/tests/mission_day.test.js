const { getDayDate } = require('../routes/mission_day');

describe('Artemis II Mission Timeline', () => {
    test('Day 1 should  (April 1)', () => {
        expect(getDayDate(1)).toBe('2026-04-01');
    });

    test('Day 6 should (April 6)', () => {
        expect(getDayDate(6)).toBe('2026-04-06');
    });

    test('Day 9 should be (April 9)', () => {
        expect(getDayDate(9)).toBe('2026-04-09');
    });
});