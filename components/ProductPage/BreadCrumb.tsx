import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

const BreadCrumb = ({ category, subCategories }: any) => {
    return (
        <div className="flex items-center flex-wrap text-sm text-gray-600 py-3">
            <Link href="/" className="hover:underline">
                Home
            </Link>

            <ChevronRightIcon className="h-3 mx-1" />

            <Link href={`/browse?category=${category?._id}`} className="hover:underline">
                {category?.name}
            </Link>

            {subCategories?.map((sub: any) => (
                <span key={sub._id} className="flex items-center">
                    <ChevronRightIcon className="h-3 mx-1" />
                    <Link
                        href={`/browse?category=${category?._id}&sub=${sub._id}`}
                        className="hover:underline"
                    >
                        {sub.name}
                    </Link>
                </span>
            ))}
        </div>
    );
};

export default BreadCrumb;
