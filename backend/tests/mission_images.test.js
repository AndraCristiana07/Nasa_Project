const { getArchive } = require('../routes/mission_images');
const fs = require('fs');

jest.mock('fs');

describe('Archive Logic Test', () => {
    let req, res;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(), 
            json: jest.fn().mockReturnThis()
        };
    });

    it('should flatten multiple days of data into one list', () => {
        const mockData = {
            "Day 1": [{ links: [{href: 'url1'}], data: [{title: 'T1', description: 'D1'}] }],
            "Day 2": [{ links: [{href: 'url2'}], data: [{title: 'T2', description: 'D2'}] }]
        };

        fs.readFileSync.mockReturnValue(JSON.stringify(mockData));

        getArchive(req, res);

        // Vvrify the response is a flattened array of 2 items
        const responseData = res.json.mock.calls[0][0];
        expect(responseData.length).toBe(2);
        expect(responseData[0].title).toBe('T1');
        expect(responseData[1].title).toBe('T2');
    });

    it('should return 500 on file error', () => {
        fs.readFileSync.mockImplementation(() => { throw new Error(); });

        getArchive(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch archive" });
    });
});