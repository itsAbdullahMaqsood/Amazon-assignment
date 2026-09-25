// Amazon's banner photography is not reproduced. These are composed stand-ins
// built from shapes and heroicons, in the palette the real page uses.
import {
    ArchiveBoxIcon,
    GiftIcon,
    ShoppingBagIcon,
    TagIcon,
} from "@heroicons/react/24/outline";

export const HeroArt = () => (
    <div className="relative h-[220px] md:h-[300px] bg-surface-muted overflow-hidden">
        {/* Left cluster: the stationery corner of the real banner. */}
        <div className="absolute -left-6 top-8 w-44 h-32 rotate-[-8deg] rounded-lg bg-warning-soft" />
        <div className="absolute left-10 top-20 w-40 h-28 rotate-[6deg] rounded-lg bg-white shadow-md" />
        <div className="absolute left-16 bottom-6 w-24 h-3 rounded-full bg-danger" />
        <div className="absolute left-36 top-4 w-20 h-20 rounded-full bg-success-soft" />

        {/* Right cluster: the gift and kitchenware corner. */}
        <div className="absolute right-10 top-10 w-32 h-40 rotate-[8deg] rounded-lg bg-success-soft" />
        <div className="absolute right-6 top-16 w-24 h-24 rounded-full border-8 border-danger" />
        <div className="absolute -right-8 bottom-4 w-36 h-36 rounded-full bg-danger" />
        <div className="absolute right-44 bottom-8 w-24 h-16 rounded-xl bg-danger-soft" />

        <div className="relative h-full flex items-center justify-center px-4">
            <h1 className="text-3xl md:text-5xl text-center text-fg">
                Lists &amp; Registries
            </h1>
        </div>
    </div>
);

const benefitArt: any = {
    box: (
        <div className="w-20 h-20 rounded-lg bg-warning-soft flex items-center justify-center">
            <ArchiveBoxIcon className="w-10 h-10 text-accent-deep" />
        </div>
    ),
    friends: (
        <div className="w-20 h-20 rounded-lg bg-accent-soft flex items-center justify-center">
            <ShoppingBagIcon className="w-10 h-10 text-accent-ink" />
        </div>
    ),
    deal: (
        <div className="w-20 h-20 rounded-lg bg-warning-soft flex items-center justify-center">
            <TagIcon className="w-10 h-10 text-accent-deep" />
        </div>
    ),
};

export const BenefitArt = ({ art }: any) => benefitArt[art] || benefitArt.box;

const registryArt: any = {
    wedding: (
        <div className="h-52 bg-danger-soft flex items-center justify-center">
            <div className="w-28 h-28 rounded-full border-8 border-white bg-danger-soft" />
            <div className="w-16 h-16 -ml-6 rounded-full border-8 border-white bg-accent-soft" />
        </div>
    ),
    baby: (
        <div className="h-52 bg-warning-soft flex items-end justify-center">
            <div className="w-32 h-28 rounded-t-full bg-warning-soft" />
            <div className="w-10 h-16 -ml-2 rounded-t-xl bg-warning-soft" />
        </div>
    ),
    gift: (
        <div className="h-52 bg-danger flex items-center justify-center">
            <GiftIcon className="w-20 h-20 text-white" />
        </div>
    ),
};

export const RegistryArt = ({ art }: any) => registryArt[art] || registryArt.gift;

export const AlexaTile = () => (
    <div className="w-14 h-14 rounded-lg bg-accent text-white flex flex-col items-center justify-center leading-none text-[10px] font-bold shrink-0">
        <span>Shabana</span>
        <span>Shopping</span>
        <span>List</span>
    </div>
);
