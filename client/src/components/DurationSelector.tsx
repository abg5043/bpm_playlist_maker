import { Select, MenuItem, FormControl, InputLabel, SelectChangeEvent } from '@mui/material';

interface DurationSelectorProps {
  value: number;
  onChange: (event: SelectChangeEvent<number>) => void;
}

const durationOptions = [
  { value: 30, label: '30 Minutes' },
  { value: 60, label: '1 Hour' },
  { value: 90, label: '1.5 Hours' },
  { value: 120, label: '2 Hours' },
  { value: 180, label: '3 Hours' },
  { value: 240, label: '4 Hours' },
  { value: 300, label: '5 Hours (Marathon)' },
];

const DurationSelector = ({ value, onChange }: DurationSelectorProps) => {
  return (
    <FormControl fullWidth>
      <InputLabel id="duration-select-label">Playlist Duration</InputLabel>
      <Select
        labelId="duration-select-label"
        id="duration-select"
        value={value}
        label="Playlist Duration"
        onChange={onChange}
      >
        {durationOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default DurationSelector;