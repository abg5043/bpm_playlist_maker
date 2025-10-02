import { Slider, Typography, Box } from '@mui/material';

interface BPMSliderProps {
  value: number;
  onChange: (event: Event, newValue: number | number[]) => void;
}

const marks = [
  { value: 60, label: 'Walk' },
  { value: 120, label: 'Jog' },
  { value: 160, label: 'Run' },
  { value: 200, label: 'Sprint' },
];

const BPMSlider = ({ value, onChange }: BPMSliderProps) => {
  return (
    <Box>
      <Typography id="bpm-slider-label" gutterBottom align="center" variant="h5">
        {value} BPM
      </Typography>
      <Slider
        aria-labelledby="bpm-slider-label"
        value={value}
        onChange={onChange}
        min={60}
        max={200}
        defaultValue={140}
        marks={marks}
        step={1}
        valueLabelDisplay="auto"
        sx={{ mt: 2 }}
      />
    </Box>
  );
};

export default BPMSlider;