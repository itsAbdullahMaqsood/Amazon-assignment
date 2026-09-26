import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

import Button from "@/components/ui/Button";
import { Container, EmptyState } from "@/components/ui/Layout";

// The 404 body, shared by the store's not-found page (inside the shell) and the
// root one (which brings its own shell).
const NotFoundContent = () => (
    <main>
        <Container className="py-16">
            <EmptyState
                icon={MagnifyingGlassIcon}
                as="h1"
                    title="We couldn't find that page"
                description="The link may be old, or the product may have left the catalogue. Search for it, or start from one of these."
                action={
                    <>
                        <Button href="/browse">Browse every department</Button>
                        <Button href="/" variant="outline">
                            Home
                        </Button>
                        <Button href="/customer-service" variant="ghost">
                            Help centre
                        </Button>
                    </>
                }
            />
        </Container>
    </main>
);

export default NotFoundContent;
