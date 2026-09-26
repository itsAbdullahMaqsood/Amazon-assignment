import { LockClosedIcon } from "@heroicons/react/24/outline";

import StoreShell from "@/components/layout/StoreShell";
import Button from "@/components/ui/Button";
import { Container, EmptyState } from "@/components/ui/Layout";

export const metadata = { title: "Not your page" };

// Reached when forbidden() is called: an admin route opened by an account whose
// role is not admin. A real 403, rather than a quiet redirect that leaves you
// wondering where you went.
const Forbidden = () => (
    <StoreShell>
        <main>
            <Container className="max-w-2xl py-16">
                <EmptyState
                    icon={LockClosedIcon}
                    as="h1"
                    title="That page is for administrators"
                    description="Your account is signed in, it just doesn't have the admin role. Nothing is wrong with it — this part of the store is where the catalogue is managed from."
                    action={
                        <>
                            <Button href="/">Back to shopping</Button>
                            <Button href="/profile" variant="outline">
                                Your account
                            </Button>
                        </>
                    }
                />
            </Container>
        </main>
    </StoreShell>
);

export default Forbidden;
