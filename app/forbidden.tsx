import Link from "next/link";

import StoreShell from "@/components/layout/StoreShell";
import { LockClosedIcon } from "@heroicons/react/24/outline";


export const metadata = { title: "Access denied" };

const Forbidden = () => (
    <StoreShell>

        <main className="bg-white">
            <div className="max-w-2xl mx-auto px-4 py-20 text-center">
                <LockClosedIcon className="w-12 h-12 mx-auto text-slate-400" />
                <h1 className="text-2xl font-bold mt-4">You don&apos;t have access to this page</h1>
                <p className="text-sm text-slate-600 mt-2">
                    This area is for store administrators. If you think you should have access,
                    ask an admin to change your account&apos;s role.
                </p>
                <Link
                    href="/"
                    className="inline-block mt-6 px-6 py-2 rounded-full bg-accent hover:bg-accent-strong text-sm"
                >
                    Back to shopping
                </Link>
            </div>
        </main>


    </StoreShell>
);

export default Forbidden;
