import React, { useState } from 'react';
import Layout from '../components/Layout/Layout';
import { Button, CircularProgress, Typography, Container, Box, Grid } from '@mui/material';
import axios from 'axios';

const Upload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files && event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      console.error('No file selected');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const response = await axios.post('your-flask-server-endpoint', formData);
      setResponse(response.data);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Container
        component="main"
        maxWidth="lg"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mt: 8,
        }}
      >
        <Box sx={{ mt: 1 }}>
          <Typography component="h1" variant="h3" style={{ marginBottom: '1em' }}>
            Upload Your Document Below
          </Typography>
          <input type="file" onChange={handleFileChange} style={{ width: '100%', marginBottom: '1em' }} />
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={loading}
            style={{ width: '100%' }}
          >
            Upload
          </Button>

          {loading && <CircularProgress style={{ marginTop: '1em' }} />}

          {response && (
            <div style={{ marginTop: '1em' }}>
              <Typography component="h1" variant="h3" style={{ marginBottom: '1em' }}>
                Information Extracted
              </Typography>
              <Typography variant="h6">Response from server:</Typography>
              <pre>{JSON.stringify(response, null, 2)}</pre>
            </div>
          )}
        </Box>
      </Container>
    </Layout>
  );
};

export default Upload;
