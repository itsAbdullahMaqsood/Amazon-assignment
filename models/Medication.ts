import mongoose from "mongoose";

// Seeded from openFDA drug labels by scripts/seed-medications.mjs.
const medicationSchema = new mongoose.Schema(
    {
        setId: { type: String, required: true, unique: true },
        brandName: { type: String, required: true },
        genericName: { type: String },
        manufacturer: { type: String },
        route: { type: String },
        dosageForm: { type: String },
        purpose: { type: String },
        substance: { type: String },
        // Cash price shown on the results page; derived, not an openFDA field.
        price: { type: Number, default: 0 },
        primePrice: { type: Number, default: 0 },
        rxPassEligible: { type: Boolean, default: false },
    },
    { timestamps: true }
);

medicationSchema.index({ brandName: "text", genericName: "text" });

const Medication = mongoose.models.Medication || mongoose.model("Medication", medicationSchema);

export default Medication;
