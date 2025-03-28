document.addEventListener("DOMContentLoaded", () => {
    const genreSelect = document.getElementById("genre-selector");
    const ratingSelect = document.getElementById("rating-selector");
    const table = document.querySelector("table");
    const alertBox = document.querySelector(".alert");
    const tbody = table.querySelector("tbody");

    genreSelect.addEventListener("change", updateMovies);
    ratingSelect.addEventListener("change", updateMovies);

    updateMovies();

    async function updateMovies() {
        const genre = genreSelect.value;
        const rating = ratingSelect.value;

        try {
            const movies = await fetchMovies(genre, rating);
            movies.sort((a, b) => a.rating - b.rating);

            if (movies.length === 0) {
                table.classList.add("d-none");
                alertBox.classList.remove("d-none");
            } else {
                table.classList.remove("d-none");
                alertBox.classList.add("d-none");
                insertMoviesIntoTable(tbody, movies);
            }
        } catch (err) {
            console.error("Error fetching movies:", err.message);
            alertBox.classList.remove("d-none");
            table.classList.add("d-none");
        }
    }
});

async function fetchMovies(genre = null, rating = null) {
    const url = new URL("/api/movies", window.location.origin);
    const params = new URLSearchParams();

    if (genre) params.append("genre", genre);
    if (rating) params.append("rating", rating);

    url.search = params.toString();

    const headers = new Headers({
        "Accept": "application/json"
    });

    const request = new Request(url, {
        method: "GET",
        headers: headers
    });

    const response = await fetch(request);

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
}

function insertMoviesIntoTable(tbody, movies) {
    tbody.innerHTML = "";

    movies.forEach(movie => {
        const row = tbody.insertRow();

        const titleCell = row.insertCell();
        const genreCell = row.insertCell();
        const releaseDateCell = row.insertCell();
        const directorCell = row.insertCell();
        const ratingCell = row.insertCell();

        titleCell.textContent = movie.title;
        genreCell.textContent = movie.genre;

        const releaseDate = new Date(movie.release_date * 1000);
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        };
        const formattedDateTime = releaseDate.toLocaleString('en-US', options);
        const [datePart, timePart] = formattedDateTime.split(', ');
        const [month, day, year] = datePart.split('/');
        const isoDate = `${year}-${month}-${day}`;
        releaseDateCell.textContent = `${isoDate} , ${timePart}`;

        directorCell.textContent = movie.director;
        ratingCell.textContent = movie.rating;

        const rating = parseFloat(movie.rating);

        if (movie.rating <= 2) row.classList.add("table-danger");
        else if (movie.rating > 2 && movie.rating <= 5) row.classList.add("table-warning");
        else if (movie.rating > 5 && movie.rating <= 8) row.classList.add("table-info");
        else if (movie.rating > 8) row.classList.add("table-success");
    });
}