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

export type FakemonAttribute = Habitat | Climate | Diet | Size | Type;

export type DataMap = Record<
    DataField,
    FakemonAttribute
>;

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