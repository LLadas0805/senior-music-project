import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link  } from 'react-router-dom';
import { Row, Card } from 'react-bootstrap';
import './articles.css'

const linkStyles = {
  textDecoration: 'none', // Remove underline
  color: 'inherit', // Inherit the color from the parent
};

const PitchforkArticles = () => {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axios.get('/articles'); // Adjust numArticles as needed
        console.log('RESPONSE:', response);
        setArticles(response.data);
        console.log('ARTICLES:', articles);
      } catch (error) {
        console.error('Error fetching articles:', error);
      }
    };

    fetchArticles();
  }, []);

  return (
   
      <Row className="row-cols-1 row-cols-md-4 g-4">
        {articles.map((article, index) => (
          <div key={index} className="col">
            <Link to={`https://pitchfork.com${article.articleUrl}`} style={linkStyles}>
              <Card className = "article-card">
                <Card.Img className = 'article-image p-3' variant="top" src={article.image} alt={article.title} />
                <Card.Body classname = 'card-body'>
                  <Card.Title className = 'card-title article-title'>{article.title}</Card.Title>
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
