import React, { useState } from 'react';
import Layout from '../components/Layout/Layout';
import {
  Button,
  CircularProgress,
  Typography,
  Container,
  Box,
  Card,
  CardContent,
  CardMedia,
  TextField,
} from '@mui/material';
import axios from 'axios';
import { Document, Page, pdfjs } from 'react-pdf';

const Upload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [projectName, setProjectName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | ArrayBuffer | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files && event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);

      // Preview the selected file
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleProjectNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProjectName(event.target.value);
  };

  const handleUpload = async () => {
    if (!file || !projectName) {
      console.error('Please select a file and enter a project name');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectName', projectName);

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
          <TextField
            label="Project Name"
            variant="outlined"
            fullWidth
            value={projectName}
            onChange={handleProjectNameChange}
            style={{ marginBottom: '1em' }}
          />
          <input type="file" onChange={handleFileChange} style={{ width: '100%', marginBottom: '1em' }} />
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={loading}
            style={{ width: '100%' }}
            sx={{
              backgroundColor: 'black',
              color: 'white',
              '&:hover': {
                backgroundColor: 'darkslategray', // Change to the desired hover color
              },
            }}
          >
            Upload
          </Button>

          {loading && <CircularProgress style={{ marginTop: '1em' }} />}

          {filePreview && (
            <Card style={{ marginTop: '1em', maxWidth: 400 }}>
              <CardMedia
                component="img"
                alt="Uploaded File"
                height="140"
                image={URL.createObjectURL(file as Blob)}
              />
              <CardContent>
                <Typography variant="h6">Uploaded File Preview</Typography>
              </CardContent>
            </Card>
          )}

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
