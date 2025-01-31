import { movies } from "../data/movies.js";

console.log("Loaded movies:", movies);

// Get references to table elements and alert messages in the DOM
const allMoviesTable = document.querySelector("#all-movies-container table");
const pinnedMoviesTable = document.querySelector("#pinned-movies-container table");
const allMoviesAlert = document.querySelector("#all-movies-container .alert");
const pinnedMoviesAlert = document.querySelector("#pinned-movies-container .alert");

// Retrieve the list of pinned movies from local storage
function getPinnedMoviesFromStorage() {
    return JSON.parse(localStorage.getItem("pinnedMovies")) || [];
}

// Save the updated list of pinned movies to local storage
function savePinnedMoviesToStorage(pinnedMovies) {
    localStorage.setItem("pinnedMovies", JSON.stringify(pinnedMovies));
}

// Format the release date into a human-readable format (YYYY-MM-DD HH:MM:SS AM/PM)
function formatDateTime(timestamp) {
    const date = new Date(timestamp * 1000);
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    return date.toLocaleString('en-US', options);
}

// Insert movies into a given table element, sorting them by rating in descending order
function insertMoviesIntoTable(eleTable, movies) {
    movies.sort((a, b) => b.rating - a.rating);
    
    const tbody = eleTable.querySelector("tbody");
    tbody.innerHTML = "";
    
    movies.forEach(movie => {
        // Skip movies belonging to the "Drama" genre
        if (movie.genre === "Drama") return;
        
        const row = tbody.insertRow();
        row.insertCell(0).textContent = movie.title; // Movie title
        row.insertCell(1).textContent = movie.genre; // Genre
        row.insertCell(2).textContent = formatDateTime(movie.release_date); // Formatted release date
        row.insertCell(3).textContent = movie.director; // Director
        row.insertCell(4).textContent = movie.rating; // Rating
        
        // Create a button for pinning/unpinning movies
        const buttonCell = row.insertCell(5);
        const button = document.createElement("button");
        button.classList.add("btn");
        
        let pinnedMovies = getPinnedMoviesFromStorage();
        let isPinned = pinnedMovies.some(m => m.title === movie.title);
        
        button.classList.add(isPinned ? "btn-danger" : "btn-primary");
        button.innerHTML = isPinned ? '<i class="fas fa-times"></i>' : '<i class="fas fa-thumbtack"></i>';
        
        // Toggle pinned status on button click and refresh the page
        button.addEventListener("click", () => {
            let updatedMovies = isPinned 
                ? pinnedMovies.filter(m => m.title !== movie.title) 
                : [...pinnedMovies, movie];
            
            savePinnedMoviesToStorage(updatedMovies);
            location.reload();
        });
        
        buttonCell.appendChild(button);
        
        // Apply row styling based on movie rating
        if (movie.rating <= 2) row.classList.add("table-danger");
        else if (movie.rating <= 5) row.classList.add("table-warning");
        else if (movie.rating <= 8) row.classList.add("table-primary");
        else row.classList.add("table-success");
    });
    
    // Ensure the table is visible after populating data
    eleTable.classList.remove("d-none");
}

// Retrieve pinned movies from storage and display them
const pinnedMovies = getPinnedMoviesFromStorage();
console.log("Pinned movies:", pinnedMovies);

if (pinnedMovies.length === 0) pinnedMoviesAlert.classList.remove("d-none");
else {
    pinnedMoviesAlert.classList.add("d-none");
    insertMoviesIntoTable(pinnedMoviesTable, pinnedMovies);
}

// Display all movies from the dataset
if (movies.length === 0) allMoviesAlert.classList.remove("d-none");
else {
    allMoviesAlert.classList.add("d-none");
    insertMoviesIntoTable(allMoviesTable, movies);
}
