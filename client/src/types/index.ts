export interface User {
  id: string;
  displayName: string;
  email: string;
  imageUrl: string | null;
}

export interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
  uri: string; // Spotify URI
  preview_url: string | null;
  duration_ms: number;
  tempo: number;
}