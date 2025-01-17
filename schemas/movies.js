const zod = require('zod');

const movieSchema = zod.object({
    title: zod.string({
        invalid_type_error: 'Movie title must be a string',
        required_error: 'Movie title is required',
    }),
    year: zod.number().int().min(1900).max(2024),
    director: zod.string(),
    duration: zod.number().int().positive(),
    rate: zod.number().min(0).max(10).default(5),
    poster: zod.string({ message: 'Poster must be a valid URL' }),
    genre: zod.array(
        zod.enum([
            'Action',
            'Adventure',
            'Crime',
            'Comedy',
            'Drama',
            'Fantasy',
            'Horror',
            'Thriller',
            'Sci-Fi',
        ]),
        {
            required_error: 'Movie genre is required',
            invalid_type_error: 'Movie genre must be an array of enum genre',
        }
    ),
});

function validateMovie(input) {
    return movieSchema.safeParse(input);
}

function validatePartialMovie(input) {
    return movieSchema.partial().safeParse(input);
}

module.exports = {
    validateMovie,
    validatePartialMovie,
};
