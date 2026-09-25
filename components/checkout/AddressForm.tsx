"use client";

import { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "@/components/ui/Button";
import { Field, Input, Select, TextField } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Layout";
import { addressSchema, emptyAddress } from "@/lib/address";
import { countries } from "@/components/checkoutPage/countries";

// Adds an address to the account. The route validates with the same schema and
// makes the new address the active one.
const AddressForm = ({ onSaved, onCancel }: any) => {
    const [error, setError] = useState("");
    const { register, handleSubmit, formState } = useForm({
        resolver: zodResolver(addressSchema),
        defaultValues: emptyAddress,
    });
    const errors: any = formState.errors;

    const submit = async (values: any) => {
        setError("");

        try {
            const { data } = await axios.post("/api/user/saveaddress", { address: values });
            onSaved(data.addresses);
        } catch (err: any) {
            setError(err.response?.data?.message || "The address couldn't be saved.");
        }
    };

    return (
        <form onSubmit={handleSubmit(submit)} noValidate className="grid gap-4 sm:grid-cols-2">
            <TextField label="First name" autoComplete="given-name" error={errors.firstName?.message} {...register("firstName")} />
            <TextField label="Last name" autoComplete="family-name" error={errors.lastName?.message} {...register("lastName")} />
            <TextField
                label="Street address"
                autoComplete="address-line1"
                className="sm:col-span-2"
                error={errors.address1?.message}
                {...register("address1")}
            />
            <TextField
                label="Apartment, suite, building"
                optional
                autoComplete="address-line2"
                className="sm:col-span-2"
                error={errors.address2?.message}
                {...register("address2")}
            />
            <TextField label="City" autoComplete="address-level2" error={errors.city?.message} {...register("city")} />
            <TextField label="State or province" optional autoComplete="address-level1" error={errors.state?.message} {...register("state")} />
            <TextField label="Postcode" autoComplete="postal-code" error={errors.zipCode?.message} {...register("zipCode")} />
            <Field label="Country" error={errors.country?.message}>
                {(wiring: any) => (
                    <Select invalid={!!errors.country} autoComplete="country-name" {...wiring} {...register("country")}>
                        <option value="">Choose…</option>
                        {countries.map((country: any) => (
                            <option key={country.code} value={country.name}>
                                {country.name}
                            </option>
                        ))}
                    </Select>
                )}
            </Field>
            <Field label="Phone" hint="Only used by the courier." error={errors.phoneNumber?.message} className="sm:col-span-2">
                {(wiring: any) => <Input type="tel" autoComplete="tel" invalid={!!errors.phoneNumber} {...wiring} {...register("phoneNumber")} />}
            </Field>

            {error && (
                <Notice tone="danger" className="sm:col-span-2">
                    {error}
                </Notice>
            )}

            <div className="flex gap-2 sm:col-span-2">
                <Button type="submit" loading={formState.isSubmitting}>
                    Save and use this address
                </Button>
                {onCancel && (
                    <Button variant="ghost" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
            </div>
        </form>
    );
};

export default AddressForm;
