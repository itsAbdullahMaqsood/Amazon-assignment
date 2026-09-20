// Amazon's registry photography is not reproduced here. These are composed
// stand-ins built from shapes and heroicons, in the same palette.
import {
    AcademicCapIcon,
    CakeIcon,
    GiftIcon,
    GlobeAltIcon,
    HeartIcon,
    HomeModernIcon,
    SparklesIcon,
    ArrowPathRoundedSquareIcon,
    CameraIcon,
    MapIcon,
    ShoppingBagIcon,
    BeakerIcon,
} from "@heroicons/react/24/outline";

const tiles: Record<string, { from: string; to: string; ink: string; Icon: any }> = {
    baby: { from: "#dbe7dc", to: "#f3f7f1", ink: "#4a6b53", Icon: SparklesIcon },
    wedding: { from: "#f7e3e3", to: "#fdf4f1", ink: "#a56a63", Icon: HeartIcon },
    birthday: { from: "#f7e0cd", to: "#fdf2e6", ink: "#b3652c", Icon: CakeIcon },
    holiday: { from: "#1f4034", to: "#3d6b53", ink: "#ffffff", Icon: GiftIcon },
    housewarming: { from: "#ece7df", to: "#f8f5f0", ink: "#6b6255", Icon: HomeModernIcon },
    college: { from: "#e6f296", to: "#f3f8cf", ink: "#5c6b12", Icon: AcademicCapIcon },
    graduation: { from: "#dde6f5", to: "#f1f5fc", ink: "#39527d", Icon: AcademicCapIcon },
    gift: { from: "#f3e2c0", to: "#fbf4e6", ink: "#8a6a2f", Icon: GiftIcon },
    globe: { from: "#e4f1ee", to: "#f5fbfa", ink: "#146b60", Icon: GlobeAltIcon },
    returns: { from: "#e8eef7", to: "#f6f9fd", ink: "#2f5d8c", Icon: ArrowPathRoundedSquareIcon },
    travel: { from: "#e9e3d6", to: "#f7f4ee", ink: "#6d5f45", Icon: MapIcon },
    wrapped: { from: "#dce8f5", to: "#f2f7fc", ink: "#31577e", Icon: ShoppingBagIcon },
    photos: { from: "#efe7f5", to: "#f9f5fc", ink: "#5c4472", Icon: CameraIcon },
    kitchen: { from: "#e6e8ea", to: "#f6f7f8", ink: "#4c5257", Icon: BeakerIcon },
};

// One tile shape drives every registry image on the page: a soft wash in the
// occasion's colour with its mark sitting on top.
const RegistryArt = ({ art, className = "h-44", label = "" }: any) => {
    const tile = tiles[art] || tiles.gift;
    const Icon = tile.Icon;

    return (
        <div
            aria-hidden="true"
            className={`w-full ${className} rounded overflow-hidden relative flex items-center justify-center`}
            style={{ background: `linear-gradient(135deg, ${tile.from}, ${tile.to})` }}
        >
            <span
                className="absolute -right-6 -bottom-8 w-32 h-32 rounded-full opacity-30"
                style={{ background: tile.ink }}
            />
            <span
                className="absolute left-5 top-5 w-10 h-10 rounded-full opacity-20"
                style={{ background: tile.ink }}
            />

            <Icon className="w-14 h-14 relative" style={{ color: tile.ink }} />

            {label && (
                <span
                    className="absolute bottom-3 left-4 text-xs font-semibold tracking-wide uppercase"
                    style={{ color: tile.ink }}
                >
                    {label}
                </span>
            )}
        </div>
    );
};

export default RegistryArt;
