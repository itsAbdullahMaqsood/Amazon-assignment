import Link from "next/link";
import Image from "next/image";

// The aisle strip that sits under the selected department. Picking the aisle that
// is already selected clears it, which is how the department goes back to showing
// every aisle.
const AisleTabs = ({ aisles, department, active }: any) => {
    if (!aisles.length) {
        return null;
    }

    return (
        <nav aria-label={`${department.name} aisles`} className="border-b border-slate-200 bg-white">
            <ul className="max-w-[1500px] mx-auto px-4 py-3 flex items-start gap-2 overflow-x-auto scrollbar-hide">
                {aisles.map((aisle: any) => {
                    const selected = active === aisle.slug;

                    return (
                        <li key={aisle.slug}>
                            <Link
                                href={
                                    selected
                                        ? `/groceries?dept=${department.slug}`
                                        : `/groceries?dept=${department.slug}&aisle=${aisle.slug}`
                                }
                                aria-current={selected ? "page" : undefined}
                                className="shrink-0 w-[104px] flex flex-col items-center text-center group"
                            >
                                <span className="w-[76px] h-[76px] bg-slate-50 border border-slate-200 rounded overflow-hidden flex items-center justify-center">
                                    {aisle.image && (
                                        <Image
                                            src={aisle.image}
                                            alt=""
                                            width={76}
                                            height={76}
                                            className="object-contain w-full h-full p-1"
                                        />
                                    )}
                                </span>

                                <span
                                    className={`mt-2 text-sm leading-tight ${
                                        selected ? "font-semibold underline" : "group-hover:underline"
                                    }`}
                                >
                                    {aisle.name}
                                </span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};

export default AisleTabs;
