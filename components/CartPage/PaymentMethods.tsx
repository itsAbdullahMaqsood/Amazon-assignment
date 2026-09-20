import Image from "next/image";

const PaymentMethods = () => {
    return (
        <div className="bg-white rounded border border-gray-200 py-2 px-4 mt-4">
            <h2 className="text-2xl font-semibold my-2">Payment Methods</h2>

            <Image
                src="/assets/images/payment_methods.png"
                alt="payment methods"
                width={220}
                height={25}
            />

            <div className="h-px w-full bg-slate-200 my-3" />

            <div className="flex items-center gap-2">
                <Image
                    src="/assets/images/buyer_protection.png"
                    alt="buyer protection"
                    width={25}
                    height={25}
                />
                <span className="text-xs font-semibold">Buyer Protection</span>
            </div>

            <p className="text-xs mt-2">
                Get full refund if the item is not as described or if it&apos;s not delivered.
            </p>
        </div>
    );
};

export default PaymentMethods;
