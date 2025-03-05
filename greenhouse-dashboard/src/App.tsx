// src/App.tsx
// Import the Grid component correctly
import Grid from '@mui/material/Grid2';
import { Box } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TemperatureCard from './components/TemperatureCard';

// Create a theme with green colors to match the greenhouse concept
const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // Dark green
    },
    secondary: {
      main: '#81c784', // Light green
    },
    background: {
      default: '#f5f5f5',
    },
  },
});


function App() {
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          {/* Full width on mobile (xs), half width on tablets (sm), one-third on desktop (md) */}
          <Grid size={{xs:12, sm:6, md:4}}>
            <TemperatureCard />
          </Grid>
          <Grid size={{xs:12, sm:6, md:4}}>
            <TemperatureCard />
          </Grid>
          <Grid size={{xs:12, sm:6, md:4}}>
            <TemperatureCard />
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
}

export default App;

