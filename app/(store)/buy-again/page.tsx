import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getBuyAgain } from "@/lib/buyAgain";
import { Container, PageHeader } from "@/components/ui/Layout";
import BuyAgainView from "@/components/shopping/BuyAgainView";
import BuyAgainSearch from "@/components/shopping/BuyAgainSearch";

export const metadata = { title: "Buy again" };

const Page = async ({ searchParams }: any) => {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin?callbackUrl=/buy-again");
    }

    const query = (await searchParams) || {};
    const search = String(query.search || "").trim().slice(0, 60);
    const { groups, total } = await getBuyAgain(session.user.id, { search });

    return (
        <main className="pb-14">
            <Container>
                <PageHeader
                    title="Buy again"
                    description="Everything you have paid for, in the colour and size you chose, at today's price."
                    action={<BuyAgainSearch search={search} />}
                />

                {total > 0 && (
                    <p className="mb-6 text-sm text-fg-muted">
                        {total} item{total === 1 ? "" : "s"}
                        {search && <> matching “{search}”</>} across {groups.length} department
                        {groups.length === 1 ? "" : "s"}
                    </p>
                )}

                <BuyAgainView groups={groups} total={total} search={search} />
            </Container>
        </main>
    );
};

export default Page;
