const Total = ({ order }: any) => {
    // The saving is derived from the two stored totals rather than read from a
    // separate field, so it can never disagree with them.
    const saving = (order.totalBeforeDiscount - order.total).toFixed(2);

    return (
        <div className="space-y-2 mt-4 text-right">
            <div className="flex items-center justify-between font-semibold text-slate-800">
                <span>Subtotal:</span>
                <span>{order.totalBeforeDiscount}$</span>
            </div>

            {order.couponApplied && (
                <div className="flex items-center justify-between font-semibold text-slate-800">
                    <span>
                        Coupon Applied: (<i className="text-green-600">{order.couponApplied}</i>)
                    </span>
                    <span>- {saving}$</span>
                </div>
            )}

            <div className="flex items-center justify-between font-semibold text-slate-800">
                <span>Tax Price:</span>
                <span>{order.taxPrice > 0 ? `+ ${order.taxPrice}$` : "Free"}</span>
            </div>

            <div className="flex items-center justify-between font-bold text-slate-800 border-t border-slate-200 pt-2">
                <span>TOTAL TO PAY:</span>
                <span>{order.total}$</span>
            </div>
        </div>
    );
};

export default Total;
