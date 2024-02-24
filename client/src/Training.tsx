import React, { useState } from 'react';
import { Container, Grid, Button, TextField, Alert, Typography, Box, CircularProgress } from '@mui/material';
import axios from 'axios';
import { styled, useTheme } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ChatIcon from '@mui/icons-material/Chat';
import ModelTrainingIcon from '@mui/icons-material/ModelTraining';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
    open?: boolean;
}>(({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
    }),
}));

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: `${drawerWidth}px`,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
}));

const Training: React.FC = () => {
    const [initialPrompt, setInitialPrompt] = useState('');
    const [optimizedPrompt, setOptimizedPrompt] = useState('');
    const [output, setOutput] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isOptimized, setIsOptimized] = useState(false);
    const [error, setError] = useState('');
    const [loadingOptimize, setLoadingOptimize] = useState(false);
    const [loadingGenerateOutput, setLoadingGenerateOutput] = useState(false);
    const [loadingSubmitFeedback, setLoadingSubmitFeedback] = useState(false);

    const theme = useTheme();
    const [open, setOpen] = React.useState(false);

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };


    const renderOutput = (outputText: string) => {
        const lines = outputText.split('\n');
        return lines.map((line, index) => (
            <React.Fragment key={index}>
                {line.split(' ').map((word, wordIndex) => (
                    word.startsWith('**') && word.endsWith('**') ? (
                        <strong key={wordIndex}>{word.substring(2, word.length - 2)}</strong>
                    ) : (
                        <React.Fragment key={wordIndex}>{word}</React.Fragment>
                    )
                )).join(' ')}
                <br />
            </React.Fragment>
        ));
    };

    const handleOptimize = () => {
        if (initialPrompt.trim() !== '') {
            setLoadingOptimize(true);
            axios.post('/api/get-optimizeprompt', { initialPrompt })
                .then(response => {
                    const optimizedResponse = response.data.optimized_prompt;
                    setOptimizedPrompt(optimizedResponse);
                    setIsOptimized(true);
                    setError('');
                })
                .catch(error => {
                    setError('Failed to optimize prompt. Please try again.');
                    console.error(error);
                })
                .finally(() => setLoadingOptimize(false));
        } else {
            setError('Initial prompt cannot be empty');
        }
    };

    const handleGenerateOutput = () => {
        if (optimizedPrompt.trim() !== '') {
            setLoadingGenerateOutput(true);
            axios.post('/api/generate-output', { optimizedPrompt })
                .then(response => {
                    const generatedOutput = response.data.output;
                    setOutput(generatedOutput);
                })
                .catch(error => {
                    setError('Failed to generate output. Please try again.');
                    console.error(error);
                })
                .finally(() => setLoadingGenerateOutput(false));
        } else {
            setError('Optimized prompt cannot be empty');
        }
    };

    const handleSubmitFeedback = () => {
        if (feedback.trim() !== '') {
            setLoadingSubmitFeedback(true);
            axios.post('/api/submit-feedback', { feedback, optimizedPrompt })
                .then(response => {
                    const updatedOptimizedPrompt = response.data.prompt_after_feedback;
                    setOptimizedPrompt(updatedOptimizedPrompt);
                })
                .catch(error => {
                    setError('Failed to submit feedback. Please try again.');
                    console.error(error);
                })
                .finally(() => setLoadingSubmitFeedback(false));
        } else {
            setError('Feedback cannot be empty');
        }
    };

    return (
        <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Promptimizer
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {['Inference', 'Training'].map((text, index) => (
            <ListItem key={text} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  {index % 2 === 0 ? <ChatIcon/> : <ModelTrainingIcon/>}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Main open={open}>
        <DrawerHeader />
        <Container style={{ padding: '20px' }}>
            <Grid container spacing={8}>
                <Grid item xs={6}>
                    <TextField
                        style={{ height: '180px' }}
                        multiline
                        rows={6}
                        fullWidth
                        label="Initial Prompt"
                        disabled={isOptimized}
                        value={initialPrompt}
                        onChange={(e) => setInitialPrompt(e.target.value)}
                    />
                    {!isOptimized && (
                        <React.Fragment>
                            <Button variant="contained" onClick={handleOptimize}>Optimize Prompt</Button>
                            {loadingOptimize && <CircularProgress size={24} />}
                        </React.Fragment>
                    )}
                    {error && <Alert severity="error">{error}</Alert>}
                </Grid>
                <Grid item xs={6}>
                    <Typography variant="h4" component="h2">
                        Output Generated from Optimized Prompt
                    </Typography>
                    <Box sx={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {loadingGenerateOutput ? (
                            <CircularProgress size={50} />
                        ) : (
                            <Typography>
                                {output}
                            </Typography>
                        )}
                    </Box>
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        style={{ height: '180px' }}
                        multiline
                        rows={6}
                        fullWidth
                        label="Optimized Prompt"
                        value={optimizedPrompt}
                        disabled={!isOptimized}
                    />
                    <Button variant="contained" onClick={handleGenerateOutput}>Generate Output</Button>
                </Grid>

                <Grid item xs={6}>
                    <TextField
                        style={{ height: '180px' }}
                        multiline
                        rows={6}
                        fullWidth
                        label="Feedback"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                    />
                    <Button variant="contained" onClick={handleSubmitFeedback}>Submit Feedback</Button>
                    {loadingSubmitFeedback && <CircularProgress size={24} />}
                </Grid>
            </Grid>
        </Container>
      </Main>
    </Box>
        
    );
};

export default Training;
