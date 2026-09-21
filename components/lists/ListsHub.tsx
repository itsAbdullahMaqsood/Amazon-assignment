import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/User";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer";
import MenuSideBar from "@/components/Header/MenuSidebar";
import RecommendationCarousel from "@/components/profile/RecommendationCarousel";
import ListsNav from "@/components/lists/ListsNav";
import ListsClient from "@/components/lists/ListsClient";
import { GetHelp, GiftRegistries, OtherLists } from "@/components/lists/sections";
import { deliveryLabel, getRecommendations } from "@/lib/recommendations";
import { toList } from "@/lib/lists";

const ListsHub = async ({ create = false }: any) => {
    const session = await auth();

    let lists: any[] = [];

    // The hub is readable signed out — creating a list is what asks for sign in.
    if (session) {
        await connectDb();

        const user: any = await User.findById(session.user.id).select("lists").lean();

        lists = (user?.lists || []).map(toList);
    }

    const { alsoViewed } = session
        ? await getRecommendations(session.user.id)
        : { alsoViewed: [] };

    const serialize = (value: any) => JSON.parse(JSON.stringify(value));

    return (
        <>
            <Header title="Lists & Registries" />

            <main className="bg-white min-h-screen">
                <ListsNav active="Your Lists" />

                <div className="pt-4">
                    <ListsClient initialLists={serialize(lists)} startCreating={create}>
                        <GiftRegistries />

                        <OtherLists />

                        <GetHelp />
                    </ListsClient>
                </div>

                <div className="max-w-[1500px] mx-auto px-4 pb-10">
                    <RecommendationCarousel
                        title="Customers who viewed items in your browsing history also viewed"
                        products={serialize(alsoViewed)}
                        delivery={deliveryLabel()}
                    />
                </div>
            </main>

            <Footer />

            <MenuSideBar />
        </>
    );
};

export default ListsHub;
