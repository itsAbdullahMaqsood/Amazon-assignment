import { redirect } from "next/navigation";

import { auth } from "@/auth";
import AccountCards from "@/components/profile/AccountCards";
import LinkCards from "@/components/profile/LinkCards";
import RecommendationCarousel from "@/components/profile/RecommendationCarousel";
import { deliveryLabel, getRecommendations } from "@/lib/recommendations";

const Page = async () => {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin?callbackUrl=/profile");
    }

    const { alsoViewed, related } = await getRecommendations(session.user.id);

    return (
        <>

            <main className="bg-white">
                <div className="max-w-5xl mx-auto px-4 py-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-6">Your Account</h1>

                    <AccountCards />

                    <hr className="my-10 border-slate-200" />

                    <LinkCards />

                    <RecommendationCarousel
                        title="Customers who viewed items in your browsing history also viewed"
                        products={JSON.parse(JSON.stringify(alsoViewed))}
                        delivery={deliveryLabel()}
                    />

                    <RecommendationCarousel
                        title="Related to items you viewed"
                        products={JSON.parse(JSON.stringify(related))}
                        delivery={deliveryLabel()}
                    />
                </div>
            </main>


        </>
    );
};

export default Page;
