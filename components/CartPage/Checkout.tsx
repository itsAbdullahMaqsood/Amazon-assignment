const Checkout = ({ subtotal, shipping, total, selected, onContinue }: any) => {
    const disabled = selected.length === 0;

    return (
        <div className="bg-white rounded border border-gray-200 py-2 px-4 h-fit">
            <h2 className="text-2xl my-2 font-semibold">order Summary</h2>

            <div className="flex items-center justify-between text-sm py-1">
                <span>Subtotal</span>
                <span>{subtotal}</span>
            </div>

            <div className="flex items-center justify-between text-sm py-1">
                <span>Shipping</span>
                {shipping > 0 ? (
                    <span>+{shipping}$</span>
                ) : (
                    <span className="text-blue-500">Free Shipping</span>
                )}
            </div>

            <div className="h-px w-full bg-slate-200 my-2" />

            <div className="flex items-center justify-between font-semibold py-1">
                <span>Total</span>
                <span>USD{total}$</span>
            </div>

            <button
                onClick={onContinue}
                disabled={disabled}
                className={`w-full rounded-full p-2 my-3 transition duration-300 ${
                    disabled
                        ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                        : "font-semibold text-amazon-blue_dark bg-linear-to-r from-amazon-orange to-yellow-300 hover:text-slate-100 hover:from-amazon-blue_light hover:to-slate-300 cursor-pointer"
                }`}
            >
                Continue
            </button>
        </div>
    );
};

export default Checkout;
