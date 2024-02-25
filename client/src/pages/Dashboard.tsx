import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import axios from 'axios';
import {
  Container,
  Typography,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { shadows } from '@mui/system';
import { Treebeard } from 'react-treebeard';
import "../styles/DashboardStyle.css";
import ChatWidget from '../components/Layout/ChatWidget';

interface File {
  name: string;
}

interface Folder {
  name: string;
  children?: (File | Folder)[];
}

const folderStructure: Folder = {
  name: 'Root',
  toggled: true,
  children: [
    {
      name: 'Folder 1',
      children: [
        { name: 'File 1.pdf' },
        { name: 'File 2.pdf' },
      ],
    },
    {
      name: 'Folder 2',
      children: [
        { name: 'File 3.pdf' },
        { name: 'File 4.pdf' },
      ],
    },
  ],
};

const Dashboard = () => {
  const [totalProjects, setTotalProjects] = useState<number>(0);
  const [totalFiles, setTotalFiles] = useState<number>(0);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [fileCategories, setFileCategories] = useState<
    { category: string; count: number }[]
  >([]);
  const [data, setData] = useState<Folder>(folderStructure);
  const [treeData, setTreeData] = useState<Folder>({ name: 'Root', toggled: true });

  const onToggle = (node: any, toggled: boolean) => {
    if (node.children) {
      node.toggled = toggled;
    }
    setData({ ...data });
  };

  const fetchData = async () => {
    try {
      const response = await axios.get<any>('api/dashboard');
      setData(response.data.directory_structure);
      setTotalProjects(response.data.num_projects);
      setTotalFiles(response.data.num_files);
    } catch (error) {
      console.error('Error fetching directory structure:', error);
    }
  };


  const fetchDashboardData = async () => {
    try {
      // Fetch total projects and total files
      const response = await axios.get('your-flask-server-endpoint/dashboard');
      setTotalProjects(response.data.totalProjects);
      setTotalFiles(response.data.totalFiles);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchFileCategories = async (projectName: string) => {
    try {
      // Fetch file categories for the selected project
      const response = await axios.get(
        `your-flask-server-endpoint/fileCategories?project=${projectName}`
      );
      setFileCategories(response.data);
    } catch (error) {
      console.error('Error fetching file categories:', error);
    }
  };

  useEffect(() => {
    // Fetch initial dashboard data
    fetchDashboardData();
    fetchData();
  }, []);

  const handleProjectChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const projectName = event.target.value as string;
    setSelectedProject(projectName);
    fetchFileCategories(projectName);
  };

  return (
    <Layout>
      <Container sx={{ minHeight: '80vh', padding: '20px', bgcolor: '#d9d9da' }}>
        <Typography variant="h3" component="h1" align="center" gutterBottom>
          PDF File Management Dashboard
        </Typography>

        <Grid container spacing={3}>
          {/* Total Projects Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ boxShadow: 3 }} className="cardAnimation">
              <CardContent>
                <Typography variant="h6" component="div">
                  Total Projects
                </Typography>
                <Typography variant="h4" component="div">
                  {totalProjects}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Total Files Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ boxShadow: 3 }} className="cardAnimation">
              <CardContent>
                <Typography variant="h6" component="div">
                  Total Files
                </Typography>
                <Typography variant="h4" component="div">
                  {totalFiles}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ boxShadow: 3 }} className="cardAnimation">
              <CardContent>
                <Typography variant="h6" component="div">
                  Total Collaborators
                </Typography>
                <Typography variant="h4" component="div">
                  4
                </Typography>
              </CardContent>
            </Card>
          </Grid>


          {/* File Categories Graph */}
          <Grid item xs={12}>
            {selectedProject && (
              <div>
                <Typography variant="h6" component="div">
                  File Categories for {selectedProject}
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    width={500}
                    height={300}
                    data={fileCategories}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Grid>
        </Grid>
        <Typography variant="h3" component="div">
          File Structure:
        </Typography>
        <Treebeard data={data} onToggle={onToggle}
          style={{
            tree: {
              base: {
                backgroundColor: '#212121',
                color: 'white',
              },
            },
          }}
        />
      </Container>
      <ChatWidget />
    </Layout>
  );
};

export default Dashboard;
