const { fetchAllLikedSongs, fetchAudioFeatures, fetchRecommendations, createAndSavePlaylist } = require('../services/spotifyService');

// Shuffle array utility
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// @desc    Generates a playlist based on target BPM and duration
const generatePlaylist = async (req, res) => {
  const { targetBPM, durationMinutes } = req.body;
  const { accessToken, userId } = req.session;
  const bpmThreshold = 2;
  const avgSongDurationMinutes = 3.5;
  const requiredSongCount = Math.ceil(durationMinutes / avgSongDurationMinutes);

  if (!targetBPM || !durationMinutes) {
    return res.status(400).json({ message: 'Missing targetBPM or durationMinutes.' });
  }

  try {
    // 1. Fetch liked songs and their audio features
    const likedSongs = await fetchAllLikedSongs(accessToken, userId);
    if (likedSongs.length === 0) {
      return res.status(404).json({ message: "No liked songs found to analyze." });
    }
    const trackIds = likedSongs.map(track => track.id);
    const audioFeatures = await fetchAudioFeatures(accessToken, trackIds, userId);
    const tracksWithBPM = likedSongs.map(track => {
      const features = audioFeatures.find(f => f.id === track.id);
      return { ...track, tempo: features ? Math.round(features.tempo) : null };
    }).filter(track => track.tempo !== null);

    // 2. Filter liked songs by BPM
    let finalPlaylist = tracksWithBPM.filter(track =>
      track.tempo >= (targetBPM - bpmThreshold) && track.tempo <= (targetBPM + bpmThreshold)
    );

    // 3. Fetch recommendations if needed
    if (finalPlaylist.length < requiredSongCount) {
      const seedTrackIds = shuffleArray(finalPlaylist.map(t => t.id)).slice(0, 5);
      const numRecommendationsNeeded = requiredSongCount - finalPlaylist.length;

      if (seedTrackIds.length > 0) {
        const recommendedTracks = await fetchRecommendations(accessToken, seedTrackIds, targetBPM, numRecommendationsNeeded);

        if (recommendedTracks.length > 0) {
          const recommendedTrackIds = recommendedTracks.map(t => t.id);
          // We pass userId here as well, though recommendations are less likely to be cached.
          const recommendedAudioFeatures = await fetchAudioFeatures(accessToken, recommendedTrackIds, userId);
          const recommendedTracksWithBPM = recommendedTracks.map(track => {
            const features = recommendedAudioFeatures.find(f => f.id === track.id);
            return { ...track, tempo: features ? Math.round(features.tempo) : null };
          }).filter(track => track.tempo !== null && track.tempo >= (targetBPM - bpmThreshold) && track.tempo <= (targetBPM + bpmThreshold));

          finalPlaylist.push(...recommendedTracksWithBPM);
        }
      }
    }

    // 4. Finalize playlist: remove duplicates, shuffle, and trim to size
    const uniqueTrackIds = new Set();
    const uniquePlaylist = finalPlaylist.filter(track => {
      if (uniqueTrackIds.has(track.id)) {
        return false;
      }
      uniqueTrackIds.add(track.id);
      return true;
    });

    const shuffledPlaylist = shuffleArray(uniquePlaylist);
    const trimmedPlaylist = shuffledPlaylist.slice(0, requiredSongCount);

    res.status(200).json({
      playlist: trimmedPlaylist,
      actualDurationMinutes: Math.floor(trimmedPlaylist.reduce((acc, t) => acc + t.duration_ms, 0) / 60000),
      message: trimmedPlaylist.length < requiredSongCount ? `We couldn't find enough songs for your full ${durationMinutes}-minute request, but we've created a playlist with all the matching music we found!` : 'Playlist generated successfully!'
    });

  } catch (error) {
    console.error('Error generating playlist:', error);
    res.status(500).json({ message: 'An error occurred during playlist generation.' });
  }
};

// @desc    Saves the playlist to Spotify
const savePlaylist = async (req, res) => {
  const { name, trackUris } = req.body;
  const { accessToken, userId } = req.session;

  if (!name || !trackUris || !Array.isArray(trackUris) || trackUris.length === 0) {
    return res.status(400).json({ message: 'Playlist name and a non-empty array of track URIs are required.' });
  }

  try {
    const newPlaylist = await createAndSavePlaylist(accessToken, userId, name, trackUris);
    res.status(201).json({
      message: 'Playlist saved successfully!',
      playlistUrl: newPlaylist.external_urls.spotify
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save playlist.' });
  }
};

module.exports = {
  generatePlaylist,
  savePlaylist,
};