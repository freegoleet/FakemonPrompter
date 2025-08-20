import { useState, useEffect, useCallback, useRef, type ReactElement } from 'react';
import styles from '../styles/StatManager.module.css';
import StatCard from './StatCard';

export type Stats = {
    value: Record<string, number>;
}

export type StatRange = {
    value: Record<string, number[]>;
}

export type Stages = {
    [key: number]: StatRange;
}

function getStatRange(
    stage: number,
    stats: Stats,
    stages: Stages,
    propsStages: Stages,
    reset: boolean
): StatRange {
    let range: StatRange = { value: {} };
    let skipStatRanges: boolean = false;

    if (stages[stage] !== undefined) {
        for (const key in stages[stage].value) {
            if (stats.value[key] < stages[stage].value[key][0]) {
                skipStatRanges = true;
                break;
            }
        }
        if (skipStatRanges == false) {
            range = JSON.parse(JSON.stringify(stages[stage]));
        }
    }

    if (propsStages[stage] !== undefined) {
        if (skipStatRanges == true || Object.keys(range.value).length === 0 || reset == true) {
            range = JSON.parse(JSON.stringify(propsStages[stage]));
        }
    }

    if (Object.keys(range.value).length === 0) {
        range = JSON.parse(JSON.stringify(stages[stage - 1]));
        for (const key in range.value) {
            if (key === 'Total') {
                range.value[key][0] += 50;
                range.value[key][1] += 50;
                continue;
            }
            range.value[key][1] += 20;
        }
    }

    for (const key in range.value) {
        if (stats.value[key] > range.value[key][0]) {
            range.value[key][0] = stats.value[key];
        }
    }

    return range;
}

function getValidStats(
    stats: Stats,
    range: StatRange,
    currentStats: Record<number, Stats>,
    stage: number,
    reset: boolean
): Stats {
    const sum: number = Object.entries(stats.value)
        .filter(([key]) => key !== 'Total')
        .reduce((acc, [, val]) => acc + val, 0);

    if (sum > stats.value['Total']) {
        return {
            value: Object.fromEntries(
                Object.keys(range.value).map(key => [key, 0])
            )
        };
    } else if (Object.keys(stats.value).length === 0) {
        if (currentStats[stage - 1] !== undefined && reset == false) {
            return JSON.parse(JSON.stringify(currentStats[stage - 1]));
        } else {
            return {
                value: Object.fromEntries(
                    Object.keys(range.value).map(key => [key, 0])
                )
            };
        }
    }
    return stats;
}
function randomizeStat(min: number, max: number, statIncrement: number): number {
    if (statIncrement === 0) {
        throw new Error("statIncrement must not be zero.");
    }
    // Ceiling inclusive, floor exclusive
    let minValue = Math.floor(min / statIncrement);
    if (min !== max) {
        minValue++;
    }
    let maxValue = Math.ceil(max / statIncrement);
    // Ceiling is never higher than max
    if (maxValue * statIncrement > max) {
        maxValue = Math.floor(max / statIncrement);
    }
    return randomRange(minValue, maxValue + 1) * statIncrement;
}

function randomRange(min: number, max: number) {
    const maxRange = Math.ceil(max);
    const minRange = Math.floor(min);
    return Math.floor(Math.random() * (maxRange - minRange) + minRange);
}

function getRandomStatKey(stages: Stages): string {
    const keys: string[] = Object.keys(stages[1].value).filter(key => key !== 'Total');
    if (keys.length === 0) {
        throw new Error("No valid stat keys available to randomize.");
    }
    return keys[Math.floor(Math.random() * keys.length)];
}

