const express = require('express');
const movies = require('./movies.json');
const crypto = require('node:crypto');
const { validateMovie, validatePartialMovie } = require('./schemas/movies');

const app = express();
const PORT = process.env.PORT ?? 1234;
app.disable('x-powered-by');
app.use(express.json());

const ACCEPTED_ORIGINS = [
    'http://localhost:8080',
    'http://localhost:1234',
    'https://movies.com',
    'https://midu.dev',
];

app.get('/movies', (req, res) => {
    const origin = req.header('origin');
    if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    const { genre, rate } = req.query;

    let filteredMovies = movies;

    if (genre) {
        filteredMovies = filteredMovies.filter((movie) =>
            movie.genre.some(
                (e) => e.toLocaleLowerCase() === genre.toLocaleLowerCase()
            )
        );
    }

    if (rate) {
        filteredMovies = filteredMovies.filter((movie) => movie.rate >= rate);
    }
    res.json(filteredMovies);
    //     const filteredMovies = movies
    //         .filter((movie) => !genre || movie.genre.some((e) => e.toLocaleLowerCase() === genre.toLocaleLowerCase()))
    //         .filter((movie) => !rate || movie.rate >= rate);

    //     res.json(filteredMovies);
    // });
});

app.get('/movies/:id', (req, res) => {
    const { id } = req.params;
    const movie = movies.find((movie) => movie.id === id);
    if (movie) return res.json(movie);

    res.status(404).json({ message: 'Movie not found' });
});

app.post('/movies', (req, res) => {
    const result = validateMovie(req.body);
    if (result.error) {
        return res
            .status(400)
            .json({ error: JSON.parse(result.error.message) });
    }

    const newMovie = {
        id: crypto.randomUUID(),
        ...result.data,
    };

    movies.push(newMovie);
    res.status(201).json(newMovie);
});

app.patch('/movies/:id', (req, res) => {
    const result = validatePartialMovie(req.body);

    if (result.error) {
        res.status(400);
        res.json({ error: JSON.parse(result.error.message) });
    }

    const { id } = req.params;
    const movieIndex = movies.findIndex((movie) => movie.id === id);
    if (movieIndex === -1) {
        res.status(404).json({ message: 'Movie not found' });
    }

    const updateMovie = {
        ...movies[movieIndex],
        ...result.data,
    };

    movies[movieIndex] = updateMovie;
    res.status(200);
    res.json(updateMovie);
});

app.delete('/movies/:id', (req, res) => {
    const origin = req.header('origin');
    if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    const { id } = req.params;
    const movieIndex = movies.findIndex((movie) => movie.id === id);
    if (movieIndex === -1) {
        return res.status(404).json({ message: 'Movie not found' });
    }

    movies.splice(movieIndex, 1);
    return res.json({ message: 'Movie deleted' });
});

app.options('/movies/:id', (req, res) => {
    const origin = req.header('origin');
    if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    }
    res.send(200);
});

app.listen(PORT, () => {
    console.log(`Server listening on port http://localhost:${PORT} `);
});
