import connectDb from "@/lib/db";
import Medication from "@/models/Medication";
import { escapeRegex } from "@/utils/regex";

export const PLUS_DISCOUNT = 20;

// openFDA's purpose text usually opens by repeating the section heading
// ("Purposes Pain reliever/fever reducer"), which reads as a stutter once the
// card has already labelled it.
const purposeOf = (value: string) =>
    String(value || "")
        .replace(/^\s*purposes?\b[:.\s-]*/i, "")
        .trim();

const shape = (medication: any) => ({
    _id: String(medication._id),
    brandName: medication.brandName,
    genericName: medication.genericName || "",
    manufacturer: medication.manufacturer || "",
    route: medication.route || "",
    dosageForm: medication.dosageForm || "",
    purpose: purposeOf(medication.purpose),
    substance: medication.substance || "",
    price: medication.price || 0,
    plusPrice: medication.primePrice || 0,
});

// Brand name, generic name and active substance, because people ask for a
// medication by whichever of the three they were told.
export const searchMedications = async (term: string, limit = 24) => {
    const q = String(term || "").trim();

    if (q.length < 2) {
        return [];
    }

    await connectDb();

    const pattern = { $regex: escapeRegex(q), $options: "i" };
    const medications: any[] = await Medication.find({
        $or: [{ brandName: pattern }, { genericName: pattern }, { substance: pattern }],
    })
        .sort({ brandName: 1 })
        .limit(limit)
        .lean();

    return JSON.parse(JSON.stringify(medications.map(shape)));
};

// A few real names off the shelf, so an empty search is not a dead end.
export const commonMedications = async (limit = 8) => {
    await connectDb();

    const medications: any[] = await Medication.find({ genericName: { $nin: ["", null] } })
        .sort({ brandName: 1 })
        .limit(limit)
        .lean();

    return JSON.parse(JSON.stringify(medications.map(shape)));
};

export const medicationCount = async () => {
    await connectDb();

    return Medication.countDocuments();
};
