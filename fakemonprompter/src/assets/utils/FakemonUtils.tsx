// All strings need to match those in fakemondata.json exactly.
export enum DataField {
    Habitat = 'Habitat',
    Climate = 'Climate',
    Diet = 'Diet',
    Size = 'Size',
    PrimaryType = 'Primary Type',
    SecondaryType = 'Secondary Type'
}

export enum Habitat {
    Coast = 'Coast',
    Desert = 'Desert',
    Field = 'Field',
    Forest = 'Forest',
    Hills = 'Hills',
    Mountain = 'Mountain',
    River = 'River'
};

export enum Climate {
    Continental = 'Continental',
    Dry = 'Dry',
    Polar = 'Polar',
    Temperate = 'Temperate',
    Tropical = 'Tropical'
};

export enum Diet {
    Carnivore = 'Carnivore',
    Herbivore = 'Herbivore',
    Omnivore = 'Omnivore'
}

export enum Size {
    Tiny = 'Tiny',
    Small = 'Small',
    Medium = 'Medium',
    Large = 'Large',
    Huge = 'Huge'
}

export enum Type {
    Bug = 'Bug',
    Dark = 'Dark',
    Dragon = 'Dragon',
    Electric = 'Electric',
    Fairy = 'Fairy',
    Fighting = 'Fighting',
    Fire = 'Fire',
    Flying = 'Flying',
    Ghost = 'Ghost',
    Grass = 'Grass',
    Ground = 'Ground',
    Ice = 'Ice',
    Normal = 'Normal',
    Poison = 'Poison',
    Psychic = 'Psychic',
    Rock = 'Rock',
    Steel = 'Steel',
    Water = 'Water'
}

export enum Stat {
    Hp = 'Hp',
    Attack = 'Attack',
    Defense = 'Defense',
    SpecialAttack = 'Sp. Atk.',
    SpecialDefense = 'Sp. Def.',
    Speed = 'Speed',
    Total = 'Total'
}

export type FakemonAttribute = Habitat | Climate | Diet | Size | Type;
export type DataMap = Record<DataField, FakemonAttribute>;
export type StatMap = Record<Stat, number>;
export type StageStats = Record<number, StatMap>;
export type StageRange = Record<number, StatRangeMap>;
export type StatRangeMap = Record<Stat, number[]>;

export const defaultStatRange: StatRangeMap = {
    [Stat.Hp]: [0,0],
    [Stat.Attack]: [0, 0],
    [Stat.Defense]: [0, 0],
    [Stat.SpecialAttack]: [0, 0],
    [Stat.SpecialDefense]: [0, 0],
    [Stat.Speed]: [0, 0],
    [Stat.Total]: [0, 0]
}

export const defaultStatMap: StatMap = {
    [Stat.Hp]: 0,
    [Stat.Attack]: 0,
    [Stat.Defense]: 0,
    [Stat.SpecialAttack]: 0,
    [Stat.SpecialDefense]: 0,
    [Stat.Speed]: 0,
    [Stat.Total]: 0
};

export const defaultDataMap: DataMap = {
    [DataField.Habitat]: Habitat[Object.keys(Habitat)[0] as keyof typeof Habitat],
    [DataField.Climate]: Climate[Object.keys(Climate)[0] as keyof typeof Climate],
    [DataField.Diet]: Diet[Object.keys(Diet)[0] as keyof typeof Diet],
    [DataField.Size]: Size[Object.keys(Size)[0] as keyof typeof Size],
    [DataField.PrimaryType]: Type[Object.keys(Type)[0] as keyof typeof Type],
    [DataField.SecondaryType]: Type[Object.keys(Type)[0] as keyof typeof Type],
};

export function getDefaultStatMap(): StatMap {
    return { ...defaultStatMap };
}

export function getDefaultStatRange(): StatRangeMap {
    return { ...defaultStatRange };
}

export function getDefaultDataMap(): DataMap {
    return { ...defaultDataMap };
}

function getEnumValues<T extends object>(enumObj: T): Array<T[keyof T]> {
    return Object.values(enumObj) as Array<T[keyof T]>;
}

export const fakemonAttributes: Record<DataField, FakemonAttribute[]> = {
    [DataField.Habitat]: getEnumValues(Habitat),
    [DataField.Climate]: getEnumValues(Climate),
    [DataField.Diet]: getEnumValues(Diet),
    [DataField.Size]: getEnumValues(Size),
    [DataField.PrimaryType]: getEnumValues(Type),
    [DataField.SecondaryType]: getEnumValues(Type)
};