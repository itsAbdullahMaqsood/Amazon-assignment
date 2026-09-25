import Link from "next/link";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";

import { auth } from "@/auth";
import { getGrocery } from "@/lib/grocery";
import ProductCard from "@/components/product/ProductCard";
import { Container, EmptyState, PageHeader } from "@/components/ui/Layout";
import Button from "@/components/ui/Button";
import AisleChips from "@/components/grocery/AisleChips";
import RestockRow from "@/components/grocery/RestockRow";

export const metadata = { title: "Groceries" };

const Page = async ({ searchParams }: any) => {
    const [session, query] = await Promise.all([auth(), searchParams]);
    const data = await getGrocery(session?.user?.id || "", {
        aisle: String((query || {}).aisle || ""),
        deals: (query || {}).deals === "1",
    });

    if (!data || data.total === 0) {
        return (
            <main className="pb-14">
                <Container className="max-w-3xl">
                    <PageHeader title="Groceries" />
                    <EmptyState
                        icon={ShoppingCartIcon}
                        title="The shelves are empty"
                        description="The grocery catalogue is seeded separately: run npm run seed:grocery."
                        action={<Button href="/browse">Browse the rest of the store</Button>}
                    />
                </Container>
            </main>
        );
    }

    const { aisles, aisle, deals, dealCount, products, total, restock } = data;

    return (
        <main className="pb-14">
            <Container>
                <PageHeader
                    title="Groceries"
                    description="Food and household things, by the aisle. Everything is priced by the pack it comes in."
                />

                <RestockRow items={restock} />

                <AisleChips aisles={aisles} active={aisle} deals={deals} dealCount={dealCount} total={total} />

                <div className="mt-6">
                    <h2 className="font-display text-xl font-semibold tracking-tight text-fg">
                        {deals ? "On sale" : aisle ? aisle.name : "Everything in the shop"}
                    </h2>
                    <p className="mt-0.5 text-sm text-fg-muted">
                        {products.length} item{products.length === 1 ? "" : "s"}
                        {aisle && (
                            <>
                                {" "}
                                ·{" "}
                                <Link href="/groceries" className="text-link">
                                    show every aisle
                                </Link>
                            </>
                        )}
                    </p>
                </div>

                {products.length === 0 ? (
                    <EmptyState
                        className="mt-6"
                        icon={ShoppingCartIcon}
                        title="Nothing on this shelf right now"
                        description="Try another aisle."
                        action={<Button href="/groceries">Show every aisle</Button>}
                    />
                ) : (
                    <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
                        {products.map((product: any, i: number) => (
                            <li key={product._id}>
                                <ProductCard product={product} priority={i < 5} />
                                {product.unit && <p className="mt-0.5 text-xs text-fg-subtle">{product.unit}</p>}
                            </li>
                        ))}
                    </ul>
                )}
            </Container>
        </main>
    );
};

export default Page;
