import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import '../styles/HomeStyles.css';
import home from '../images/home.jpg';
import "../styles/HeaderStyles.css";

const Home: React.FC = () => {
  return (
    <Layout>
      <div className="home" style={{ backgroundImage: `url(${home})` }}>
        <div className="headerContainer">
          <h1>Document Website</h1>
          <p>rtfgyhjkl</p>
          <Link to="/upload">
            <button>Getting Started</button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
