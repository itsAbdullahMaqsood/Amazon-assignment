import { NextResponse } from "next/server";

import connectDb from "@/lib/db";
import Medication from "@/models/Medication";
import { escapeRegex } from "@/utils/regex";

export const GET = async (req: Request) => {
    try {
        const { searchParams } = new URL(req.url);
        const q = String(searchParams.get("q") || "").trim();

        if (q.length < 2) {
            return NextResponse.json({ medications: [] });
        }

        await connectDb();

        const pattern = { $regex: escapeRegex(q), $options: "i" };

        const medications = await Medication.find({
            $or: [{ brandName: pattern }, { genericName: pattern }, { substance: pattern }],
        })
            .limit(24)
            .lean();

        return NextResponse.json({ medications: JSON.parse(JSON.stringify(medications)) });
    } catch (error: any) {
        return NextResponse.json({ message: error.message, medications: [] }, { status: 500 });
    }
};
