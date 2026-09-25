import ResetForm from "@/components/auth/ResetForm";

export const metadata = { title: "Choose a new password" };

const Page = async ({ params }: any) => {
    const { token } = await params;

    return <ResetForm token={token} />;
};

export default Page;
