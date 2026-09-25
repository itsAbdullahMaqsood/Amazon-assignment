"use client";

import axios from "axios";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import ShippingInput from "./ShippingInput";
import SingularSelect from "./SingularSelect";
import { countries } from "./countries";

const between = (min: number, max: number, label: string) =>
    z
        .string()
        .min(1, `${label} is required.`)
        .min(min, `${label} must be between ${min} and ${max} characters.`)
        .max(max, `${label} must be between ${min} and ${max} characters.`);

const schema = z.object({
    country: between(2, 30, "Country"),
    firstName: between(3, 20, "First Name"),
    lastName: between(3, 20, "Last Name"),
    state: between(2, 60, "State"),
    city: between(2, 60, "City"),
    zipCode: z
        .string()
        .min(1, "Zip Code/Postal is required.")
        .min(2, "Zip Code/Postal must be between 2 and 30 characters.")
        .max(30, "Zip Code/Postal must be between 2 and 30 characters."),
    phoneNumber: between(3, 20, "Phone Number"),
    address1: between(5, 100, "Address 1"),
    address2: z
        .string()
        .max(100, "Address 2 must be between 5 and 100 characters.")
        .refine((value) => !value || value.length >= 5, {
            message: "Address 2 must be between 5 and 100 characters.",
        }),
});

const emptyAddress = {
    country: "",
    firstName: "",
    lastName: "",
    state: "",
    city: "",
    zipCode: "",
    phoneNumber: "",
    address1: "",
    address2: "",
};

const AddShipping = ({ setAddresses, setVisible }: any) => {
    const methods = useForm({ resolver: zodResolver(schema), defaultValues: emptyAddress });

    const submitHandler = async (values: any) => {
        const { data } = await axios.post("/api/user/saveaddress", { address: values });

        setAddresses(data.addresses);
        methods.reset(emptyAddress);

        if (setVisible) {
            setVisible(false);
        }
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(submitHandler)} className="grid grid-cols-1 gap-6">
                <SingularSelect name="country" placeholder="*Country" data={countries} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ShippingInput name="firstName" placeholder="*First Name" />
                    <ShippingInput name="lastName" placeholder="*Last Name" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ShippingInput name="state" placeholder="*State / Province" />
                    <ShippingInput name="city" placeholder="*City" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ShippingInput name="zipCode" placeholder="*Zip Code" />
                    <ShippingInput name="phoneNumber" placeholder="*Phone Number" />
                </div>

                <ShippingInput name="address1" placeholder="*Address 1" />
                <ShippingInput name="address2" placeholder="*Address 2" />

                <button
                    type="submit"
                    className="mb-4 mx-3 py-4 rounded-xl font-bold bg-accent text-ink-900 hover:text-slate-100 hover:bg-accent-strong transition duration-300 cursor-pointer"
                >
                    Save Address
                </button>
            </form>
        </FormProvider>
    );
};

export default AddShipping;
