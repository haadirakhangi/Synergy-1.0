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
  MenuItem,
} from '@mui/material';
import axios from 'axios';
//import { Document, Page, pdfjs } from 'react-pdf';

const Upload: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [filePreviews, setFilePreviews] = useState<(string | ArrayBuffer | null)[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [projectName, setProjectName] = useState<string>('');
  const [editedDetails, setEditedDetails] = useState<{ category: string, document_type: string, index_position: string }>({
    category: '',
    document_type: '',
    index_position: '',
  });
  // const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const selectedFiles = event.target.files;
  //   if (selectedFiles) {
  //     const fileList = Array.from(selectedFiles);
  //     setFiles(fileList);

  //     // Preview the selected files
  //     const previews = fileList.map((file) => {
  //       const reader = new FileReader();
  //       reader.readAsDataURL(file);
  //       return reader.result;
  //     });

  //     setFilePreviews(previews);
  //   }
  // };

  const handleProjectNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProjectName(event.target.value);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(event.target.files);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles) {
      const formData = new FormData();
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('files', selectedFiles[i]);
      }
      formData.append('projectName', projectName);

      try {
        setLoading(true);
        const response = await axios.post('api/get-category', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setResponse(response.data.info)
        setEditedDetails(response.data.info)
        console.log("Data received", response.data.info)
      } catch (error) {
        console.error('Error uploading files:', error);
      } finally {
        setLoading(false); // Stop loading
      }
    }
  };

  const handleDetailsChange = (field: keyof typeof editedDetails, value: string) => {
    setEditedDetails(prevDetails => ({ ...prevDetails, [field]: value }));
  };

  const handleConfirmDetails = async () => {
    try {
      const confirmDetailsResponse = await axios.post('api/confirm-details', editedDetails);
      console.log('Confirmed Details:', confirmDetailsResponse.data);

      // You can update the state or perform additional actions based on the confirmation response
    } catch (error) {
      console.error('Error confirming details:', error);
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
          minHeight: '80vh', // Adjust the minHeight property as needed
        }}
      >
        <Box sx={{ mt: 1 }}>
          <Typography component="h1" variant="h3" style={{ marginBottom: '1em' }}>
            Upload Your Documents Below
          </Typography>
          <TextField
            label="Project Name"
            variant="outlined"
            fullWidth
            value={projectName}
            onChange={handleProjectNameChange}
            style={{ marginBottom: '1em' }}
          />
          <input type="file" onChange={handleFileChange} multiple style={{ width: '100%', marginBottom: '1em' }} />
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

          {loading && <CircularProgress sx={{
            color: 'black',  // Set the color to black
          }} style={{ marginTop: '1em', marginLeft: '50px' }} />}

          {response && (
            <div style={{ marginTop: '1em' }}>
              <Typography component="h1" variant="h3" mt={10}>
                Information Extracted From Document
              </Typography>
              <Typography component="h1" variant="h6" mt={1} style={{ marginBottom: '1em' }}>
                Please confirm the following details as it will affect the folder structure :- Project-Name/Category/Dcoument-type
              </Typography>
              {/* Input fields for editing details */}
              <TextField
                label="Category"
                variant="outlined"
                fullWidth
                value={editedDetails.category}
                onChange={(e) => handleDetailsChange('category', e.target.value)}
                style={{ marginBottom: '1em' }}
              />
              <TextField
                select
                label="Document Type"
                variant="outlined"
                fullWidth
                value={editedDetails.document_type}
                onChange={(e) => handleDetailsChange('document_type', e.target.value)}
                style={{ marginBottom: '1em' }}
              >
                <MenuItem value="construction_plan">Construction Plan</MenuItem>
                <MenuItem value="other_docs">Other Documents</MenuItem>
              </TextField>

              <TextField
                select
                label="Index Position"
                variant="outlined"
                fullWidth
                value={editedDetails.index_position}
                onChange={(e) => handleDetailsChange('index_position', e.target.value)}
                style={{ marginBottom: '1em' }}
              >
                <MenuItem value="right">Right</MenuItem>
                <MenuItem value="bottom">Bottom</MenuItem>
                {/* Add other options as needed */}
              </TextField>

              {/* Confirm details button */}
              <Button
                variant="contained"
                color="primary"
                onClick={handleConfirmDetails}
                style={{ width: '100%', marginTop: '1em' }}
                sx={{
                  backgroundColor: 'black',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'darkslategray',
                  },
                }}
              >
                Confirm Details
              </Button>
            </div>
          )}
        </Box>
      </Container>
    </Layout>
  );
};

export default Upload;
