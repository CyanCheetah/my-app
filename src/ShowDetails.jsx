import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './App.css';
//ADD COMMENTS!!!!!!
const TMDB_API_KEY = '7ceb22d73d90c1567ca77b9aedb51cd8';

function ShowDetails() {
  const [showDetails, setShowDetails] = useState(null);
  const [actors, setActors] = useState([]);
  const [selectedActor, setSelectedActor] = useState(null);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [watched, setWatched] = useState(false); 
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShowDetails = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_API_KEY}&language=en-US`
        );
        const data = await response.json();
        setShowDetails(data);

        // Set the page title to the name of the current show
        if (data.name) {
          document.title = `${data.name} - CyanBase`; // Set dynamic title
        }

        const actorsResponse = await fetch(
          `https://api.themoviedb.org/3/tv/${id}/credits?api_key=${TMDB_API_KEY}`
        );
        const actorsData = await actorsResponse.json();
        setActors(actorsData.cast);
      } catch (error) {
        console.error('Error fetching show details:', error);
      }
    };

    if (id) fetchShowDetails();
  }, [id]);

  const handleSearchInput = (e) => {
    setQuery(e.target.value);
  };

  const handleSearch = async (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      try {
        setShowDetails(null);
        setActors([]);
        setIsSearchActive(true);

        const response = await fetch(
          `https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&query=${query}&language=en-US`
        );
        const data = await response.json();
        setSearchResults(data.results.filter((show) => show.poster_path));
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
    }
  };

  const handleLogoClick = () => {
    setQuery('');
    setSearchResults([]);
    setIsSearchActive(false);
    setShowDetails(null);
    navigate('/');
  };

  const handleShowClick = () => {
    setIsSearchActive(false);
  };

  const handleActorClick = async (actorId) => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/person/${actorId}?api_key=${TMDB_API_KEY}&language=en-US`
      );
      const actorData = await response.json();
      setSelectedActor(actorData); 
    } catch (error) {
      console.error('Error fetching actor details:', error);
    }
  };

  const closeActorModal = () => {
    setSelectedActor(null);
  };

  const handleMarkAsWatched = async () => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/account/{account_id}/watchlist?api_key=${TMDB_API_KEY}&session_id=YOUR_SESSION_ID`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            media_type: 'tv',
            media_id: id,
            watchlist: true,
          }),
        }
      );
  
      if (response.ok) {
        setWatched(true); // Update watched status
      } else {
        console.error('Error marking show as watched:', await response.json());
      }
    } catch (error) {
      console.error('Error marking show as watched:', error);
    }
  };

  return (
    <div className="show-details">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="logo-container">
        <span onClick={handleLogoClick} className="logo">
        <img
            src="https://images.vexels.com/content/128877/preview/television-flat-icon-48e28d.png"
            alt="logo"
            className="logo-image"
        />
        CyanBase
        </span>
        </div>
        <div className="search-container">
          <input
            type="text"
            className="search-bar"
            placeholder="Search..."
            value={query}
            onChange={handleSearchInput}
            onKeyPress={handleSearch}
          />
          <button className="button" type="submit" onClick={handleSearch}><i className="fa fa-search"></i></button>
        </div>
      </div>

      {/* Search Results */}
      {isSearchActive && searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((show) => (
            <Link to={`/show/${show.id}`} key={show.id} className="search-result-item">
            <div className="result-content">
              <div className="result-poster">
                <img
                  src={`https://image.tmdb.org/t/p/w200${show.poster_path}`}
                  alt={show.name}
                  className="poster-img"
                />
              </div>
              <div className="result-info">
                <h3>{show.name}</h3>
                <p>
                  <strong>First Air Date:</strong> {show.first_air_date || 'N/A'}
                </p>
                <p>
                  <strong>Description:</strong> {show.overview || 'No description available.'}
                </p>
              </div>
            </div>
          </Link>
          ))}
        </div>
      )}

      {/* Show Details Content */}
      {showDetails && !isSearchActive && (
        <div className="show-details-content">
          <div className="show-details-left">
            <img
              src={`https://image.tmdb.org/t/p/w1280${showDetails.poster_path}`}
              alt={showDetails.name}
              className="show-poster-img"
            />
            {/* Mark as Watched Button */}
            <button className="watch-button" onClick={handleMarkAsWatched} disabled={watched}>
              {watched ? 'Watched' : 'Mark as Watched'}
            </button>
          </div>
          <div className="show-details-right">
            <h2>{showDetails.name}</h2>
            <p>{showDetails.overview}</p>
            <h3>Genres</h3>
            <p>{showDetails.genres.map((genre) => genre.name).join(', ')}</p>
            <h3>First Air Date: {showDetails.first_air_date}</h3>
            <h3>Average Rating: {showDetails.vote_average}</h3>
            <div className="actors-list">
              {actors.slice(0, 12).map((actor) => (
                <div
                  key={actor.id}
                  className="actor-item"
                  onClick={() => handleActorClick(actor.id)}
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                    alt={actor.name}
                    className="actor-image"
                  />
                  <p>{actor.name}</p>
                </div>
              ))}
            </div>
            
          </div>
        </div>
      )}

      {/* Actor Details Modal */}
      {selectedActor && (
        <div className="actor-details-modal">
          <div className="actor-details-content">
            <button className="close-button" onClick={closeActorModal}>
              ×
            </button>
            <img
              src={`https://image.tmdb.org/t/p/w300${selectedActor.profile_path}`}
              alt={selectedActor.name}
              className="actor-details-image"
            />
            <h2>{selectedActor.name}</h2>
            <p><strong>Born:</strong> {selectedActor.birthday || 'N/A'}</p>
            <p>{selectedActor.biography || 'No biography available.'}</p>
          </div>
        </div>
      )}
      {/* Footer */}
      <footer className="footer">
        <div className="footer-left">
          &copy; {new Date().getFullYear()}
          <a href="https://github.com/CyanCheetah" target="_blank" rel="noopener noreferrer"> Sai Tanuj Karavadi</a>
        </div>
        <div className="footer-center">
          Film data from <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="tmdb-link">TMDB</a>
        </div>
        <div className="footer-right">
          <a href="about.html" className="about-link">About</a>
        </div>
      </footer>
    </div>
  );
}

export default ShowDetails;
