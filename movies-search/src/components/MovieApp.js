import React, { useEffect, useState } from 'react';
import './MovieApp.css';
import axios from 'axios';
const API_KEY = process.env.REACT_APP_OMDB_API_KEY;


function MovieApp() {
  const [movies, setMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortBy, setSortBy] = useState('title.asc'); // Sort state
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    setGenres([
      { id: 'action', name: 'Action' },
      { id: 'comedy', name: 'Comedy' },
      { id: 'drama', name: 'Drama' },
      { id: 'horror', name: 'Horror' },
    ]);
  }, []);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get('http://www.omdbapi.com/', {
          params: {
            apikey: API_KEY,
            s: searchQuery || 'Avengers', // Default search query
          },
        });

        let movieResults = response.data.Search || [];

        // Fetch additional movie details (rating & plot) for each movie
        const detailedMovies = await Promise.all(
          movieResults.map(async (movie) => {
            const detailsResponse = await axios.get('http://www.omdbapi.com/', {
              params: {
                apikey: API_KEY,
                i: movie.imdbID, // Fetch details by IMDb ID
              },
            });
            return { ...movie, rating: detailsResponse.data.imdbRating, plot: detailsResponse.data.Plot };
          })
        );

        // Sorting logic
        if (sortBy === 'title.asc') {
          detailedMovies.sort((a, b) => a.Title.localeCompare(b.Title));
        } else if (sortBy === 'title.desc') {
          detailedMovies.sort((a, b) => b.Title.localeCompare(a.Title));
        } else if (sortBy === 'year.asc') {
          detailedMovies.sort((a, b) => parseInt(a.Year) - parseInt(b.Year));
        } else if (sortBy === 'year.desc') {
          detailedMovies.sort((a, b) => parseInt(b.Year) - parseInt(a.Year));
        }

        setMovies(detailedMovies);
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
    };

    if (searchQuery) {
      fetchMovies();
    }
  }, [searchQuery, sortBy]);

  return (
    <div>
      <h1>MovieHub</h1>
      <div className='search-bar'>
        <input
          type='text'
          placeholder='Enter Movie Name'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='search-input'
        />
        <button onClick={() => setSearchQuery(searchQuery)} className='search-button'>
          <i className="bi bi-search"></i>
        </button>
      </div>

      {/* Filters Section */}
      <div className='filters'>
        <label htmlFor='sort-by'>Sort By:</label>
        <select id='sort-by' value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value='title.asc'>Title (A-Z)</option>
          <option value='title.desc'>Title (Z-A)</option>
          <option value='year.asc'>Year (Oldest First)</option>
          <option value='year.desc'>Year (Newest First)</option>
        </select>

        <label htmlFor='genre'>Genre</label>
        <select id='genre' value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
          <option value=''>All Genres</option>
          {genres.map((genre) => (
            <option key={genre.id} value={genre.id}>
              {genre.name}
            </option>
          ))}
        </select>
      </div>

      {/* Movie List with Rating & Description */}
      <div className="movie-list">
  {movies.length > 0 ? (
    movies.map((movie) => (
      <div key={movie.imdbID} className="movie-card">
        <img src={movie.Poster} alt={movie.Title} />
        <h3>{movie.Title}</h3>
        <p><strong>Year:</strong> {movie.Year}</p>
        <p><strong>Rating:</strong> ⭐ {movie.rating || 'N/A'}</p>
        <p className="movie-plot"><strong>About:</strong> {movie.plot || 'No description available.'}</p>
      </div>
    ))
  ) : (
    <p>No movies found</p>
  )}
</div>

    </div>
  );
}

export default MovieApp;
