// src/components/DashboardLayout.tsx
import React from 'react';
import Grid from '@mui/material/Grid2'; // Using Grid2
import { Container, Typography, Box } from '@mui/material';

interface DashboardLayoutProps {
  title: string;
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ title, children }) => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {title}
        </Typography>
        <Grid container spacing={3}>
          {children}
        </Grid>
      </Box>
    </Container>
  );
};

export default DashboardLayout;