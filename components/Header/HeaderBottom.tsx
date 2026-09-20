import { Bars3Icon, MapPinIcon } from "@heroicons/react/24/outline";

const links = ["Deals", "Customer Service", "Registery", "Gift Cards", "Electoronics"];

const HeaderBottom = ({ handleOpenMenu }: any) => {
    return (
        <>
            <div className="bg-amazon-blue_dark md:bg-amazon-blue_light text-white flex items-center px-3 md:px-4 text-sm">
                <div
                    onClick={handleOpenMenu}
                    className="hidden md:flex items-center link p-2 shrink-0"
                >
                    <Bars3Icon className="h-6 mr-1" />
                    <span className="font-bold">All</span>
                </div>

                <ul className="flex items-center space-x-5 overflow-x-scroll scrollbar-hide whitespace-nowrap py-2 md:ml-2 w-full">
                    {links.map((link) => (
                        <li key={link} className="link">
                            {link}
                        </li>
                    ))}
                    <li className="hidden md:block ml-auto link pl-5">
                        Shop deals in Electronics
                    </li>
                </ul>
            </div>

            <div className="md:hidden bg-amazon-blue_light text-white flex items-center px-3 py-2 text-sm">
                <MapPinIcon className="h-5 mr-1" />
                <span>Deliver to Germany</span>
            </div>
        </>
    );
};

export default HeaderBottom;
