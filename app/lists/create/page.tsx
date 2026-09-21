import ListsHub from "@/components/lists/ListsHub";

export const dynamic = "force-dynamic";

export const metadata = { title: "Create a List" };

// Amazon's "Create a List" is the same hub with the create panel open.
const Page = async () => <ListsHub create />;

export default Page;