export function StatManager(props: { stages: Stages; numStages: number; statIncrement: number }) {
    const [currentStats, setCurrentStats] = useState<Record<number, Stats>>({});
    const [stages, setStages] = useState<Stages>(props.stages);
    const [currentStages, setCurrentStages] = useState<number>(props.numStages);
    const prevStages = useRef<Stages>(props.stages);

    const RandomizeAllStatsOfStage = useCallback((stage: number, prevStats: Stats = { value: {} }, reset: boolean = false): Stats => {
        let stats: Stats = JSON.parse(JSON.stringify(prevStats));
        let range: StatRange = {
            value: {}
        };

        // Stats Setup
        if (stats.value === undefined) {
            if (stages[stage - 1] !== undefined) {
                stats = JSON.parse(JSON.stringify(stages[stage - 1]));
            }
        }

        range = getStatRange(stage, stats, stages, props.stages, reset);

        setStages(prevStatRange => ({
            ...prevStatRange,
            [stage]: {
                value: { ...range.value }
            }
        }));

        stats = getValidStats(stats, range, currentStats, stage, reset);

        // Randomize Stats
        const goalSum = randomizeStat(range.value.Total[0], range.value.Total[1], props.statIncrement);
        stats.value['Total'] = goalSum;

        let currentSum = 0;
        for (const key in range.value) {
            if (key === 'Total') continue;
            const value = randomizeStat(range.value[key][0], range.value[key][1], props.statIncrement);
            stats.value[key] = value;
            currentSum += value;
        }

        let difference: number = goalSum - currentSum;
        while (difference !== 0) {
            const statToModify: string = getRandomStatKey(props.stages);

            if (difference > 0) {
                if (stats.value[statToModify] >= range.value[statToModify][1]) {
                    continue;
                }
                difference -= props.statIncrement;
                stats.value[statToModify] += props.statIncrement;
            } else {
                if (stats.value[statToModify] <= range.value[statToModify][0]) {
                    continue;
                }
                difference += props.statIncrement;
                stats.value[statToModify] -= props.statIncrement;
            }
        }

        setCurrentStats(prevStats => ({
            ...prevStats,
            [stage]: {
                value: { ...stats.value }
            }
        }));

        if (stage < props.numStages) {
            RandomizeAllStatsOfStage(stage + 1, stats);
        }
        return stats;
    }, [currentStats, stages, props.stages, props.numStages, props.statIncrement]);

    useEffect(() => {
        if (JSON.stringify(prevStages.current) === JSON.stringify(props.stages)) {
            return;
        }
        prevStages.current = props.stages;
        setStages(props.stages);
        setCurrentStats({});
        RandomizeAllStatsOfStage(1, undefined, true);
    }, [props.stages, RandomizeAllStatsOfStage, stages, prevStages]);

    useEffect(() => {
        RandomizeAllStatsOfStage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const addNewStages = useCallback((stagesToAdd: number) => {
        let minStats: Stats = {
            value: {}
        };

        for (let i = 1; i <= stagesToAdd; i++) {
            const newStage: number = currentStages + i;

            minStats = {
                value: Object.fromEntries(
                    Object.entries(currentStats[newStage - 1].value)
                        .map(([key, value]) => [key, value])
                )
            };

            minStats = RandomizeAllStatsOfStage(newStage, minStats);
        }
    }, [currentStages, currentStats, RandomizeAllStatsOfStage]);

    useEffect(() => {
        setCurrentStages(props.numStages);
        if (props.numStages > currentStages && props.numStages > Object.keys(props.stages).length) {
            addNewStages(props.numStages - currentStages);
            return;
        }
    }, [props.numStages, props.stages, currentStages, addNewStages]);

    function createStatCards() {
        const result: ReactElement[] = [];

        for (let i = 1; i < props.numStages + 1; i++) {
            result.push(
                <StatCard key={`Stage${i}`} stage={i} stats={currentStats[i]} statRange={stages[i]} randomizeCallback={RandomizeAllStatsOfStage} setRangeCallback={modifyStatRange} />
            );
        }

        return result;
    }

    function modifyStatRange(stage: number, stat: string, min: number, max: number) {
        setStages(prevStatRange => ({
            ...prevStatRange,
            [stage]: {
                value: {
                    ...prevStatRange[stage].value,
                    [stat]: [min, max]
                }
            }
        }));

        if (min < currentStats[stage - 1]?.value[stat]) {
            return;
        }

        if (max > stages[stage + 1]?.value[stat][1]) {
            setStages(prevStatRange => ({
                ...prevStatRange,
                [stage + 1]: {
                    value: {
                        ...prevStatRange[stage + 1].value,
                        [stat]: [currentStats[stage].value[stat], max]
                    }
                }
            }));
        }
    }

    return (
        <>
            <div className={styles.statComponent}>
                {createStatCards()}
            </div>
        </>
    );
}
export default StatManager;