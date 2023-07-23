const searchBar = document.getElementById('searchBar');
const searchButton = document.getElementById('searchButton');
const moviesContainer = document.getElementById('moviesContainer');
const paginationContainer = document.getElementById('paginationContainer');
const movieDetailsContainer = document.getElementById('movieDetailsContainer');

let moviesData = [];
const moviesPerPage = 10;
let currentPage = 1;
let totalResults = 0;

const apiKey = 'a963dea3';

async function fetchMovies(searchQuery, page) {
    try {
        const response = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&type=movie&s=${searchQuery}&page=${page}`);
        const data = await response.json();

        if (data.Response === 'True') {
            moviesData = data.Search;
            totalResults = parseInt(data.totalResults);
            currentPage = page;
            displayMovies();
            createPagination();
        } else {
            console.error('Error fetching movies:', data.Error);
        }
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
}

async function fetchMovieDetails(movieID) {
    try {
        const response = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${movieID}`);
        const data = await response.json();
        if (data.Response === 'True') {
            displayMovieDetails(data);
        } else {
            console.error('Error fetching movie details:', data.Error);
        }
    } catch (error) {
        console.error('Error fetching movie details:', error);
    }
}

function displayMovies() {
    moviesContainer.innerHTML = '';

    const startIndex = 0;
    const endIndex = 10;

    const rowContainer = document.createElement('div');
    rowContainer.classList.add('row-container');

    for (let i = startIndex; i < endIndex && i < moviesData.length; i++) {

        const movie = moviesData[i];
        console.log(movie);


        const movieItem = document.createElement('div');
        movieItem.classList.add('movie-item');

        const movieBanner = document.createElement('img');
        movieBanner.src = movie.Poster;
        movieBanner.alt = "Movie Poster Not Found";


        const movieTitle = document.createElement('p');
        movieTitle.textContent = movie.Title;

        movieItem.appendChild(movieBanner);
        movieItem.appendChild(movieTitle);
        movieItem.addEventListener('click', async () => {
            const movieID = movie.imdbID;
            const movieData = await fetchMovieDetails(movieID);
            displayMovieDetails(movieData);
        });

        rowContainer.appendChild(movieItem);
    }

    moviesContainer.appendChild(rowContainer);
}



function createPagination() {
    // console.log('called');
    paginationContainer.innerHTML = '';

    const totalPages = Math.ceil(totalResults / moviesPerPage);

    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            fetchMovies(searchBar.value.trim(), currentPage - 1);
        }
    });
    paginationContainer.appendChild(prevButton);

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.disabled = i === currentPage;
        button.addEventListener('click', (event) => {
            fetchMovies(searchBar.value.trim(), parseInt(event.target.textContent));
        });
        paginationContainer.appendChild(button);
    }


    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            fetchMovies(searchBar.value.trim(), currentPage + 1);
        }
    });
    paginationContainer.appendChild(nextButton);
}

function calculateAverageRating(ratings) {
    if (ratings.length === 0) {
        return 0;
    }

    const sum = ratings.reduce((total, rating) => total + parseInt(rating), 0);
    return sum / ratings.length;
}

function displayMovieDetails(movieDetails) {
    console.log(movieDetails);
    const detailsContainer = document.createElement('div');
    detailsContainer.classList.add('details-container');

    const posterContainer = document.createElement('div');
    posterContainer.classList.add('poster-container');

    const posterImage = document.createElement('img');
    posterImage.src = movieDetails.Poster;
    posterImage.alt = movieDetails.Title;

    posterContainer.appendChild(posterImage);

    const storedComments = JSON.parse(localStorage.getItem(`${movieDetails.imdbID}-comments`)) || [];
    const storedRatings = JSON.parse(localStorage.getItem(`${movieDetails.imdbID}-ratings`)) || [];
    const averageRating = calculateAverageRating(storedRatings);


    detailsContainer.innerHTML = `
      <h2>${movieDetails.Title}</h2>
      <p><strong>Year:</strong> ${movieDetails.Year}</p>
      <p><strong>Genre:</strong> ${movieDetails.Genre}</p>
      <p><strong>Plot:</strong> ${movieDetails.Plot}</p>
      <!-- Add more movie details as needed -->
  
      <div class="rating-container">
        <label for="rating">Rating:</label>
        <input type="number" id="rating" name="rating" min="1" max="5" step="1" value="1">
      </div>
  
      <div class="comment-container">
        <label for="comment">Comment:</label>
        <textarea id="comment" name="comment" rows="4" placeholder="Write your comment here..."></textarea>
      </div>
  
      <button id="submitReview">Submit Review</button>
    `;

    movieDetailsContainer.innerHTML = '';
    movieDetailsContainer.appendChild(posterContainer);
    movieDetailsContainer.appendChild(detailsContainer);
    const commentsSection = document.createElement('div');
    commentsSection.id = 'commentsSection';

    if (storedComments.length > 0) {
        const commentsList = document.createElement('ul');
        storedComments.forEach(comment => {
            const commentItem = document.createElement('li');
            commentItem.textContent = comment;
            commentsList.appendChild(commentItem);
        });
        commentsSection.appendChild(commentsList);
    } else {
        commentsSection.textContent = 'No comments yet.';
    }

    const averageRatingElement = document.createElement('div');
    averageRatingElement.id = 'averageRating';
    averageRatingElement.textContent = `Average Rating: ${averageRating.toFixed(1)}`;

    detailsContainer.appendChild(commentsSection);
    detailsContainer.appendChild(averageRatingElement);

    movieDetailsContainer.classList.add('show');


    const submitReviewButton = document.getElementById('submitReview');
    submitReviewButton.addEventListener('click', () => {
        var rating = document.getElementById('rating').value;
        var comment = document.getElementById('comment').value;
        if (rating > 5) {
            rating = 5;
        }
        if (rating < 1) {
            rating = 1;
        }

        storedRatings.push(rating);
        storedComments.push(comment);
        localStorage.setItem(`${movieDetails.imdbID}-ratings`, JSON.stringify(storedRatings));
        localStorage.setItem(`${movieDetails.imdbID}-comments`, JSON.stringify(storedComments));

        console.log('Rating:', rating);
        console.log('Comment:', comment);
        document.getElementById('comment').value = "";
        document.getElementById('rating').value = 1;
        displayMovieDetails(movieDetails);

    });
}


searchButton.addEventListener('click', () => {
    fetchMovies(searchBar.value.trim(), 1);
});

fetchMovies('har', 1);
