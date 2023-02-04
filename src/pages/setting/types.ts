export type FieldToString<T> = {
    [p in keyof NonNullable<T>]: string;
};

export const fieldToString = <T extends {}>(form: T): FieldToString<T> => {
    return Object.keys(form).reduce((res, cur) => {
        res[cur] = String((form as any)[cur]);
        return res;
    }, {} as Record<string, string>) as FieldToString<T>
};