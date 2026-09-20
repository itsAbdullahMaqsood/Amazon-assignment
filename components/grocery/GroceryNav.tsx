import Link from "next/link";
import Image from "next/image";
import { ArrowPathIcon, Bars3Icon, SparklesIcon } from "@heroicons/react/24/outline";

// One circular tile in the department strip: an illustration (a product photo for
// a real department, an icon for the fixed entries) over a label.
const Tile = ({ href, label, image, icon: Icon, active }: any) => (
    <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className="shrink-0 w-[86px] flex flex-col items-center text-center group"
    >
        <span className="w-[62px] h-[62px] rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center group-hover:border-slate-400">
            {image ? (
                <Image src={image} alt="" width={62} height={62} className="object-contain w-full h-full p-1" />
            ) : (
                <Icon className="w-7 h-7 text-slate-700" />
            )}
        </span>

        <span
            className={`mt-2 pb-1 text-xs leading-tight border-b-2 ${
                active ? "font-bold border-black" : "border-transparent group-hover:border-slate-300"
            }`}
        >
            {label}
        </span>
    </Link>
);

const GroceryNav = ({ departments, active, categoryId }: any) => {
    return (
        <nav aria-label="Grocery departments" className="border-b border-slate-200 bg-white">
            <div className="max-w-[1500px] mx-auto px-4 py-3 flex items-center gap-6">
                <Link href="/groceries" className="shrink-0 hidden md:block">
                    <span className="text-3xl font-bold lowercase text-[#188C43] tracking-tight">
                        grocery
                    </span>
                    <span className="block h-2 w-16 border-b-4 border-[#188C43] rounded-b-full" />
                </Link>

                <p className="shrink-0 hidden lg:block text-sm leading-tight max-w-[215px]">
                    <span className="font-bold">Join Prime for FREE delivery on $25+</span>
                    <br />
                    or $12.99 for Same-day delivery
                </p>

                <div className="flex items-start gap-1 overflow-x-auto scrollbar-hide">
                    <Tile
                        href="/groceries"
                        label="For You"
                        icon={SparklesIcon}
                        active={active === "for-you"}
                    />
                    <Tile href="/buy-again" label="Buy Again" icon={ArrowPathIcon} />

                    {departments.map((department: any) => (
                        <Tile
                            key={department.slug}
                            href={`/groceries?dept=${department.slug}`}
                            label={department.name}
                            image={department.image}
                            active={active === department.slug}
                        />
                    ))}

                    <Tile
                        href={`/browse?category=${categoryId}`}
                        label="See All"
                        icon={Bars3Icon}
                    />
                </div>
            </div>
        </nav>
    );
};

export default GroceryNav;
