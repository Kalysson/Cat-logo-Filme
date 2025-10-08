const API_KEY = "cda92e7c174a8f50a3021437e8bedb0e"; // substitua pela sua chave TMDB
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";

const genresContainer = document.getElementById("genresContainer");
const searchInput = document.getElementById("searchInput");

const profileBtn = document.getElementById("profileBtn");
const profileModal = document.getElementById("profileModal");
const closeModal = document.getElementById("closeModal");
const savedMoviesList = document.getElementById("savedMoviesList");

const fullscreenModal = document.getElementById("fullscreenMovieModal");
const backButton = document.getElementById("backButton");
const fsMoviePoster = document.getElementById("fsMoviePoster");
const fsMovieTitle = document.getElementById("fsMovieTitle");
const fsMovieYear = document.getElementById("fsMovieYear");
const fsMovieOverview = document.getElementById("fsMovieOverview");
const fsMovieRating = document.getElementById("fsMovieRating");

let genresList = [];
let moviesByGenre = {};

// ===== Perfil =====
profileBtn.addEventListener("click", () => {
  updateSavedMovies();
  profileModal.style.display = "block";
});

closeModal.addEventListener("click", () => profileModal.style.display = "none");

window.addEventListener("click", e => {
  if (e.target === profileModal) profileModal.style.display = "none";
});

function updateSavedMovies() {
  savedMoviesList.innerHTML = "";
  let minhaLista = JSON.parse(localStorage.getItem("minhaLista")) || [];
  if (!minhaLista.length) savedMoviesList.innerHTML = "<li>Nenhum filme salvo.</li>";
  else minhaLista.forEach(filme => {
    const li = document.createElement("li");
    li.textContent = filme.title;
    savedMoviesList.appendChild(li);
  });
}

// ===== Modal fullscreen =====
function openFullscreenModal(movie) {
  fsMoviePoster.src = movie.poster_path ? IMG_BASE + movie.poster_path : 'https://via.placeholder.com/300x450?text=Sem+Imagem';
  fsMovieTitle.textContent = movie.title;
  fsMovieYear.textContent = movie.release_date ? `Ano: ${movie.release_date.slice(0,4)}` : "Ano: —";
  fsMovieOverview.textContent = movie.overview || "Sem descrição disponível.";
  fsMovieRating.textContent = `⭐ ${movie.vote_average.toFixed(1)} / 10`;
  fullscreenModal.style.display = "block";
}

backButton.addEventListener("click", () => fullscreenModal.style.display = "none");
window.addEventListener("click", e => { if (e.target === fullscreenModal) fullscreenModal.style.display = "none"; });

// ===== Filmes e gêneros =====
async function fetchGenres() {
  const res = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=pt-BR`);
  const data = await res.json();
  genresList = data.genres;
}

async function fetchMoviesByGenre(genreId) {
  const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&language=pt-BR&sort_by=popularity.desc&with_genres=${genreId}`);
  const data = await res.json();
  return data.results;
}

async function renderGenres() {
  await fetchGenres();
  genresContainer.innerHTML = "";

  for (const genre of genresList) {
    const movies = await fetchMoviesByGenre(genre.id);
    moviesByGenre[genre.name] = movies;

    const section = document.createElement("div");
    section.classList.add("genre-section");
    section.innerHTML = `<h2>${genre.name}</h2>`;

    const row = document.createElement("div");
    row.classList.add("movies-row");

    movies.forEach(movie => {
      const card = document.createElement("div");
      card.classList.add("card");

      card.innerHTML = `
        <img src="${movie.poster_path ? IMG_BASE + movie.poster_path : 'https://via.placeholder.com/150x225?text=Sem+Imagem'}" alt="${movie.title}">
        <div class="card-content">
          <h3>${movie.title}</h3>
          <p>${movie.overview || "Sem descrição disponível."}</p>
          <div class="rating">⭐ ${movie.vote_average.toFixed(1)} / 10</div>
        </div>
      `;

      card.addEventListener("click", () => openFullscreenModal(movie));

      row.appendChild(card);
    });

    section.appendChild(row);
    genresContainer.appendChild(section);
  }
}

// ===== Busca global na API =====
searchInput.addEventListener("input", async (e) => {
  const query = e.target.value.trim();
  if (!query) {
    renderGenres();
    return;
  }

  const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}`);
  const data = await res.json();
  const matchedMovies = data.results;

  genresContainer.innerHTML = "";

  if (!matchedMovies || matchedMovies.length === 0) {
    genresContainer.innerHTML = "<p>Nenhum filme encontrado.</p>";
    return;
  }

  const section = document.createElement("div");
  section.classList.add("genre-section");
  section.innerHTML = `<h2>Resultados da busca</h2>`;

  const row = document.createElement("div");
  row.classList.add("movies-row");

  matchedMovies.forEach(movie => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <img src="${movie.poster_path ? IMG_BASE + movie.poster_path : 'https://via.placeholder.com/150x225?text=Sem+Imagem'}" alt="${movie.title}">
      <div class="card-content">
        <h3>${movie.title}</h3>
        <p>${movie.overview || "Sem descrição disponível."}</p>
        <div class="rating">⭐ ${movie.vote_average.toFixed(1)} / 10</div>
      </div>
    `;

    card.addEventListener("click", () => openFullscreenModal(movie));

    row.appendChild(card);
  });

  section.appendChild(row);
  genresContainer.appendChild(section);
});

// ===== Inicializar =====
renderGenres();
