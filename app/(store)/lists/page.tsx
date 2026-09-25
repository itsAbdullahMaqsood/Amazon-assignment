import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getLists } from "@/lib/listQueries";
import { Container, PageHeader } from "@/components/ui/Layout";
import ListsView from "@/components/lists/ListsView";

export const metadata = { title: "Your lists" };

const Page = async ({ searchParams }: any) => {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin?callbackUrl=/lists");
    }

    const query = (await searchParams) || {};
    const lists = await getLists(session.user.id);

    return (
        <main className="pb-14">
            <Container className="max-w-5xl">
                <PageHeader
                    title="Your lists"
                    description="Named sets of products. Keep one to yourself, share the link, or make it public so people can find it by your name."
                />
                <ListsView lists={lists} openNew={query.new === "1"} />
            </Container>
        </main>
    );
};

export default Page;
