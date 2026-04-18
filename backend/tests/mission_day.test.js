const { getDayDate } = require('../routes/mission_day');
const request = require('supertest');
const app = require('../app');
const fs = require('fs');

jest.mock('axios');

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

    test('Invalid day should return 404', async () => {
        const response = await request(app).get('/api/mission/day/50');
        expect(response.statusCode).toBe(404);
        expect(response.body.error).toContain('No photos found');
    });
    test('Gallery items should have the correct structure', async () => {
        const response = await request(app).get('/api/mission/day/1');
        if (response.statusCode === 200) {
            const firstItem = response.body.gallery[0];
            expect(firstItem).toHaveProperty('url');
            expect(firstItem).toHaveProperty('title');
            expect(firstItem).toHaveProperty('description');
            expect(firstItem).toHaveProperty('date');
            expect(firstItem).toHaveProperty('type');
        }
    });

    test('Should return 500 if the JSON file is missing', async () => {
        jest.spyOn(fs, 'existsSync').mockReturnValue(false);
        const response = await request(app).get('/api/mission/day/1');
        expect(response.statusCode).toBe(500);
        expect(response.body.error).toBe("Mission data file missing");
        fs.existsSync.mockRestore(); //cleanup
    });
});
