import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import '../styles/HomeStyles.css';
import home1 from '../images/image5.png';
import home2 from '../images/image2.jpg';
import home3 from '../images/image3.png';
import home4 from '../images/image4.jpg';
import home5 from '../images/image5.png';
import ChatWidget from '../components/Layout/ChatWidget';

const Home: React.FC = () => {
  const [backgroundImage, setBackgroundImage] = useState(home1);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;

      // Define the scroll positions where you want to change the background image
      const breakpoints = [0]; // Adjust as needed
      const image = [home1]; // Add more images if necessary

      // Determine the current background image based on the scroll position
      for (let i = 0; i < breakpoints.length - 1; i++) {
        if (scrollPosition >= breakpoints[i] && scrollPosition < breakpoints[i + 1]) {
          setBackgroundImage(images[i]);
        }
      }

      // Set the last image if scroll position exceeds the last breakpoint
      if (scrollPosition >= breakpoints[breakpoints.length - 1]) {
        setBackgroundImage(images[images.length - 1]);
      }
    };

    // Attach the scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Remove the event listener when the component unmounts
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
    <Layout >
      <div className="home" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <div className="headerContainer">
          <h1>Sequus.AI</h1>
          <p>Where construction plans find <br/> their home!</p>
          <Link to="/upload">
            <button>Get Started</button>
          </Link>
        </div>
      </div>
      
    </Layout>
    <ChatWidget />
    </>
  );
};

export default Home;
