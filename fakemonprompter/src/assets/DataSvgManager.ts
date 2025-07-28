// Types
import Dragon from "../assets/types/type-dragon.svg?react";
import Steel from "../assets/types/type-steel.svg?react";
import Dark from "../assets/types/type-dark.svg?react";
import Normal from "../assets/types/type-normal.svg?react";
import Fairy from "../assets/types/type-fairy.svg?react";
import Ghost from "../assets/types/type-ghost.svg?react";
import Psychic from "../assets/types/type-psychic.svg?react";
import Flying from "../assets/types/type-flying.svg?react";
import Ice from "../assets/types/type-ice.svg?react";
import Rock from "../assets/types/type-rock.svg?react";
import Ground from "../assets/types/type-ground.svg?react";
import Poison from "../assets/types/type-poison.svg?react";
import Fighting from "../assets/types/type-fighting.svg?react";
import Bug from "../assets/types/type-bug.svg?react";
import Electric from "../assets/types/type-electric.svg?react";
import Water from "../assets/types/type-water.svg?react";
import Grass from "../assets/types/type-grass.svg?react";
import Fire from "../assets/types/type-fire.svg?react";
// Climates
import Continental from "../assets/climates/climate-continental.svg?react";
import Dry from "../assets/climates/climate-dry.svg?react";
import Polar from "../assets/climates/climate-polar.svg?react";
import Temperate from "../assets/climates/climate-temperate.svg?react";
import Tropical from "../assets/climates/climate-tropical.svg?react";
// Habitats
import Coast from "../assets/habitats/habitat-coast.svg?react";
import Desert from "../assets/habitats/habitat-desert.svg?react";
import Field from "../assets/habitats/habitat-field.svg?react";
import Forest from "../assets/habitats/habitat-forest.svg?react";
import Hills from "../assets/habitats/habitat-hills.svg?react";
import Mountain from "../assets/habitats/habitat-mountain.svg?react";
import River from "../assets/habitats/habitat-river.svg?react";
//import Urban from "../assets/habitats/habitat-urban.svg?react";
// Diets
import Carnivore from "../assets/diets/diet-carnivore.svg?react";
import Herbivore from "../assets/diets/diet-herbivore.svg?react";
import Omnivore from "../assets/diets/diet-omnivore.svg?react";
// Sizes
import Tiny from "../assets/sizes/size-xs.svg?react";
import Small from "../assets/sizes/size-s.svg?react";
import Medium from "../assets/sizes/size-m.svg?react";
import Large from "../assets/sizes/size-l.svg?react";
import Huge from "../assets/sizes/size-xl.svg?react";

export const typeSvgComponentMap: Record<string, React.FunctionComponent<React.SVGProps<SVGSVGElement>>> = {
    "Dragon": Dragon,
    "Steel": Steel,
    "Dark": Dark,
    "Normal": Normal,
    "Fairy": Fairy,
    "Ghost": Ghost,
    "Psychic": Psychic,
    "Flying": Flying,
    "Ice": Ice,
    "Rock": Rock,
    "Ground": Ground,
    "Poison": Poison,
    "Fighting": Fighting,
    "Bug": Bug,
    "Electric": Electric,
    "Water": Water,
    "Grass": Grass,
    "Fire": Fire,
};

export const climateSvgComponentMap: Record<string, React.FunctionComponent<React.SVGProps<SVGSVGElement>>> = {
    "Continental": Continental,
    "Dry": Dry,
    "Temperate": Temperate,
    "Polar": Polar,
    "Tropical": Tropical,
};

export const habitatSvgComponentMap: Record<string, React.FunctionComponent<React.SVGProps<SVGSVGElement>>> = {
    "Forest": Forest,
    "Coast": Coast,
    "Mountain": Mountain,
    "Desert": Desert,
    "Hills": Hills,
    "River": River,
    "Field": Field,
};

export const dietSvgComponentMap: Record<string, React.FunctionComponent<React.SVGProps<SVGSVGElement>>> = {
    "Carnivore": Carnivore,
    "Herbivore": Herbivore,
    "Omnivore": Omnivore,
};

export const sizeSvgComponentMap: Record<string, React.FunctionComponent<React.SVGProps<SVGSVGElement>>> = {
    "Tiny": Tiny,
    "Small": Small,
    "Medium": Medium,
    "Large": Large,
    "Huge": Huge,
};
