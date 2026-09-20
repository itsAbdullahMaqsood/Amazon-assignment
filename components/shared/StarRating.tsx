import { StarIcon } from "@heroicons/react/24/solid";

// Half (or any fraction of a) star is a filled star clipped to a percentage width
// and stacked on top of a slate outline star, so ratings are never rounded.
const StarRating = ({ value, precision = 0.5, size = "w-5 h-5", onChange }: any) => {
    const rating = Number(value) || 0;

    const fillPercentage = (index: number) => {
        const rounded = Math.round(rating / precision) * precision;
        const filled = Math.min(Math.max(rounded - index, 0), 1);
        return `${filled * 100}%`;
    };

    return (
        <div className="flex items-center">
            {[0, 1, 2, 3, 4].map((index) => {
                const star = (
                    <span className="relative inline-flex">
                        <StarIcon className={`${size} text-slate-300`} />
                        <span
                            className="absolute top-0 left-0 overflow-hidden"
                            style={{ width: fillPercentage(index) }}
                        >
                            <StarIcon className={`${size} text-[#FACF19]`} />
                        </span>
                    </span>
                );

                return onChange ? (
                    <button
                        key={index}
                        type="button"
                        onClick={() => onChange(index + 1)}
                        className="cursor-pointer"
                        aria-label={`Rate ${index + 1} out of 5`}
                    >
                        {star}
                    </button>
                ) : (
                    <span key={index}>{star}</span>
                );
            })}
        </div>
    );
};

export default StarRating;
