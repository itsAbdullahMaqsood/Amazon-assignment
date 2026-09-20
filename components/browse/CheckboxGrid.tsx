"use client";

const CheckboxGrid = ({ values, queryName, replaceQuery, filter, columns = 2 }: any) => {
    if (!values?.length) {
        return <p className="text-xs text-slate-500">Nothing to filter on here yet.</p>;
    }

    return (
        <div className={`grid ${columns === 2 ? "grid-cols-2" : "grid-cols-1"} gap-1`}>
            {values.map((value: string) => {
                const { active, result } = replaceQuery(queryName, value);

                return (
                    <label
                        key={value}
                        className="flex items-center gap-2 text-sm cursor-pointer hover:font-semibold"
                    >
                        <input
                            type="checkbox"
                            checked={active}
                            onChange={() => filter({ [queryName]: result })}
                            className="cursor-pointer"
                        />
                        <span className="truncate">{value}</span>
                    </label>
                );
            })}
        </div>
    );
};

export default CheckboxGrid;
