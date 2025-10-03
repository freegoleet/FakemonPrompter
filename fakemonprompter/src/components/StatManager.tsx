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

type StatManagerProps = {
    stages: Stages;
    numStages: number;
    statIncrement: number;
    onChange: (stages: Stages) => void;
}

function getStatRange(
    stage: number,
    stats: Stats,
    stages: Stages
): StatRange {
    let range: StatRange = { value: {} };

    if (stages[stage] !== undefined) {
        for (const key in stages[stage].value) {
            if (key === 'Total') {
                range.value[key] = [...stages[stage].value[key]];
                continue;
            }
            if (stats.value[key] < stages[stage].value[key][0]) {
                range.value[key] = [stats.value[key], stages[stage].value[key][1]];
            }
            else if (stats.value[key] >= stages[stage].value[key][1]) {
                range.value[key] = [stages[stage].value[key][0], stats.value[key] + 50];
            }
            else {
                range.value[key] = [...stages[stage].value[key]];
            }
        }
    }

    if (Object.keys(range.value).length === 0) {
        if (Object.keys(stages[stage - 1].value).length > 0) {
            range = JSON.parse(JSON.stringify(stages[stage - 1]));
        }
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

export function StatManager({ stages, numStages, statIncrement, onChange }: StatManagerProps) {
    const [currentStats, setCurrentStats] = useState<Record<number, Stats>>({});
    const prevStages = useRef<Stages>(stages);
    const [statCardRanges, setStatCardRanges] = useState<Record<number, StatRange>>(stages);

    const RandomizeAllStatsOfStage = useCallback((stage: number, prevStats: Stats = { value: {} }, reset: boolean = false): Stats => {
        let stats: Stats = JSON.parse(JSON.stringify(prevStats));
        let range: StatRange = {
            value: {}
        };

        // Stats Setup
        if (stats.value === undefined || Object.keys(stats.value).length === 0) {
            if (currentStats[stage - 1] !== undefined && reset == false) {
                stats = JSON.parse(JSON.stringify(currentStats[stage - 1]));
            }
            else if (stages[stage - 1] !== undefined) {
                stats = JSON.parse(JSON.stringify(stages[stage - 1]));
            }
        }

        range = getStatRange(stage, stats, stages);

        onChange({
            ...stages,
            [stage]: range
        });

        setStatCardRanges(prevRanges => ({
            ...prevRanges,
            [stage]: range
        }));

        stats = getValidStats(stats, range, currentStats, stage, reset);

        // Randomize Stats
        const goalSum = randomizeStat(range.value.Total[0], range.value.Total[1], statIncrement);
        stats.value['Total'] = goalSum;

        let currentSum = 0;
        for (const key in range.value) {
            if (key === 'Total') continue;
            const value = randomizeStat(range.value[key][0], range.value[key][1], statIncrement);
            stats.value[key] = value;
            currentSum += value;
        }

        let difference: number = goalSum - currentSum;

        // Prevent endless loop by tracking attempts and possible stat keys
        let attempts = 0;
        const maxAttempts = 1000;
        while (difference !== 0 && attempts < maxAttempts) {
            const statKeys = Object.keys(range.value).filter(key => key !== 'Total');
            const modifiableKeys = statKeys.filter(key => {
                if (difference > 0) {
                    return stats.value[key] < range.value[key][1];
                } else {
                    return stats.value[key] > range.value[key][0];
                }
            });
            if (modifiableKeys.length === 0) {
                break;
            }
            const statToModify = modifiableKeys[Math.floor(Math.random() * modifiableKeys.length)];

            if (difference > 0) {
                stats.value[statToModify] += statIncrement;
                difference -= statIncrement;
            } else {
                stats.value[statToModify] -= statIncrement;
                difference += statIncrement;
            }
            attempts++;
        }

        setCurrentStats(prevStats => ({
            ...prevStats,
            [stage]: {
                value: { ...stats.value }
            }
        }));

        if (stage < numStages) {
            RandomizeAllStatsOfStage(stage + 1, stats);
        }
        return stats;
    }, [currentStats, stages, numStages, statIncrement, onChange]);

    useEffect(() => {
        const prevStagesValue = prevStages.current;
        if (JSON.stringify(prevStagesValue) === JSON.stringify(stages)) {
            return;
        }
        prevStages.current = stages;
        setCurrentStats({});
        RandomizeAllStatsOfStage(1, undefined, true);
        onChange(stages);
    }, [stages, RandomizeAllStatsOfStage, onChange]);

    useEffect(() => {
        RandomizeAllStatsOfStage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const addNewStages = useCallback((stagesToAdd: number) => {
        let minStats: Stats = {
            value: {}
        };

        for (let i = 1; i <= stagesToAdd; i++) {
            const newStage: number = numStages;

            minStats = {
                value: Object.fromEntries(
                    Object.entries(currentStats[newStage - 1].value)
                        .map(([key, value]) => [key, value])
                )
            };

            minStats = RandomizeAllStatsOfStage(newStage, minStats);
        }
    }, [numStages, currentStats, RandomizeAllStatsOfStage]);

    useEffect(() => {
        if (numStages > Object.keys(stages).length) {
            console.log(`numStages: ${numStages}. stages ${Object.keys(stages).length}`);
            addNewStages(1);
            return;
        }
    }, [numStages, stages, addNewStages]);

    function createStatCards() {
        const result: ReactElement[] = [];

        for (let i = 1; i < numStages + 1; i++) {
            result.push(
                <StatCard key={`Stage${i}`} stage={i} stats={currentStats[i]} statRange={statCardRanges[i]} randomizeCallback={RandomizeAllStatsOfStage} setRangeCallback={modifyStatRange} />
            );
        }

        return result;
    }

    function modifyStatRange(stage: number, stat: string, min: number, max: number) {
        // Replace setStages with onChange
        onChange({
            ...stages,
            [stage]: {
                value: {
                    ...stages[stage].value,
                    [stat]: [min, max]
                }
            }
        });

        if (min < currentStats[stage - 1]?.value[stat]) {
            return;
        }

        if (max > stages[stage + 1]?.value[stat][1]) {
            onChange({
                ...stages,
                [stage + 1]: {
                    value: {
                        ...stages[stage + 1].value,
                        [stat]: [currentStats[stage].value[stat], max]
                    }
                }
            });
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
