const axios = require('axios');
const cache = require('../utils/cache');

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Fetches all of a user's liked songs from Spotify, handling pagination and caching.
 * @param {string} accessToken - The user's Spotify access token.
 * @param {string} userId - The user's Spotify ID for caching.
 * @returns {Promise<Array>} A promise that resolves to an array of track objects.
 */
const fetchAllLikedSongs = async (accessToken, userId) => {
  const cacheKey = `liked-songs:${userId}`;
  const cachedSongs = cache.get(cacheKey);
  if (cachedSongs) {
    console.log('Serving liked songs from cache.');
    return cachedSongs;
  }

  console.log('Fetching liked songs from Spotify API.');
  let allTracks = [];
  let nextUrl = 'https://api.spotify.com/v1/me/tracks?limit=50';

  try {
    while (nextUrl) {
      const response = await axios.get(nextUrl, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      const { items, next } = response.data;
      const validItems = items.filter(item => item.track && item.track.id);
      allTracks = allTracks.concat(validItems.map(item => item.track));
      nextUrl = next;
    }
    cache.set(cacheKey, allTracks, CACHE_TTL_MS);
    return allTracks;
  } catch (error) {
    console.error('Error fetching liked songs:', error.response ? error.response.data : error.message);
    throw new Error('Failed to fetch liked songs from Spotify.');
  }
};

/**
 * Fetches audio features for a list of track IDs from Spotify, handling batching and caching.
 * @param {string} accessToken - The user's Spotify access token.
 * @param {Array<string>} trackIds - An array of Spotify track IDs.
 * @param {string} userId - The user's Spotify ID for caching.
 * @returns {Promise<Array>} A promise that resolves to an array of audio feature objects.
 */
const fetchAudioFeatures = async (accessToken, trackIds, userId) => {
  // For audio features, we cache by batches to avoid overly large/complex keys
  let allAudioFeatures = [];
  const batchSize = 100;
  const uncachedBatches = [];

  // First, try to retrieve as much as possible from the cache
  for (let i = 0; i < trackIds.length; i += batchSize) {
    const batch = trackIds.slice(i, i + batchSize);
    const cacheKey = `audio-features:${userId}:${batch.sort().join(',')}`;
    const cachedFeatures = cache.get(cacheKey);
    if (cachedFeatures) {
      console.log(`Serving audio features batch from cache for user ${userId}.`);
      allAudioFeatures = allAudioFeatures.concat(cachedFeatures);
    } else {
      uncachedBatches.push(batch);
    }
  }

  // If there are any batches not in the cache, fetch them from the API
  if (uncachedBatches.length > 0) {
    console.log(`Fetching ${uncachedBatches.length} batch(es) of audio features from Spotify API.`);
    try {
      for (const batch of uncachedBatches) {
        const idsString = batch.join(',');
        const response = await axios.get(`https://api.spotify.com/v1/audio-features?ids=${idsString}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        const { audio_features } = response.data;
        const validFeatures = audio_features.filter(feature => feature);

        // Add the newly fetched features to the main list and cache them
        allAudioFeatures = allAudioFeatures.concat(validFeatures);
        const cacheKey = `audio-features:${userId}:${batch.sort().join(',')}`;
        cache.set(cacheKey, validFeatures, CACHE_TTL_MS);
      }
    } catch (error) {
      console.error('Error fetching audio features:', error.response ? error.response.data : error.message);
      throw new Error('Failed to fetch audio features from Spotify.');
    }
  }

  return allAudioFeatures;
};


/**
 * Fetches recommendations from Spotify based on seed tracks and a target tempo.
 * @param {string} accessToken - The user's Spotify access token.
 * @param {Array<string>} seedTrackIds - An array of up to 5 Spotify track IDs to use as seeds.
 * @param {number} targetBPM - The target tempo for the recommendations.
 * @param {number} limit - The number of recommendations to fetch.
 * @returns {Promise<Array>} A promise that resolves to an array of recommended track objects.
 */
const fetchRecommendations = async (accessToken, seedTrackIds, targetBPM, limit) => {
  if (!seedTrackIds || seedTrackIds.length === 0) {
    return [];
  }

  // The API takes up to 5 seed tracks.
  const seed_tracks = seedTrackIds.slice(0, 5).join(',');

  const params = new URLSearchParams({
    seed_tracks,
    target_tempo: targetBPM,
    limit,
  });

  try {
    const response = await axios.get(`https://api.spotify.com/v1/recommendations?${params}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    // The recommendations endpoint returns a list of tracks directly.
    return response.data.tracks || [];
  } catch (error) {
    console.error('Error fetching recommendations from Spotify:', error.response ? error.response.data : error.message);
    throw new Error('Failed to fetch recommendations from Spotify.');
  }
};


/**
 * Creates a new playlist for a user and adds tracks to it.
 * @param {string} accessToken - The user's Spotify access token.
 * @param {string} userId - The user's Spotify ID.
 * @param {string} name - The name of the playlist to create.
 * @param {Array<string>} trackUris - An array of Spotify track URIs to add.
 * @returns {Promise<object>} A promise that resolves to the new playlist object from Spotify.
 */
const createAndSavePlaylist = async (accessToken, userId, name, trackUris) => {
  if (!trackUris || trackUris.length === 0) {
    throw new Error('No tracks provided to save.');
  }

  try {
    // Step 1: Create a new, empty playlist
    const createPlaylistResponse = await axios.post(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      {
        name: name,
        description: 'Generated by BPM Playlist Generator',
        public: false, // As per PRD, default to private
      },
      {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      }
    );

    const newPlaylist = createPlaylistResponse.data;
    const playlistId = newPlaylist.id;

    // Step 2: Add tracks to the new playlist.
    // Spotify API allows adding 100 tracks at a time.
    const batchSize = 100;
    for (let i = 0; i < trackUris.length; i += batchSize) {
      const batch = trackUris.slice(i, i + batchSize);
      await axios.post(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        { uris: batch },
        {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        }
      );
    }

    return newPlaylist;
  } catch (error) {
    console.error('Error creating or saving playlist to Spotify:', error.response ? error.response.data : error.message);
    throw new Error('Failed to save playlist to Spotify.');
  }
};


module.exports = {
  fetchAllLikedSongs,
  fetchAudioFeatures,
  fetchRecommendations,
  createAndSavePlaylist,
};