import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { getSharedList } from "@/lib/listQueries";
import { Container } from "@/components/ui/Layout";
import RegistryView from "@/components/registry/RegistryView";

export const dynamic = "force-dynamic";

export const generateMetadata = async ({ params }: any) => {
    const list = await getSharedList(String((await params).id));

    return { title: list?.name || "List or registry" };
};

const Page = async ({ params }: any) => {
    const [session, { id }] = await Promise.all([auth(), params]);
    const list = await getSharedList(String(id));

    // A private list is not served here at all, so the page cannot be used to
    // find out whether a list exists.
    if (!list) {
        notFound();
    }

    return (
        <main className="pb-14">
            <Container className="max-w-5xl">
                <RegistryView list={list} viewerId={session?.user?.id || ""} isOwner={session?.user?.id === list.ownerId} />
            </Container>
        </main>
    );
};

export default Page;
