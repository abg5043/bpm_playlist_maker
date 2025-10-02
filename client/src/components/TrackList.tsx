import { Track } from '../types';
import TrackItem from './TrackItem';
import { List, Box } from '@mui/material';
import { usePlaylistStore } from '../store/playlistStore';

interface TrackListProps {
  tracks: Track[];
}

const TrackList = ({ tracks }: TrackListProps) => {
  const removeTrack = usePlaylistStore((state) => state.removeTrack);

  return (
    <Box sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
      <List dense>
        {tracks.map((track) => (
          <TrackItem key={track.id} track={track} onRemove={removeTrack} />
        ))}
      </List>
    </Box>
  );
};

export default TrackList;