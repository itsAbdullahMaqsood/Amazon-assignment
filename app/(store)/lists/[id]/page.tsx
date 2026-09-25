import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { getOwnList } from "@/lib/listQueries";
import { Container } from "@/components/ui/Layout";
import ListDetail from "@/components/lists/ListDetail";

export const generateMetadata = async ({ params }: any) => {
    const session = await auth();

    if (!session) return { title: "Your lists" };

    const list = await getOwnList(session.user.id, String((await params).id));

    return { title: list?.name || "Your lists" };
};

const Page = async ({ params }: any) => {
    const session = await auth();
    const { id } = await params;

    if (!session) {
        redirect(`/auth/signin?callbackUrl=/lists/${id}`);
    }

    const list = await getOwnList(session.user.id, String(id));

    // Not yours: it may still be a list you can open through its public page.
    if (!list) {
        notFound();
    }

    return (
        <main className="pb-14">
            <Container className="max-w-5xl">
                <ListDetail list={list} />
            </Container>
        </main>
    );
};

export default Page;
