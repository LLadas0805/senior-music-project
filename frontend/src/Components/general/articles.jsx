// Import modules, components, and styles
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link  } from 'react-router-dom';
import { Row, Card } from 'react-bootstrap';
import './articles.css';

// Styles for Link component
const linkStyles = {
  textDecoration: 'none', // Remove underline
  color: 'inherit', // Inherit the color from the parent
};

const PitchforkArticles = () => {
  // State to store fetched articles
  const [articles, setArticles] = useState([]);

  // Fetch articles data on component mount
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        // Fetch articles from the server (adjust endpoint and parameters as needed)
        const response = await axios.get('/articles');
        console.log('RESPONSE:', response);
        
        // Set fetched articles to state
        setArticles(response.data);
        console.log('ARTICLES:', articles); // This log may not display updated state due to closure
      } catch (error) {
        console.error('Error fetching articles:', error);
      }
    };

    // Call the fetchArticles function
    fetchArticles();
  }, []); // Empty dependency array ensures this effect runs only once, on mount

  return (
    <Row className="row-cols-1 row-cols-md-4 g-4">
      {/* Map through articles and create Card components for each loop*/}
      {articles.map((article, index) => (
        <div key={index} className="col">
          {/* Link to the original Pitchfork article */}
          <Link to={`https://pitchfork.com${article.articleUrl}`} style={linkStyles}>
            {/* Individual Card component for each article */}
            <Card className="article-card">
              {/* Article image */}
              <Card.Img className='article-image p-3' variant="top" src={article.image} alt={article.title} />
              <Card.Body className='card-body'>
                {/* Article title */}
                <Card.Title className='card-title article-title'>{article.title}</Card.Title>
                {/* Source of article */}
                <Card.Subtitle className="card-subtitle">
                  {'From Pitchfork'}
                </Card.Subtitle>
              </Card.Body>
            </Card>
          </Link>
        </div>
      ))}
    </Row>
  );
};

export default PitchforkArticles;
