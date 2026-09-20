// Amazon's furniture photography is not reproduced here. Each tile is a composed
// stand-in — a wash in the room's colour with a mark on top — sized to the 216px
// square the storefront lays its carousels out on.
import {
    ArchiveBoxIcon,
    BeakerIcon,
    BoltIcon,
    BookOpenIcon,
    BriefcaseIcon,
    BuildingOffice2Icon,
    BuildingStorefrontIcon,
    CloudIcon,
    ComputerDesktopIcon,
    CubeIcon,
    FireIcon,
    GlobeAmericasIcon,
    HomeIcon,
    HomeModernIcon,
    KeyIcon,
    LightBulbIcon,
    MoonIcon,
    PaintBrushIcon,
    PuzzlePieceIcon,
    RectangleGroupIcon,
    ScissorsIcon,
    SparklesIcon,
    Square3Stack3DIcon,
    Squares2X2Icon,
    SunIcon,
    SwatchIcon,
    TableCellsIcon,
    TvIcon,
    WindowIcon,
    WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

type Art = { from: string; to: string; ink: string; Icon: any };

// The palette is Amazon Home's own: warm neutrals for furniture, cooler washes
// for the rooms that read as tiled or outdoor.
const linen: [string, string, string] = ["#efe9e1", "#f9f6f2", "#6b6154"];
const sand: [string, string, string] = ["#e9e0d2", "#f8f4ed", "#7a6a4f"];
const sage: [string, string, string] = ["#dfe7de", "#f3f7f2", "#4a6b53"];
const slate: [string, string, string] = ["#e2e7ec", "#f4f7fa", "#465a6b"];
const clay: [string, string, string] = ["#f0e0d6", "#fbf4ef", "#96634a"];
const ink: [string, string, string] = ["#dcdedf", "#f4f5f6", "#41484d"];
const blush: [string, string, string] = ["#f5e3e4", "#fdf5f5", "#9a636a"];
const ocean: [string, string, string] = ["#dceaef", "#f2f8fa", "#2f6076"];

const tile = ([from, to, inkColor]: [string, string, string], Icon: any): Art => ({
    from,
    to,
    ink: inkColor,
    Icon,
});

const art: Record<string, Art> = {
    // Department strip.
    furniture: tile(linen, HomeModernIcon),
    home: tile(sand, HomeIcon),
    decor: tile(blush, SparklesIcon),
    kitchen: tile(sage, BeakerIcon),
    bedding: tile(ocean, MoonIcon),
    storage: tile(slate, ArchiveBoxIcon),
    garden: tile(sage, SunIcon),
    tools: tile(ink, WrenchScrewdriverIcon),
    crafts: tile(clay, PaintBrushIcon),
    kids: tile(blush, PuzzlePieceIcon),

    // Shop by category.
    sofa: tile(linen, RectangleGroupIcon),
    sectional: tile(slate, Squares2X2Icon),
    armchair: tile(clay, CubeIcon),
    headboard: tile(sand, WindowIcon),
    bed: tile(ocean, MoonIcon),
    desk: tile(ink, ComputerDesktopIcon),
    accentTable: tile(linen, TableCellsIcon),
    mattress: tile(ocean, Square3Stack3DIcon),
    officeChair: tile(slate, BriefcaseIcon),
    outdoorSeating: tile(sage, SunIcon),
    barstool: tile(sand, BuildingStorefrontIcon),
    ottoman: tile(clay, CubeIcon),

    // Shop by room.
    livingRoom: tile(linen, HomeIcon),
    bedroom: tile(ocean, MoonIcon),
    bathroom: tile(slate, CloudIcon),
    kitchenDining: tile(sage, BeakerIcon),
    entryway: tile(sand, KeyIcon),
    homeOffice: tile(ink, BriefcaseIcon),
    babyKids: tile(blush, PuzzlePieceIcon),
    outdoors: tile(sage, GlobeAmericasIcon),
    smallSpaces: tile(clay, Squares2X2Icon),

    // Shop by style.
    modern: tile(ink, Squares2X2Icon),
    midCentury: tile(clay, SwatchIcon),
    farmhouse: tile(sand, HomeModernIcon),
    boho: tile(blush, SparklesIcon),
    coastal: tile(ocean, CloudIcon),
    industrial: tile(ink, BoltIcon),
    traditional: tile(linen, BuildingOffice2Icon),
    scandinavian: tile(slate, WindowIcon),
    glam: tile(blush, FireIcon),

    // Explore more categories.
    dresser: tile(sand, ArchiveBoxIcon),
    coffeeTable: tile(linen, TableCellsIcon),
    tvStand: tile(ink, TvIcon),
    nightstand: tile(ocean, LightBulbIcon),
    diningChair: tile(sage, CubeIcon),
    vanity: tile(slate, SparklesIcon),
    diningTable: tile(linen, TableCellsIcon),
    outdoorDining: tile(sage, SunIcon),
    beanBag: tile(clay, CubeIcon),
    bookcase: tile(sand, BookOpenIcon),
    shelving: tile(slate, Square3Stack3DIcon),
    hammock: tile(sage, ScissorsIcon),
};

const FurnitureArt = ({ art: key, className = "" }: any) => {
    const shape = art[key] || art.furniture;
    const Icon = shape.Icon;

    return (
        <div
            aria-hidden="true"
            className={`rounded-lg overflow-hidden relative flex items-center justify-center ${className}`}
            style={{ background: `linear-gradient(140deg, ${shape.from}, ${shape.to})` }}
        >
            <span
                className="absolute -right-8 -bottom-10 w-36 h-36 rounded-full opacity-25"
                style={{ background: shape.ink }}
            />
            <span
                className="absolute left-4 top-4 w-8 h-8 rounded-full opacity-15"
                style={{ background: shape.ink }}
            />

            <Icon className="w-16 h-16 relative stroke-[1.2]" style={{ color: shape.ink }} />
        </div>
    );
};

export default FurnitureArt;
