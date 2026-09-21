import AdminShell from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/lib/guard";

export const metadata = {
    title: { template: "%s · Admin", default: "Admin" },
    robots: { index: false, follow: false },
};

// Layouts are not re-rendered on every navigation, so each admin page ALSO calls
// requireAdminPage() itself; this check just keeps the shell from ever
// rendering for someone who is not an admin.
const Layout = async ({ children }: any) => {
    const { user } = await requireAdminPage();

    return <AdminShell user={JSON.parse(JSON.stringify(user))}>{children}</AdminShell>;
};

export default Layout;
