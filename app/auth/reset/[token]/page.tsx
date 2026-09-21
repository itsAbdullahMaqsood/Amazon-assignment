import ResetPage from "@/components/User/ResetPage";

export const metadata = { title: "Amazon Password Reset" };

const Page = async ({ params }: any) => {
    const { token } = await params;

    return <ResetPage token={token} />;
};

export default Page;
