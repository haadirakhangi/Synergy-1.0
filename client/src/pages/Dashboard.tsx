import React from "react";
import Layout from "../components/Layout/Layout";
import { Container, Card, CardContent, Typography, Grid } from "@mui/material";

const Dashboard = () => {
  // Sample data (replace with real data)
  const totalPDFs = 50;
  const recentUploads = 5;
  const totalDownloads = 100;

  return (
    <Layout>
      <Container>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          PDF File Management Dashboard
        </Typography>

        <Grid container spacing={3}>
          {/* Total PDFs Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div">
                  Total PDFs
                </Typography>
                <Typography variant="h4" component="div">
                  {totalPDFs}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Uploads Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div">
                  Recent Uploads
                </Typography>
                <Typography variant="h4" component="div">
                  {recentUploads}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Total Downloads Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div">
                  Total Downloads
                </Typography>
                <Typography variant="h4" component="div">
                  {totalDownloads}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Add more cards as needed for additional statistics */}
        </Grid>
      </Container>
    </Layout>
  );
};

export default Dashboard;
