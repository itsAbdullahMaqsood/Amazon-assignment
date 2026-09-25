// Amazon's split price: small currency mark, large integer, small raised cents.
const Price = ({
    value,
    listPrice,
    discount,
    size = "md",
    className = "",
}: any) => {
    const amount = Number(value || 0);
    const [whole, cents] = amount.toFixed(2).split(".");

    const scale: any = {
        sm: { symbol: "text-[10px]", whole: "text-base", cents: "text-[10px]" },
        md: { symbol: "text-xs", whole: "text-xl", cents: "text-xs" },
        lg: { symbol: "text-sm", whole: "text-3xl", cents: "text-sm" },
    }[size];

    return (
        <span className={`inline-flex items-start ${className}`}>
            {discount > 0 && (
                <span className="text-danger font-medium mr-2 self-center">-{discount}%</span>
            )}

            <span className={`${scale.symbol} leading-none mt-1`}>$</span>
            <span className={`${scale.whole} font-medium leading-none`}>{whole}</span>
            <span className={`${scale.cents} leading-none mt-0.5`}>{cents}</span>

            {listPrice && Number(listPrice) > amount && (
                <span className="text-xs text-slate-500 ml-2 self-end">
                    List: <span className="line-through">${Number(listPrice).toFixed(2)}</span>
                </span>
            )}
        </span>
    );
};

export default Price;
