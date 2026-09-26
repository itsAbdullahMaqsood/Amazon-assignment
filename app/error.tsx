"use client";

import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

import Button from "@/components/ui/Button";
import { Container, EmptyState } from "@/components/ui/Layout";

// Segment-level boundary. `retry` re-renders the segment on the server, which is
// enough for the transient database failures this app can actually hit.
const Error = ({ error, retry }: any) => (
    <main>
        <Container className="max-w-2xl py-16">
            <EmptyState
                as="h1"
                icon={ExclamationTriangleIcon}
                title="Something went wrong at our end"
                description="Nothing you did caused this. Trying again often works — the usual cause is the database taking too long to answer."
                action={
                    <>
                        <Button onClick={() => retry()}>Try again</Button>
                        <Button href="/" variant="outline">
                            Back to the store
                        </Button>
                    </>
                }
            />

            {error?.digest && (
                <p className="mt-4 text-center text-xs text-fg-subtle">
                    Reference <span className="tabular">{error.digest}</span>
                </p>
            )}
        </Container>
    </main>
);

export default Error;
