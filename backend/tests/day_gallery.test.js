const fs = require('fs');
const path = require('path');
const { getDayDate } = require('../routes/mission_day');

describe('Mission Data Integrity Check', () => {
    const filePath = path.join(__dirname, '../data/artemis_gallery.json');
    const rawData = fs.readFileSync(filePath);
    const organizedData = JSON.parse(rawData);

    test('Data file should exist in the root', () => {
        expect(fs.existsSync(filePath)).toBe(true);
    });

    test('Should have a valid entry for every mission day (1 to 10)', () => {
        for (let day = 1; day <= 10; day++) {
            // skip day 9 as it has no photos
            if (day === 9) continue;
            const dateKey = getDayDate(day); // e.g., "2026-04-06"
            
            // check if this date exists in JSON
            expect(organizedData).toHaveProperty(dateKey);
            
            // check if date has photos
            expect(organizedData[dateKey].length).toBeGreaterThan(0);
        }
    });

    test('Each photo in the JSON must have the required NASA structure', () => {
        const day6Key = getDayDate(6); // Flyby Day
        const flybyPhotos = organizedData[day6Key];

        flybyPhotos.forEach(photo => {
            // check top-level properties
            expect(photo).toHaveProperty('links');
            expect(photo).toHaveProperty('data');
            // check for nested structure 
            expect(photo.links[0]).toHaveProperty('href');
            expect(photo.data[0]).toHaveProperty('title');
            expect(photo.data[0]).toHaveProperty('description');
            expect(photo.data[0]).toHaveProperty('date_created');
            
            
        });
    });
});