import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Video from "@/models/Video";
import { describeUserAgent, seededDevices } from "@/lib/devices";
import { today } from "@/lib/localStore";
import ProfileShell from "@/components/profile/ProfileShell";
import DevicesClient from "@/components/devices/DevicesClient";

export const metadata = {
    title: "Devices and Content Library",
};

const Page = async () => {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin?callbackUrl=/profile/devices");
    }

    // The one honest row in the device list: the browser this request came from.
    const userAgent = (await headers()).get("user-agent") || "";
    const thisDevice = { ...describeUserAgent(userAgent), registeredOn: today() };

    await connectDb();

    // The content library stands in for digital purchases, so it prefers the
    // titles the catalogue actually prices.
    const owned: any = { price: { $gt: 0 }, posterPath: { $ne: "" } };

    const priced = await Video.find(owned)
        .sort({ popularity: -1 })
        .limit(10)
        .select("title posterPath releaseDate mediaType price")
        .lean();

    const titles = priced.length
        ? priced
        : await Video.find()
              .sort({ popularity: -1 })
              .limit(10)
              .select("title posterPath releaseDate mediaType price")
              .lean();

    return (
        <ProfileShell title="Devices and Content Library">
            <DevicesClient
                devices={JSON.parse(JSON.stringify([thisDevice, ...seededDevices]))}
                titles={JSON.parse(JSON.stringify(titles))}
            />
        </ProfileShell>
    );
};

export default Page;
