import Link from "next/link";
import Image from "next/image";
import { StarIcon } from "@heroicons/react/24/solid";

// Markaz Movies on the home page: the most popular titles from the catalogue,
// on the same navy the Movies page uses.
const MoviesStrip = ({ movies = [] }: any) => {
    if (!movies.length) {
        return null;
    }

    return (
        <section className="rounded-panel bg-ink-900 px-5 py-6 text-fg-inverse md:px-8 md:py-8">
            <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-accent">Markaz Movies</p>
                    <h2 className="mt-1 font-display text-xl font-semibold">Popular this week</h2>
                </div>
                <Link href="/movies" className="text-sm font-medium text-accent hover:underline">
                    Open Movies
                </Link>
            </div>

            <ul className="scroll-row -mx-5 px-5 md:mx-0 md:grid md:grid-cols-8 md:gap-4 md:px-0">
                {movies.map((movie: any) => (
                    <li key={movie.slug} className="w-28 md:w-auto">
                        <Link href={`/movies?title=${movie.slug}`} className="group block">
                            <span className="relative block aspect-[2/3] overflow-hidden rounded-card bg-ink-800">
                                <Image
                                    src={`https://image.tmdb.org/t/p/w342${movie.posterPath}`}
                                    alt={movie.title}
                                    fill
                                    sizes="(max-width: 768px) 112px, 150px"
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                            </span>
                            <span className="mt-2 block truncate text-sm text-fg-inverse">{movie.title}</span>
                            <span className="flex items-center gap-1 text-xs text-fg-inverse-muted">
                                <StarIcon className="h-3 w-3 text-accent" />
                                {Number(movie.rating || 0).toFixed(1)}
                                {movie.releaseDate && <> · {movie.releaseDate.slice(0, 4)}</>}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default MoviesStrip;
