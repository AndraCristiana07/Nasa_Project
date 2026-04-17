import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';
import axios from 'axios';
import { beforeEach, describe, it, vi, expect } from 'vitest';

// mock axios
vi.mock('axios');

axios.get.mockImplementation((url) => {

    const baseResponse = {
        data: {
            milestones: [{ day: 1, label: 'Launch' }],
            orion: [],
            moon: [],
            earth: [],
            sun: []
        }
    };

    if (url.includes('/api/mission/trajectory')) {
        return Promise.resolve({
            data: { milestones: [{ day: 1, label: 'Launch' }, { day: 6, label: 'The Big Day' }] }
        });
    }

    if (url.includes('/api/trajectory/')) {
        return Promise.resolve({ data: [{ x: 0, y: 0, z: 0 }] });
    }

    if (url.includes('/api/mission/day/')) {
        return Promise.resolve({
            data: { label: 'The Big Day', gallery: [{ url: 't.jpg', title: 'Science Officers' }] }
        });
    }

    // fallback to prevent undefined crashes
    return Promise.resolve({ baseResponse });
});
beforeEach(() => {
    vi.clearAllMocks();
});

describe('Frontend UI Tests', () => {
    it('renders Mission Timeline on load', async () => {

        render(<App />);

        const title = await screen.findByText(/Mission Timeline/i);
        expect(title).toBeInTheDocument();
    });

    it('switching to Sun View changes the UI', async () => {
        render(<App />);

        const sunBtn = await screen.findByTestId('focus-Sun');

        fireEvent.click(sunBtn);
        expect(sunBtn).toHaveTextContent('> Sun');

    });

    it('switching to Sun center changes the UI', async () => {
        render(<App />);

        const sunBtn = await screen.findByTestId('center-Sun');

        fireEvent.click(sunBtn);
        expect(sunBtn).toHaveTextContent('[ Sun ]');

    });

    it('clicking a timeline day opens gallery', async () => {
        render(<App />);

        const day6Btn = await screen.findByText(/Day 06/i);
        fireEvent.click(day6Btn);

        const modalTitle = await screen.findByText(/The Big Day/i);
        expect(modalTitle).toBeInTheDocument();
        const photoTitle = await screen.findByText(/Science Officers/i);
        expect(photoTitle).toBeInTheDocument();

    });

});

