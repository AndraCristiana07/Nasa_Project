const {data} = require('../routes/mission_data');

describe('Mission Trajectory Data', () => {

    test('should have 10 milestones for the full mission', () => {
        expect(data.milestones.length).toBe(10);
    });

    test('Day 1 should be labeled as Liftoff', () => {
        const day1 = data.milestones.find(m => m.day === 1);
        expect(day1.label).toBe("Liftoff");
    });

    test('Day 2 should be labeled as Trans-Lunar Injection', () => {
        const day2 = data.milestones.find(m => m.day === 2);
        expect(day2.label).toBe("Trans-Lunar Injection");
    });

    test('Day 3 should be labeled as Deep Space Interior', () => {
        const day3 = data.milestones.find(m => m.day === 3);
        expect(day3.label).toBe("Deep Space Interior");
    });

    test('Day 4 should be labeled as Optical Comms Demo', () => {
        const day4 = data.milestones.find(m => m.day === 4);
        expect(day4.label).toBe("Optical Comms Demo");
    });

    test('Day 5 should be labeled as Lunar Sphere of Influence', () => {
        const day5 = data.milestones.find(m => m.day === 5);
        expect(day5.label).toBe("Lunar Sphere of Influence");
    });

    test('Day 6 should be labeled as The Big Day (Furthest Point)', () => {
        const day6 = data.milestones.find(m => m.day === 6);
        expect(day6.label).toBe("The Big Day (Furthest Point)");
    });

    test('Day 7 should be labeled as Earthrise', () => {
        const day7 = data.milestones.find(m => m.day === 7);
        expect(day7.label).toBe("Earthrise");
    });

    test('Day 8 should be labeled as Media & Stowage', () => {
        const day8 = data.milestones.find(m => m.day === 8);
        expect(day8.label).toBe("Media & Stowage:");
    });

    test('Day 9 should be labeled as Return Preparation', () => {
        const day9 = data.milestones.find(m => m.day === 9);
        expect(day9.label).toBe("Return Preparation");
    });

    test('Day 10 should be labeled as Splashdown', () => {
        const day10 = data.milestones.find(m => m.day === 10);
        expect(day10.label).toBe("Splashdown");
    });
});