<!-- PROJECT LOGO -->
<br />
<div align="center">

  <h3 align="center">Projevct ARTEMIS II</h3>

  <p align="center">
    A 3D visualization platform designed to track the trajectories of Earth, Moon and the Orion spacecraft during the recent Artemis II mission.
    <br />
   
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#installation-and-setup">Installation and Setup</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

<!-- [![Product Name Screen Shot][product-screenshot]](https://example.com) -->

### Core features

1. 3D engine
   - Synchronized orbits: all bodies move along CatmullRomCurve3 trajectories made from the mission data ('https://ssd.jpl.nasa.gov/api/horizons.api')
   - Bodies rotation: all bodies also have a calculated self rotation
   - Dynamic lighting: point light sources and Bloom effects simulate the luminosity of the Sun

2. Solar Flares Telemetry
   - Data integration: fetches real solar flares that happened during the mission (X, M and C class flares) from the DONKI NASA API ('https://api.nasa.gov/DONKI/FLR')
   - Depth based interaction: used camera's perspective to determine if the Sun is "in the way" so the user cannot click on flares that are "behind". If distToFlare > distToSun + smallBuffer, the interaction is discarded
   - Visual classification: flares are dinamically sizes based on their electromagnetic intensity

3. Mission Control UI: located at the base of the viewport
   - Seek bar: controls the global progress state in the mission. Dragging the bar recalculates the position of all celestial bodies and their rotations in real-time.
   - Progress telemetry: displays the mission completion percentage
   - Pause/Play button: starts and stops the temporal advancemnt of the progress and when paused, the CameraTracker remains active to be able to inspect the system more clearly at this current state
   - Achievement popup: when reaching day6, a pop up appears explaining how this is the day when humanity reached the furthest point. This popup reappears once every progress loop
   - The states of open modals, progress, pause, speed settings, etc. are stored in Zustand

4. Mission Timeline and Gallery: on the right side for bigger screens and on the bottom above the mission control for smaller screens
   - Chronological milestones: lists all 10 days of the mission and by clicking a milestone it will trigger a temporal jump to where the progress was in that day
   - Gallery modal: clicking on a milestones also opens a sliding (side panel from the right on bigger screens and slide from the bottom and occupies all screen for smaller) modal that fetches and displays image data and descriptions for the specific mission day. Here there's also "read more/collapse" buttons to read the full description
   - Autopause integration: opening thw gallery automatically triggers a syatem pause to ensure that the 3D environment remains fixes while the user looks at the data. It also stays pause after closing the modal, so that the user can inspect the system for that day as well without "chasing" the pause button

5. Focus and reference command buttons: in the top left corner as a column on bigger screens and as 2 rows for smaller
   - Camera focus function (blue):
     - Function: re-targets the OrbitalContrls to a specific entitiy (earth, moon, sun or the Orion spacecraft)
     - Intelligent recentering: the system calculates a target specific offset based on the radius and the user's device size so that the camera doesn't go in the entity or is too far away
     - Displacement tracking: the focused entity's displacement is calculated and it's applied to the camera tracker so that it moves at the same time as it
     - Dynamic clipping: automatically adjusts the minDistance to allow close-up inspection without clipping through the entities
   - Reference Frame / Center (orange):
     - Function: shifts the coordinate origin of the entire system to one entity (Sun, Earth, Moon)
     - Relative motion recalculation: this "freezes" the selected body at the center while the other's trajectory is recalculated relative to it
     - Orbital visualization: by switching the center to the Earth, users can observe theMoon's orbital path. By switching to the Sun, the grand scale of the system transit becomes the focus

6. Image search and metadata archive: search bar on the top left for smaller screens and top left for bigger
   - Keyword filtering: it searches for the keywords from the image metadata from the NASA Images API
   - Search overlay: like the mission gallery, the search opens a (side for bigger screens or bellow for smaller) sliding panel that presents filtered images with description

7. Settings
   - Entity labels: text overlays that track the bodies so it's easier to see where they are if the user zoom out. This can be turned off from the settings
   - Visibility toggle: a settings overlay that allows the user to turn off the labels or the trajectories
   - Speed adjustment: a slide where you can change the speed of the progress with a reset to default button
   - Star density: 3 value choices for low, medium and high count of stars shown with a reset to default button
   - Popup toggle: this stops any achievement milestones from showing up

8. Testing and Linters
   - Frontend Testing (Vitest & React Testing Library)
   - Backend Testing (Jest)
   - Both frontend and backend use ESlint for lintering
9. Other specifications
   - The backend is hosted on Render and the frontend on Vercel
   - When you open the frontend on Vercel it will take a while for the Render backend to wake up, as I have the free tier
   - For the flares I also have some mock data, because for some days the NASA DONKI API didn't seem to work, but now it looks like it's working again. The mock has the actual data from those days

### Built With

- ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)

- ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)

- ![Threejs](https://img.shields.io/badge/threejs-black?style=for-the-badge&logo=three.js&logoColor=white)

- ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

- ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)

- ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)

- ![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)

- ![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)

- ![Testing-Library](https://img.shields.io/badge/-TestingLibrary-%23E33332?style=for-the-badge&logo=testing-library&logoColor=white)

- ![Vitest](https://img.shields.io/badge/-Vitest-252529?style=for-the-badge&logo=vitest&logoColor=FCC72B)

- ![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)

<!-- Installation and Setup -->

## Installation and Setup

1. Clone the repository
   ```sh
   git clonehttps://github.com/AndraCristiana07/Nasa_Project.git
   ```
2. Install dependencies
   Backend:
   ```sh
   cd backend && npm install
   ```
   Frontend:
   ```sh
   cd frontend && npm install
   ```
3. Environment configuration
   Create .env files for both backend and frontend
   Backend:
   ```sh
   NASA_API_KEY=your_nasa_key_here
   PORT=your_port
   ```
   Frontend:
   ```sh
   VITE_BACKEND_URL=your_api_url_here
   ```
4. Run the app
   Backend:
   ```sh
   cd backend && node index.js
   ```
   Frontend:
   ```sh
   cd frontend && npm run dev
   ```
