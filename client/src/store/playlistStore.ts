import { create } from 'zustand';
import { Track } from '../types';
import api from '../services/api';

interface PlaylistState {
  // User selections
  targetBPM: number;
  durationMinutes: number;
  setTargetBPM: (bpm: number) => void;
  setDurationMinutes: (minutes: number) => void;

  // Playlist state
  playlist: Track[];
  playlistName: string;

  // Generation state
  isGenerating: boolean;
  generateError: string | null;
  generateMessage: string | null;

  // Saving state
  isSaving: boolean;
  saveError: string | null;
  saveSuccessMessage: string | null;

  // Actions
  generatePlaylist: () => Promise<void>;
  setPlaylistName: (name: string) => void;
  removeTrack: (trackId: string) => void;
  savePlaylist: () => Promise<void>;
  clearSaveStatus: () => void;
}

export const usePlaylistStore = create<PlaylistState>((set, get) => ({
  // State
  targetBPM: 140,
  durationMinutes: 60,
  playlist: [],
  playlistName: '',
  isGenerating: false,
  generateError: null,
  generateMessage: null,
  isSaving: false,
  saveError: null,
  saveSuccessMessage: null,

  // Actions
  setTargetBPM: (bpm: number) => set({ targetBPM: bpm }),
  setDurationMinutes: (minutes: number) => set({ durationMinutes: minutes }),
  setPlaylistName: (name: string) => set({ playlistName: name }),
  removeTrack: (trackId: string) => {
    set(state => ({
      playlist: state.playlist.filter(track => track.id !== trackId)
    }));
  },

  generatePlaylist: async () => {
    const { targetBPM, durationMinutes } = get();
    const defaultPlaylistName = `Running Mix - ${targetBPM} BPM`;
    set({ isGenerating: true, generateError: null, generateMessage: null, playlist: [], playlistName: defaultPlaylistName });
    try {
      const { data } = await api.post('/playlist/generate', { targetBPM, durationMinutes });
      set({ playlist: data.playlist, generateMessage: data.message, isGenerating: false });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'An unknown error occurred.';
      set({ generateError: errorMessage, isGenerating: false });
    }
  },

  savePlaylist: async () => {
    const { playlistName, playlist } = get();
    if (!playlistName || playlist.length === 0) {
      set({ saveError: 'Playlist name is missing or playlist is empty.' });
      return;
    }

    set({ isSaving: true, saveError: null, saveSuccessMessage: null });
    try {
      const trackUris = playlist.map(track => track.uri);
      const { data } = await api.post('/playlist/save', { name: playlistName, trackUris });
      set({ saveSuccessMessage: data.message, isSaving: false });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to save playlist.';
      set({ saveError: errorMessage, isSaving: false });
    }
  },

  clearSaveStatus: () => set({ saveError: null, saveSuccessMessage: null }),
}));