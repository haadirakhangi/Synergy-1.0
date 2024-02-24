import React from 'react';
import { Container, Typography, Button } from '@mui/material';

const LandingPage: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Typography variant="h3" component="h1" gutterBottom>
        Welcome to Promptimizer
      </Typography>
      <Typography variant="body1" gutterBottom>
        This is a simple landing page created using Material-UI in React with TypeScript.
      </Typography>
      <Button variant="contained" color="primary">
        Get Started
      </Button>
    </Container>
  );
};

export default LandingPage;
