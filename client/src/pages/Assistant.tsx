import React, { useState } from "react";
import Layout from "../components/Layout/Layout";
import { Container, Paper, TextField, Button, Grid, Typography } from "@mui/material";

const Assistant = () => {
  const [inputText, setInputText] = useState("");
  const [chatHistory, setChatHistory] = useState<string[]>([]);

  const handleSendMessage = () => {
    if (inputText.trim() !== "") {
      setChatHistory([...chatHistory, inputText]);
      setInputText("");
    }
  };

  return (
    <Layout>
      <Container style={{ marginTop: '64px' }}> {/* Adjust the top margin according to your navigation bar's height */}
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Virtual Assistant
        </Typography>

        <Paper elevation={3} style={{ padding: 16, marginBottom: 16 }}>
          {/* Chat Display */}
          <div style={{ maxHeight: 200, overflowY: "auto" }}>
            {chatHistory.map((message, index) => (
              <div key={index}>{message}</div>
            ))}
          </div>

          {/* Input Field and Send Button */}
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={9}>
              <TextField
                fullWidth
                label="Type a message..."
                variant="outlined"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            </Grid>
            <Grid item xs={3}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSendMessage}
                fullWidth
                sx={{
                  backgroundColor: 'black',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'darkslategray', // Change to the desired hover color
                  },
                }}
              >
                Send
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Layout>
  );
};


export default Assistant;
