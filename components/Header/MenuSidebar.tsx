import { ChevronRightIcon, UserCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { closeMenu, selectMenu } from "@/redux/slices/MenuSlice";

const sections = [
    {
        title: "Digital Content & Devices",
        links: ["Amazon Music", "Amazon Appstore"],
    },
    {
        title: "Shop By Department",
        links: ["Electronics", "Computers", "Smart Home", "Arts & Crafts"],
    },
    {
        title: "Programs & Features",
        links: ["Gift Cards", "Shop By Interest", "Amazon Live"],
    },
];

const MenuSideBar = () => {
    const dispatch = useAppDispatch();
    const menuOpened = useAppSelector(selectMenu);

    const closeMenuHandler = () => {
        dispatch(closeMenu());
    };

    return (
        <>
            <div
                className={`fixed top-0 left-0 w-72 md:w-96 h-screen bg-white z-50 transition duration-300 ${
                    menuOpened ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="bg-amazon-blue_light text-white flex items-center px-8 py-3">
                    <UserCircleIcon className="h-8 mr-2" />
                    <span className="font-bold text-lg">Hello, sign in</span>
                </div>

                <button
                    onClick={closeMenuHandler}
                    className="absolute top-3 -right-12 text-white"
                >
                    <XMarkIcon className="h-8" />
                </button>

                <div className="menu-sidebar h-[calc(100vh-56px)] overflow-y-auto pb-20">
                    {sections.map((section) => (
                        <div key={section.title} className="border-b border-gray-200 py-2">
                            <h3>{section.title}</h3>
                            <ul>
                                {section.links.map((link) => (
                                    <li key={link}>
                                        {link}
                                        <ChevronRightIcon />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {menuOpened && (
                <div
                    onClick={closeMenuHandler}
                    className="fixed top-0 left-0 w-full h-full bg-zinc-900/85 z-40"
                />
            )}
        </>
    );
};

export default MenuSideBar;
