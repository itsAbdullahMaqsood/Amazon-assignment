import { requireAdminPage } from "@/lib/guard";
import { PageHeader } from "@/components/admin/ui";
import UsersTable from "@/components/admin/users/UsersTable";
import { ROLES, listUsers } from "@/components/admin/users/queries";

export const metadata = { title: "Users" };

const one = (value: any) => (Array.isArray(value) ? value[0] : value) || "";

const UsersPage = async ({ searchParams }: any) => {
    const { user: me } = await requireAdminPage("/admin/dashboard/users");

    const params = await searchParams;
    const q = String(one(params.q)).slice(0, 100);
    const role = ROLES.includes(one(params.role)) ? one(params.role) : "";

    const { users, total, page, pages } = await listUsers({ q, role, page: one(params.page) });

    return (
        <>
            <PageHeader
                title="Users"
                description="Everyone with an account. Admins can promote a user to admin or back; nobody can change their own role."
            />
            <UsersTable
                initial={users}
                total={total}
                page={page}
                pages={pages}
                q={q}
                role={role}
                meId={String(me._id)}
            />
        </>
    );
};

export default UsersPage;
