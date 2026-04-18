const request = require('supertest');
const app = require('../app');
const fs = require('fs');

jest.mock('fs');

describe('Archive Integration Test', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('successfully flattens and returns the mission archive', async () => {
        const mockData = {
            "2026-04-01": [{
                links: [{ href: 'url1' }],
                data: [{ title: 'T1', description: 'D1' }]
            }],
            "2026-04-02": [{
                links: [{ href: 'url2' }],
                data: [{ title: 'T2', description: 'D2' }]
            }]
        };

        // mock file reading and the existance of it
        fs.readFileSync.mockReturnValue(JSON.stringify(mockData));
        fs.existsSync.mockReturnValue(true);

        const res = await request(app).get('/api/mission/archive');

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(2);

        // verify the mapping logic
        expect(res.body[0]).toMatchObject({
            url: 'url1',
            title: 'T1'
        });
    });

    it('should return 500 on file error', async () => {
        fs.readFileSync.mockImplementation(() => {
            throw new Error("File read error");
        });

        const res = await request(app).get('/api/mission/archive');

        expect(res.statusCode).toBe(500);
        expect(res.body.error).toBe("Failed to fetch archive");
    });
});
