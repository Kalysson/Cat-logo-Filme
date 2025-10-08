const API_KEY = "SUA_CHAVE_AQUI"; // substitua pela sua chave da TMDB
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";

const genresContainer = document.getElementById("genresContainer");
const searchInput = document.getElementById("searchInput");

let genresList = [];
let moviesByGenre = {};

// ===== 1️⃣ Buscar todos os gêneros =====
async function fetchGenres() {
  const res = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=pt-BR`);
  const data = await res.json();
  genresList = data.genres;
}

// ===== 2️⃣ Buscar filmes por gênero =====
async function fetchMoviesByGenre(genreId) {
  const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&language=pt-BR&sort_by=popularity.desc&with_genres=${genreId}`);
  const data = await res.json();
  return data.results;
}

// ===== 3️⃣ Renderizar todos os gêneros =====
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

    movies.forEach((movie) => {
      const card = document.createElement("div");
      card.classList.add("card");

      card.innerHTML = `
        <img src="${movie.poster_path ? IMG_BASE + movie.poster_path : 'https://via.placeholder.com/200x300?text=Sem+Imagem'}" alt="${movie.title}">
        <div class="card-content">
          <h3>${movie.title}</h3>
          <p>${movie.overview || "Sem descrição disponível."}</p>
          <div class="rating">⭐ ${movie.vote_average.toFixed(1)} / 10</div>
        </div>
      `;
      row.appendChild(card);
    });

    section.appendChild(row);
    genresContainer.appendChild(section);
  }
}

// ===== 4️⃣ Buscar por nome na barra de pesquisa =====
searchInput.addEventListener("input", async (e) => {
  const query = e.target.value.trim().toLowerCase();
  if (!query) {
    renderGenres();
    return;
  }

  genresContainer.innerHTML = "";

  const matchedMovies = [];

  for (const genreName in moviesByGenre) {
    moviesByGenre[genreName].forEach(movie => {
      if (movie.title.toLowerCase().includes(query)) matchedMovies.push(movie);
    });
  }

  if (matchedMovies.length === 0) {
    genresContainer.innerHTML = "<p>Nenhum filme encontrado.</p>";
    return;
  }

  const section = document.createElement("div");
  section.classList.add("genre-section");
  section.innerHTML = `<h2>Resultados da busca</h2>`;

  const row = document.createElement("div");
  row.classList.add("movies-row");

  matchedMovies.forEach((movie) => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <img src="${movie.poster_path ? IMG_BASE + movie.poster_path : 'https://via.placeholder.com/200x300?text=Sem+Imagem'}" alt="${movie.title}">
      <div class="card-content">
        <h3>${movie.title}</h3>
        <p>${movie.overview || "Sem descrição disponível."}</p>
        <div class="rating">⭐ ${movie.vote_average.toFixed(1)} / 10</div>
      </div>
    `;
    row.appendChild(card);
  });

  section.appendChild(row);
  genresContainer.appendChild(section);
});

// ===== Inicializar =====
renderGenres();
