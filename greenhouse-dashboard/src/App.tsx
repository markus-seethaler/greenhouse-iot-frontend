import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import Grid from '@mui/material/Grid2'; // Using Grid2 as in your example
import { createTheme } from '@mui/material/styles';
import SensorCard from './components/GenericSensorCard';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // Green shade for plant theme
    },
    secondary: {
      main: '#558b2f',
    },
    background: {
      default: '#f5f5f5',
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{
        flexGrow: 1,
        padding: 2,
        minHeight: '100vh'
      }}>
        {/* Air sensors at the top */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <SensorCard
              sensorType="temperature"
              title="Air Temperature"
              color="#1565c0" // Blue for temperature
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <SensorCard
              sensorType="humidity"
              title="Air Humidity"
              color="#0097a7" // Cyan for humidity
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <SensorCard
              sensorType="soil"
              title="Soil Humidity"
            />
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
}

export default App;