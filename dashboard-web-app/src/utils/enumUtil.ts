export const enumValueToString = (enumValue: string): string => {
    return enumValue.split('_').map(part => part[0] + part.substring(1).toLowerCase()).join(' ');
};

export function stringToEnumValue<T extends string, TEnumValue extends string>(enumValues: { [key in T]: TEnumValue }, enumValueString: string): TEnumValue {
    return Object.values(enumValues).find(v => enumValueToString(v as string) === enumValueString) as TEnumValue;
};