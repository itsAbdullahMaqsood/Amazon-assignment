import StoreShell from "@/components/layout/StoreShell";
import NotFoundContent from "@/components/system/NotFoundContent";

// URLs that match no route at all land here, outside the (store) group, so
// this one brings the shell itself.
const NotFound = () => (
    <StoreShell>
        <NotFoundContent />
    </StoreShell>
);

export default NotFound;
