import Link from "next/link";
import Image from "next/image";

// The masthead: what the browsing history says the shopper is shopping for, and
// the thumbnails of the listings that said it.
const ViewedStrip = ({ heading, items }: any) => {
    return (
        <section className="flex flex-col md:flex-row md:items-start gap-6 md:gap-10 py-6 border-b border-slate-300">
            <h1 className="text-2xl md:text-3xl shrink-0">
                Keep shopping for
                <span className="block font-bold">{heading}</span>
            </h1>

            <Link
                href="/profile/recent"
                className="text-accent-ink text-sm hover:underline md:mt-2 shrink-0"
            >
                Edit
            </Link>

            <ul className="flex items-start gap-4 overflow-x-auto scrollbar-hide">
                {items.map((item: any) => (
                    <li key={`${item._id}-${item.style}`} className="shrink-0 text-center">
                        <Link
                            href={`/product/${item.slug}?style=${item.style}`}
                            className="block w-[100px] h-[100px] border-2 border-accent-ink rounded p-1 relative"
                        >
                            {item.image && (
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    sizes="100px"
                                    className="object-contain p-1"
                                />
                            )}
                        </Link>

                        <p className="text-xs text-slate-600 mt-1">
                            {item.views} viewed
                        </p>
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default ViewedStrip;
