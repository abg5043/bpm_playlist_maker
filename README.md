# 🎵 Spotify BPM Playlist Generator

A web application that connects to your Spotify account to automatically generate running playlists based on your desired BPM (Beats Per Minute). The app analyzes your music library and leverages Spotify's recommendation algorithms to create tempo-matched playlists perfect for your workouts.

This project was built as an MVP based on a detailed Product Requirements Document.

## ✨ Features

*   **Spotify Authentication:** Secure OAuth 2.0 integration to connect to your Spotify account.
*   **BPM & Duration Selection:** Intuitive sliders and dropdowns to select your target tempo (60-200 BPM) and desired playlist duration.
*   **Intelligent Playlist Generation:** Analyzes your "Liked Songs" and, if necessary, fetches Spotify recommendations to build the perfect playlist.
*   **Playlist Customization:** Preview the generated playlist, edit its name, and remove individual tracks before saving.
*   **Save to Spotify:** Save your customized playlist directly to your Spotify library with a single click.
*   **Regenerate:** Quickly get a new set of songs with the same settings.
*   **Performance:** Includes a server-side cache to reduce API calls and improve speed.

## 🛠️ Tech Stack

*   **Monorepo Structure**
*   **Frontend:** React 18+ (with TypeScript), Vite, Zustand, Material-UI (MUI)
*   **Backend:** Node.js, Express.js
*   **API Integration:** Spotify Web API

---

## 🚀 Getting Started: Local Development

Follow these steps to set up and run the project on your local machine.

### 1. Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   `npm` (usually comes with Node.js)
*   A [Spotify Developer Account](https://developer.spotify.com/dashboard/)

### 2. Set Up Your Spotify Application

1.  Go to your **Spotify Developer Dashboard** and click **"Create app"**.
2.  Give your app a name (e.g., "BPM Playlist Generator") and a description.
3.  Once created, you will see your **Client ID** and a button to show your **Client Secret**. You will need these for the backend setup.
4.  Go to your app's **Settings**.
5.  In the **Redirect URIs** section, add the following URI exactly:
    ```
    http://localhost:3001/api/auth/callback
    ```
    This is crucial for the authentication flow to work locally.

### 3. Backend Setup (`server/`)

1.  **Navigate to the server directory:**
    ```bash
    cd server
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up environment variables:**
    Create a new file named `.env` in the `server` directory. Copy the contents of `server/.env.example` into it and fill in the values:
    ```env
    # Get these from your Spotify Developer Dashboard
    SPOTIFY_CLIENT_ID=your_spotify_client_id
    SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

    # This must match the URI you set in the Spotify Dashboard
    REDIRECT_URI=http://localhost:3001/api/auth/callback
    # This is the default URL for the Vite frontend dev server
    FRONTEND_URI=http://localhost:5173

    # Use a long, random string for security
    SESSION_SECRET=a_very_strong_and_secret_key
    ```
4.  **Start the backend server:**
    ```bash
    npm run dev
    ```
    The server will start on `http://localhost:3001` and will automatically restart on file changes.

### 4. Frontend Setup (`client/`)

1.  In a **new terminal window**, navigate to the client directory:
    ```bash
    cd client
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the frontend server:**
    ```bash
    npm run dev
    ```
    The development server will start, typically on `http://localhost:5173`.

### 5. Access the Application

Open your web browser and navigate to `http://localhost:5173`. You should see the application's landing page and be able to connect to your Spotify account.

---

## ☁️ Deployment & Hosting

This project is a monorepo, but the frontend and backend are deployed as two separate services. Here are recommended hosting providers.

### Hosting the Frontend (`client/`)

**Providers:** Vercel, Netlify

These platforms are optimized for modern frontend frameworks like React and offer seamless deployment from a Git repository.

**Setup Steps (Vercel/Netlify):**
1.  Connect your Git repository to the provider.
2.  When configuring the project, set the **Root Directory** to `client`.
3.  The build command should be `npm run build` and the output directory is `dist`.
4.  No environment variables are needed for the frontend to be deployed, as the API proxy in `vite.config.ts` will not be used in production. The frontend will make direct calls to your hosted backend API.

### Hosting the Backend (`server/`)

**Providers:** Railway, Render

These platforms provide excellent support for Node.js applications.

**Setup Steps (Railway/Render):**
1.  Connect your Git repository.
2.  When configuring the service, set the **Root Directory** to `server`.
3.  The start command should be `npm start`.
4.  **Crucially, you must set up the environment variables in your provider's dashboard:**
    *   `SPOTIFY_CLIENT_ID`: Your Spotify Client ID.
    *   `SPOTIFY_CLIENT_SECRET`: Your Spotify Client Secret.
    *   `SESSION_SECRET`: A new, strong random string for production.
    *   `FRONTEND_URI`: The URL of your *deployed frontend* (e.g., `https://your-app-name.vercel.app`).
    *   `REDIRECT_URI`: The callback URL of your *deployed backend* (e.g., `https://your-backend-service.onrender.com/api/auth/callback`).

### Final Step: Update Spotify Redirect URI for Production

After deploying your backend, you must go back to your **Spotify Developer Dashboard**, open your app's **Settings**, and **add your production `https://` Redirect URI** to the list.

**Important:** For production applications, Spotify requires all Redirect URIs to use `https://` for security. Your deployed backend service URL (e.g., `https://your-backend-service.onrender.com/api/auth/callback`) must be added here.

Do not remove the `http://localhost:3001/api/auth/callback` URI, as you will still need it for local development. Your app will not work in production until this step is complete.