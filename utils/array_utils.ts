export const compareArrays = (a: any[], b: any[]) => {
    if (!a || !b || a.length !== b.length) {
        return false;
    }

    const normalize = (array: any[]) =>
        array
            .map((item) =>
                JSON.stringify(
                    Object.keys(item)
                        .sort()
                        .reduce((acc: any, key: string) => {
                            acc[key] = item[key];
                            return acc;
                        }, {})
                )
            )
            .sort();

    return JSON.stringify(normalize(a)) === JSON.stringify(normalize(b));
};

export const filterArray = (array: any[], property: string) =>
    array.filter((item: any) => item.name === property).map((item: any) => item.value);

// Spelling kept as-is: later prompts import `removeDublicates`.
export const removeDublicates = (array: any[]) => [...new Set(array)];

export const randomize = (array: any[]) => [...array].sort(() => Math.random() - 0.5);
