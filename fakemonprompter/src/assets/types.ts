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
