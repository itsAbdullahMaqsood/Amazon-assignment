import Link from "next/link";
import Image from "next/image";
import { PencilSquareIcon, PlusIcon } from "@heroicons/react/24/outline";

import connectDb from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { requireAdminPage } from "@/lib/guard";
import { escapeRegex } from "@/utils/regex";
import { Badge, EmptyState, PageHeader, btn, field, table } from "@/components/admin/ui";
import Price from "@/components/shared/Price";
import DeleteProductButton from "@/components/admin/product/DeleteProductButton";

export const metadata = { title: "Products" };

const PER_PAGE = 20;

const Page = async ({ searchParams }: any) => {
    await requireAdminPage("/admin/dashboard/product");

    const query = await searchParams;
    const q = String(query?.q || "").trim();
    const category = String(query?.category || "");
    const page = Math.max(1, Number(query?.page) || 1);

    await connectDb();

    const filter: any = {
        ...(q && { name: { $regex: escapeRegex(q), $options: "i" } }),
        ...(/^[0-9a-f]{24}$/i.test(category) && { category }),
    };

    const [products, total, categories] = await Promise.all([
        Product.find(filter)
            .populate({ path: "category", model: Category, select: "name" })
            .select("name slug category subProducts")
            .sort({ createdAt: -1 })
            .skip((page - 1) * PER_PAGE)
            .limit(PER_PAGE)
            .lean(),
        Product.countDocuments(filter),
        Category.find().sort({ name: 1 }).lean(),
    ]);

    const pages = Math.max(1, Math.ceil(total / PER_PAGE));
    const link = (n: number) =>
        `/admin/dashboard/product?${new URLSearchParams({ ...(q && { q }), ...(category && { category }), page: String(n) })}`;

    return (
        <>
            <PageHeader
                title="Products"
                description={`${total} product${total === 1 ? "" : "s"} in the catalogue`}
                actions={
                    <Link href="/admin/dashboard/product/create" className={btn.primary}>
                        <PlusIcon className="w-4 h-4" />
                        Create product
                    </Link>
                }
            />

            {query?.created && (
                <div role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    Published. It is now on the{" "}
                    <Link href="/" className="underline">home page</Link>, in{" "}
                    <Link href="/browse" className="underline">browse</Link> and at{" "}
                    <Link href={`/product/${query.created}`} className="underline">its own page</Link>.
                </div>
            )}

            <form className="flex flex-wrap gap-2 mb-4" role="search">
                <label htmlFor="q" className="sr-only">Search products</label>
                <input id="q" name="q" defaultValue={q} placeholder="Search by name" className={`${field} max-w-xs`} />
                <label htmlFor="category" className="sr-only">Category</label>
                <select id="category" name="category" defaultValue={category} className={`${field} max-w-[200px]`}>
                    <option value="">All categories</option>
                    {categories.map((c: any) => (
                        <option key={String(c._id)} value={String(c._id)}>{c.name}</option>
                    ))}
                </select>
                <button className={btn.secondary}>Filter</button>
            </form>

            <div className={table.wrap}>
                {products.length === 0 ? (
                    <EmptyState title="No products match">Try a different name or category.</EmptyState>
                ) : (
                    <table className={table.table}>
                        <thead className={table.head}>
                            <tr>
                                <th className={table.th}>Product</th>
                                <th className={table.th}>Category</th>
                                <th className={table.th}>Colours</th>
                                <th className={table.th}>Price</th>
                                <th className={table.th}>Stock</th>
                                <th className={table.th}>Sold</th>
                                <th className={table.th}><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((p: any) => {
                                const rows = p.subProducts.flatMap((sub: any) =>
                                    sub.sizes.map((row: any) => ({
                                        ...row,
                                        price: sub.discount ? row.price * (1 - sub.discount / 100) : row.price,
                                    }))
                                );
                                const prices = rows.map((row: any) => row.price);
                                const low = Math.min(...prices);
                                const high = Math.max(...prices);
                                const stock = rows.reduce((sum: number, row: any) => sum + (row.qty || 0), 0);
                                const sold = p.subProducts.reduce((sum: number, sub: any) => sum + (sub.sold || 0), 0);
                                const cover = p.subProducts[0]?.images?.[0]?.url;

                                return (
                                    <tr key={String(p._id)} className={table.row}>
                                        <td className={table.td}>
                                            <div className="flex items-center gap-3 min-w-[220px]">
                                                <div className="relative w-12 h-12 shrink-0 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden">
                                                    {cover && <Image src={cover} alt="" fill sizes="48px" className="object-contain" />}
                                                </div>
                                                <Link href={`/product/${p.slug}`} target="_blank" className="font-medium text-[#0F1111] hover:text-[#C7511F] hover:underline line-clamp-2">
                                                    {p.name}
                                                </Link>
                                            </div>
                                        </td>
                                        <td className={table.td}>{p.category?.name || "—"}</td>
                                        <td className={table.td}>
                                            <div className="flex -space-x-1">
                                                {p.subProducts.map((sub: any, i: number) => (
                                                    <span key={i} title={sub.color?.color} className="w-5 h-5 rounded-full border-2 border-white ring-1 ring-slate-200" style={{ backgroundColor: sub.color?.color }} />
                                                ))}
                                            </div>
                                        </td>
                                        <td className={`${table.td} whitespace-nowrap`}>
                                            {low === high ? (
                                                <Price value={low} size="sm" />
                                            ) : (
                                                <span className="inline-flex items-center gap-1">
                                                    <Price value={low} size="sm" /> – <Price value={high} size="sm" />
                                                </span>
                                            )}
                                        </td>
                                        <td className={table.td}>
                                            {stock <= 5 ? <Badge tone={stock === 0 ? "red" : "amber"}>{stock} left</Badge> : stock}
                                        </td>
                                        <td className={table.td}>{sold}</td>
                                        <td className={table.td}>
                                            <div className="flex justify-end gap-1">
                                                <Link href={`/admin/dashboard/product/${p._id}/edit`} aria-label={`Edit ${p.name}`} title="Edit" className={btn.icon}>
                                                    <PencilSquareIcon className="w-5 h-5" />
                                                </Link>
                                                <DeleteProductButton id={String(p._id)} name={p.name} />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {pages > 1 && (
                <nav aria-label="Pagination" className="flex justify-end gap-1 mt-4">
                    {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                        <Link key={n} href={link(n)} aria-current={n === page ? "page" : undefined}
                            className={`w-10 h-10 flex items-center justify-center rounded-lg border text-sm ${n === page ? "bg-amazon-blue_light text-white border-amazon-blue_light" : "bg-white border-slate-300 hover:bg-slate-50"}`}>
                            {n}
                        </Link>
                    ))}
                </nav>
            )}
        </>
    );
};

export default Page;
