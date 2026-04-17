const axios = require('axios');
const { router, data: cache } = require('../routes/trajectory'); 

jest.mock('axios');
jest.mock('fs');

describe('Trajectory Route Handler', () => {
    // find the specific route handler 
    const getHandler = (path) => {
        const route = router.stack.find(s => s.route && s.route.path === path);
        return route.route.stack[0].handle;
    };

    let handler;
    let mockReq;
    let mockRes;

    beforeEach(() => {
        jest.clearAllMocks();
        // clear the cache
        for (const key in cache) delete cache[key];

        handler = getHandler('/api/trajectory/:obj/:center');

        // mock Request and Response
        mockReq = {
            params: { obj: 'moon', center: 'earth' }
        };

        mockRes = {
            json: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis()
        };
    });

    it('successfully fetches and parses data', async () => {
        const mockNASAData = `$$SOE\nX = 100 Y = 200 Z = 300\n$$EOE`;
        axios.get.mockResolvedValue({ data: mockNASAData });

        await handler(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith([
            { x: '100', y: '200', z: '300' }
        ]);

        // verify cache was populated
        expect(cache['moon-earth']).toBeDefined();
    });

    it('returns 500 status when axios fails', async () => {
        axios.get.mockRejectedValue(new Error('Network Fail'));

        await handler(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send).toHaveBeenCalledWith('Network Fail');
    });

    it('uses the cache and does not call axios again', async () => {
        // manually populate cache 
        cache['moon-earth'] = [{ x: 1, y: 1, z: 1 }];

        await handler(mockReq, mockRes);

        // return cache immediately
        expect(mockRes.json).toHaveBeenCalledWith([{ x: 1, y: 1, z: 1 }]);
        
        // axios should NOT have been called
        expect(axios.get).not.toHaveBeenCalled();
    });
});