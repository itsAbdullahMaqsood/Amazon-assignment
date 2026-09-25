import { Container } from "@/components/ui/Layout";
import AccountNav from "@/components/account/AccountNav";

// Every account page shares one shell, so a section is somewhere you are rather
// than an island you arrived at. The rail sits beside the page on desktop and
// folds into one button on a phone.
const ProfileLayout = ({ children }: any) => (
    <main className="pb-12 md:pb-16">
        <Container>
            <div className="lg:flex lg:gap-10">
                <div className="pt-4 lg:w-56 lg:shrink-0 lg:pt-12">
                    <AccountNav />
                </div>

                <div className="min-w-0 flex-1">{children}</div>
            </div>
        </Container>
    </main>
);

export default ProfileLayout;
