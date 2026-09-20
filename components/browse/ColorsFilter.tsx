"use client";

const ColorsFilter = ({ colors, replaceQuery, filter }: any) => {
    if (!colors?.length) {
        return <p className="text-xs text-slate-500">No colours in this category.</p>;
    }

    return (
        <div className="flex flex-wrap gap-3 p-1">
            {colors.map((color: string) => {
                const { active, result } = replaceQuery("color", color);

                return (
                    <button
                        key={color}
                        onClick={() => filter({ color: result })}
                        aria-pressed={active}
                        aria-label={`Colour ${color}`}
                        title={color}
                        style={{ background: color }}
                        className={`w-6 h-6 rounded-full shadow cursor-pointer hover:outline hover:outline-2 hover:outline-offset-4 hover:outline-slate-500 ${
                            active ? "outline outline-[3px] outline-offset-[3px] outline-slate-500" : ""
                        }`}
                    />
                );
            })}
        </div>
    );
};

export default ColorsFilter;
