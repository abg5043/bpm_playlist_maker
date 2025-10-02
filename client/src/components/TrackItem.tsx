import { useState, useRef } from 'react';
import { Track } from '../types';
import { ListItem, ListItemAvatar, Avatar, ListItemText, IconButton, Box } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import DeleteIcon from '@mui/icons-material/Delete';

interface TrackItemProps {
  track: Track;
  onRemove: (trackId: string) => void;
}

const TrackItem = ({ track, onRemove }: TrackItemProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayPreview = () => {
    if (!track.preview_url) return;

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(track.preview_url);
        audioRef.current.addEventListener('ended', () => setIsPlaying(false));
      }
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <ListItem
      secondaryAction={
        <Box>
          <IconButton edge="end" aria-label="play" onClick={handlePlayPreview} disabled={!track.preview_url} sx={{ mr: 1 }}>
            {isPlaying ? <StopIcon /> : <PlayArrowIcon />}
          </IconButton>
          <IconButton edge="end" aria-label="delete" onClick={() => onRemove(track.id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      }
    >
      <ListItemAvatar>
        <Avatar src={track.album.images[0]?.url} variant="square" />
      </ListItemAvatar>
      <ListItemText
        primary={track.name}
        secondary={track.artists.map((artist) => artist.name).join(', ')}
      />
    </ListItem>
  );
};

export default TrackItem;