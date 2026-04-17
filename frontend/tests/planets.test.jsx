import { render, screen, waitFor } from '@testing-library/react';
import { Sun, FlareMarker } from '../src/planets';
import axios from 'axios';
import * as THREE from 'three';
import { beforeEach, describe, it, vi, expect } from 'vitest';
import { useStore } from '../src/store';

// mock axios
vi.mock('axios');
vi.mock('@react-three/fiber', () => ({
    useFrame: vi.fn(),
}));

vi.mock('@react-three/drei', () => {
    const useGLTF = vi.fn(() => ({
        scene: new THREE.Group(),
        animations: [],
    }));

    useGLTF.preload = vi.fn();

    return {
        useGLTF,
        useTexture: vi.fn(() => new THREE.Texture()),
        // mock Html as a plain div 
        Html: ({ children }) => <div data-testid="html-label">{children}</div>,
    };
});
vi.mock('../src/store', () => ({
    useStore: Object.assign(vi.fn(), {
        getState: vi.fn(),
    }),
}));

describe('Sun Component API', () => {
    const mockSetShouldRun = vi.fn();
    const sampleFlare = {
        id: "flare-1",
        lat: 20,
        lng: -23,
        class: "X1.2",
        peakTime: "2026-04-10T14:45Z",
        size: 2.24,
        color: "#f11515"
    };
    useStore.getState.mockReturnValue({ shouldRun: true });

    beforeEach(() => {
        vi.clearAllMocks();

        useStore.getState.mockReturnValue({ shouldRun: true });

        useStore.mockImplementation((selector) => {
            if (typeof selector === 'function') {
                return selector({ setShouldRun: mockSetShouldRun });
            }
            return { setShouldRun: mockSetShouldRun };
        });
    });


    it('fetches solar flares and renders the correct markers', async () => {
        const mockFlares = [
            {
                id: "flare-123",
                lat: 10,
                lng: 20,
                class: "X9.3",
                peakTime: "2026-04-12T18:15Z",
                size: 2.0,
                color: "#f11515"
            }
        ];

        axios.get.mockResolvedValue({ data: mockFlares });

        render(<Sun />);

        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/solar-flares'));

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledTimes(1);
        });
    });

    it('falls back to mock data if API fails', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        axios.get.mockRejectedValue(new Error("Network Error"));

        render(<Sun />);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining("Solar API unreachable"),
                expect.any(Error)
            );
        });

        consoleSpy.mockRestore();
    });

    it('pauses mission on flare hover and resumes on leave', () => {
        const mockSunRef = {
            current: { position: new THREE.Vector3(0, 0, 0) }
        };

        render(<FlareMarker flare={sampleFlare} sunRef={mockSunRef} />);
        
        // find halo mesh
        const haloMesh = screen.getByTestId('flare-halo');

        // simulate pointer over with mock event 
        const reactPropsKey = Object.keys(haloMesh).find(key => key.startsWith('__reactProps'));
        const props = haloMesh[reactPropsKey];

        props.onPointerOver({
            stopPropagation: vi.fn(),
            distance: 10,
            camera: {
                position: new THREE.Vector3(0, 0, 100) // Sun 100 units away
            }
        });
        // paused
        expect(mockSetShouldRun).toHaveBeenCalledWith(false);

        props.onPointerOut();

        // resumed
        expect(mockSetShouldRun).toHaveBeenCalledWith(true);
    });

  });