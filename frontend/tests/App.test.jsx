import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "../src/App";
import axios from "axios";
import { beforeEach, describe, it, vi, expect } from "vitest";
import { useStore } from "../src/store";
import userEvent from "@testing-library/user-event";

// mock axios
vi.mock("axios");

axios.get.mockImplementation((url) => {
  const baseResponse = {
    data: {
      milestones: [{ day: 1, label: "Launch" }],
      orion: [],
      moon: [],
      earth: [],
      sun: [],
    },
  };

  if (url.includes("/api/mission/data")) {
    return Promise.resolve({
      data: {
        milestones: [
          { day: 1, label: "Launch" },
          { day: 6, label: "The Big Day" },
        ],
      },
    });
  }

  if (url.includes("/api/trajectory/")) {
    return Promise.resolve({ data: [{ x: 0, y: 0, z: 0 }] });
  }

  if (url.includes("/api/mission/day/")) {
    return Promise.resolve({
      data: {
        label: "The Big Day",
        gallery: [{ url: "t.jpg", title: "Science Officers" }],
      },
    });
  }

  if (url.includes("/api/mission/archive")) {
    return Promise.resolve({ data: [] });
  }

  // fallback to prevent undefined crashes
  return Promise.resolve({ baseResponse });
});

beforeEach(() => {
  vi.clearAllMocks();
  useStore.setState({
    // 1. The big ones
    globalSearchQuery: "",
    isSearchOpen: false,
    isGalleryOpen: false,

    isOrbitLoading: false,
    shouldRun: true,

    showLabels: true,
    showTrajectories: true,
    progress: 0,
  });
});

describe("Frontend UI Tests", () => {
  it("renders Mission Timeline on load", async () => {
    render(<App />);

    const title = await screen.findByText(/Mission Timeline/i);
    expect(title).toBeInTheDocument();
  });

  it("switching to Sun View changes the UI", async () => {
    render(<App />);

    const sunBtn = await screen.findByTestId("focus-Sun");

    fireEvent.click(sunBtn);
    expect(sunBtn).toHaveTextContent("> Sun");
  });

  it("switching to Sun center changes the UI", async () => {
    render(<App />);

    const sunBtn = await screen.findByTestId("center-Sun");

    fireEvent.click(sunBtn);
    await waitFor(() => {
      expect(sunBtn).toHaveTextContent("[ Sun ]");
    });
  });

  it("clicking a timeline day opens gallery", async () => {
    render(<App />);

    const day6Btn = await screen.findByText(/Day 06/i);
    fireEvent.click(day6Btn);

    const modalTitle = await screen.findByText(/The Big Day/i);
    expect(modalTitle).toBeInTheDocument();
    const photoTitle = await screen.findByText(/Science Officers/i);
    expect(photoTitle).toBeInTheDocument();
  });

  it("updates global search query when Enter is pressed", async () => {
    // mock API
    axios.get.mockResolvedValue({ data: { milestones: [] } });

    const user = userEvent.setup();
    render(<App />);

    const input = await screen.findByTestId("search-input");

    // type and enter
    await user.type(input, "Artemis{enter}");

    // verify if store updated
    await waitFor(
      () => {
        const state = useStore.getState();
        expect(state.globalSearchQuery).toBe("Artemis");
        expect(state.isSearchOpen).toBe(true);
      },
      { timeout: 2000 },
    );
  });

  it("clicking setting button opens overlay", async () => {
    render(<App />);

    const settingsBtn = await screen.findByTestId("settings-button");
    fireEvent.click(settingsBtn);

    const menu = await screen.findByText(/Control Deck/i);
    expect(menu).toBeInTheDocument();
    const objLabel = await screen.findByText(/Labels/i);
    expect(objLabel).toBeInTheDocument();
    const orbitalPaths = await screen.findByText(/Trajectories/i);
    expect(orbitalPaths).toBeInTheDocument();
  });

  it("can close the gallery modal", async () => {
    axios.get.mockResolvedValue({
      data: {
        milestones: [
          { day: 1, label: "Launch" },
          { day: 6, label: "The Big Day" },
        ],
      },
    });

    render(<App />);
    screen.debug();
    // open the modal
    const day6Btn = await screen.findByText(/Day 06/i);
    fireEvent.click(day6Btn);

    const closeBtn = screen.getByTestId("close-modal");
    fireEvent.click(closeBtn);

    // verify it closed
    await waitFor(() => {
      expect(screen.queryByText(/Science Officers/i)).not.toBeInTheDocument();
    });
  });
});
