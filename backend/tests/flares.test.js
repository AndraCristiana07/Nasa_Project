const request = require('supertest');
const axios = require('axios');
const app = require('../app'); 
const { cache } = require('../routes/flares');

jest.mock('axios');

describe('Solar Flare API Integration', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
        // clear the cache
        for (const key in cache) delete cache[key];
    });

    it('should return mapped flares from NASA', async () => {
        const mockNASAData = [{
            sourceLocation: 'N20W23',
            classType: 'X1.0',
            flrID: '123',
            peakTime: '2026-04-02T00:00Z'
        }];

        axios.get.mockResolvedValue({ data: mockNASAData });

        const res = await request(app).get('/api/solar-flares');

        expect(res.statusCode).toBe(200);
        expect(res.body[0]).toMatchObject({
            lat: 20,
            lng: -23,
            color: '#f11515' // X-class color
        });
    });

    it('should handle NASA API errors', async () => {
        axios.get.mockRejectedValue(new Error('NASA down'));

        const res = await request(app).get('/api/solar-flares');

        expect(res.statusCode).toBe(500);
        expect(res.body.error).toContain('Failed to fetch');
    });

    it('should filter out flares with missing data', async () => {
        const mockNASAData = [
            { sourceLocation: '', classType: 'M1.0' }, 
            { sourceLocation: 'S10E10', classType: 'X1.0' }
        ];

        axios.get.mockResolvedValue({ data: mockNASAData });

        const res = await request(app).get('/api/solar-flares');

        expect(res.body.length).toBe(1);
        expect(res.body[0].lat).toBe(-10);
    });
});