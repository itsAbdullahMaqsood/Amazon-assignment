import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";

// A plain form: the term lives in the URL, so a look-up can be shared, and the
// server does the matching against the label database.
const MedicationSearch = ({ term }: any) => (
    <form role="search" action="/pharmacy" className="flex max-w-xl gap-2">
        <div className="relative flex-1">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-fg-subtle" />
            <Input
                type="search"
                name="q"
                defaultValue={term}
                aria-label="Search for a medication"
                placeholder="Brand, generic name or ingredient"
                className="pl-10"
            />
        </div>
        <Button type="submit">Look it up</Button>
    </form>
);

export default MedicationSearch;
