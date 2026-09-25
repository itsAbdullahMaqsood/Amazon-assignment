import { PageHeader } from "@/components/ui/Layout";

// The account layout draws the shell now, so this only puts a heading above a
// section that has not had its own redesign yet.
const ProfileShell = ({ title, description, children }: any) => (
    <>
        <PageHeader title={title} description={description} />
        {children}
    </>
);

export default ProfileShell;
