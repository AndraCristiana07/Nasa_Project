const axios = require('axios');
const { data: cache } = require('../routes/trajectory');
const request = require('supertest');
const app = require('../app');

jest.mock('axios');
jest.mock('fs');

describe('Trajectory Route Handler', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        // clear the cache
        for (const key in cache) delete cache[key];

    });

    it('successfully fetches and parses data', async () => {
        const mockNASAData = `$$SOE\nX = 100 Y = 200 Z = 300\n$$EOE`;
        axios.get.mockResolvedValue({ data: mockNASAData });

        const res = await request(app).get('/api/trajectory/moon/earth');

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([
            { x: '100', y: '200', z: '300' }
        ]);

        // verify cache was populated
        expect(cache['moon-earth']).toBeDefined();
    });

    it('returns 500 status when axios fails', async () => {
        axios.get.mockRejectedValue(new Error('Network Fail'));

        const res = await request(app).get('/api/trajectory/moon/earth');

        expect(res.statusCode).toBe(500);
        expect(res.text).toBe('Network Fail');
    });

    it('uses the cache and does not call axios again', async () => {
        // populate cache 
        cache['moon-earth'] = [{ x: 1, y: 1, z: 1 }];

        const res = await request(app).get('/api/trajectory/moon/earth');

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([{ x: 1, y: 1, z: 1 }]);

        expect(axios.get).not.toHaveBeenCalled();
    });
});
