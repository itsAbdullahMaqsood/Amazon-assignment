import Header from "@/components/Header/Header";
import Footer from "@/components/Footer";
import MenuSideBar from "@/components/Header/MenuSidebar";
import DepartmentStrip from "@/components/furniture/DepartmentStrip";
import TileCarousel from "@/components/furniture/TileCarousel";
import { BrandStrip, FeaturedDeals, ResultsGrid, Unstocked } from "@/components/furniture/sections";
import {
    categories,
    departments,
    filterProducts,
    furnitureSlug,
    getFurnitureStorefront,
    labelFor,
    moreCategories,
    rooms,
    styles,
    withTileImages,
    type Tile,
} from "@/lib/furniture";

export const metadata = {
    title: "Furniture",
};

const Page = async ({ searchParams }: any) => {
    const query = (await searchParams) || {};
    const storefront = await getFurnitureStorefront();

    if (!storefront || storefront.total === 0) {
        return (
            <>
                <Header title="Furniture" />

                <main className="bg-white min-h-screen">
                    <Unstocked />
                </main>

                <Footer />
                <MenuSideBar />
            </>
        );
    }

    const { categoryId, products, deals } = storefront;

    // A tile that names a room or a style filters this store; everything else
    // hands off to the catalog search, the way Amazon's tiles hand off to /s.
    // The carousels are client components, so the links are resolved here and
    // travel as plain strings rather than as a function across the boundary.
    const hrefFor = (tile: Tile) => {
        if (tile.href) {
            return tile.href;
        }

        if (tile.room) {
            return `/furniture?room=${furnitureSlug(tile.room)}`;
        }

        if (tile.style) {
            return `/furniture?style=${furnitureSlug(tile.style)}`;
        }

        return `/browse?search=${encodeURIComponent(tile.search || tile.label)}&category=${categoryId}`;
    };

    const linked = (tiles: Tile[]) => tiles.map((tile) => ({ ...tile, href: hrefFor(tile) }));

    // Each tile picks up a real catalogue photo where one matches; the composed
    // art stays as the fallback.
    const [departmentTiles, categoryTiles, roomTiles, styleTiles, moreTiles] = await Promise.all([
        withTileImages(departments),
        withTileImages(categories),
        withTileImages(rooms),
        withTileImages(styles),
        withTileImages(moreCategories),
    ]);

    const room = query.room ? labelFor(rooms, query.room) || query.room : "";
    const style = query.style ? labelFor(styles, query.style) || query.style : "";
    const filtered = room || style;

    return (
        <>
            <Header title="Furniture" />

            <main className="bg-white min-h-screen pb-16">
                <div className="max-w-[1180px] mx-auto px-4">
                    <DepartmentStrip
                        title="Explore Amazon Home"
                        tiles={linked(departmentTiles)}
                        active="Furniture"
                    />

                    {filtered ? (
                        <ResultsGrid
                            title={room || style}
                            products={filterProducts(products, query.room, query.style)}
                        />
                    ) : (
                        <>
                            <TileCarousel
                                title="Shop by category"
                                tiles={linked(categoryTiles)}
                            />

                            <TileCarousel title="Shop by room" tiles={linked(roomTiles)} />

                            <TileCarousel title="Shop by style" tiles={linked(styleTiles)} />

                            <FeaturedDeals
                                products={deals}
                                href={`/browse?category=${categoryId}`}
                            />

                            <TileCarousel
                                title="Explore more categories"
                                tiles={linked(moreTiles)}
                            />

                            <BrandStrip />
                        </>
                    )}
                </div>
            </main>

            <Footer />

            <MenuSideBar />
        </>
    );
};

export default Page;
