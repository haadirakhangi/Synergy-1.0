//import React from 'react'
import { Typography, ButtonGroup, AppBar, Box, Card, CardActions, CardContent, CssBaseline, Grid, Toolbar, Container, TextField, Button, FormGroup } from '@mui/material';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import { Link } from 'react-router-dom';
const Header = () => {
  return (
    <>
        <Box>
            <AppBar component={'nav'} sx={{bgcolor:"black"}}>
                <Toolbar>
                <FileCopyIcon/>
                <Typography color={'white'} variant='h6' component='div' sx={{ flexGrow: 1, my: 2 }}>DOCHUB</Typography>
                
                <Box sx={{display: { xs: "none", sm: "block"}}}>
                    <ul className='navigation-menu'>
                        <li>
                            <Link to={'/'}>Home</Link>
                        </li>
                        <li>
                            <Link to={'/dashboard'}>Dashboard</Link>
                        </li>
                        <li>
                            <Link to={'/assistant'}>Assistant</Link>
                        </li>
                        <li>
                            <Link to={'/upload'}>Upload</Link>
                        </li>
                    </ul>
                </Box>
                </Toolbar>
    
            </AppBar>
        </Box>
    </>
  )
}

export default Header