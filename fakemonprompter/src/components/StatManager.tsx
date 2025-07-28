import { useState, useEffect, useCallback, useRef, type ReactElement } from 'react';
import styles from '../styles/StatManager.module.css';
import { DrawStats } from './DrawStats.tsx';

export type Stats = {
    value: Record<string, number>;
}

export type StatRange = {
    value: Record<string, number[]>;
}

export type Stages = {
    [key: number]: StatRange;
}

export function StatManager(props: { stages: Stages; numStages: number; statIncrement: number }) {
    const [currentStats, setCurrentStats] = useState<Record<number, Stats>>({});
    const [stages, setStages] = useState<Stages>(props.stages);
    const [currentStages, setCurrentStages] = useState<number>(props.numStages);
    const prevStages = useRef<Stages>(props.stages);

    const randomRange = useCallback((min: number, max: number) => {
        const maxRange = Math.ceil(max);
        const minRange = Math.floor(min);
        return Math.floor(Math.random() * (maxRange - minRange) + minRange);
    }, []);

    const randomizeStat = useCallback((min: number, max: number): number => {
        if (props.statIncrement === 0) {
            throw new Error("statIncrement must not be zero.");
        }
        const maxValue = Math.ceil(max / props.statIncrement);
        const minValue = Math.floor(min / props.statIncrement);
        return randomRange(minValue, maxValue) * props.statIncrement;
    }, [props.statIncrement, randomRange]);

    const getRandomStatKey = useCallback((): string => {
        const keys: string[] = Object.keys(props.stages[1].value).filter(key => key !== 'Total');
        if (keys.length === 0) {
            throw new Error("No valid stat keys available to randomize.");
        }
        return keys[Math.floor(Math.random() * keys.length)];
    }, [props.stages]);

    const RandomizeAllStatsOfStage = useCallback((stage: number, prevStats: Stats = { value: {} }, reset: boolean = false): Stats => {
        let stats: Stats = JSON.parse(JSON.stringify(prevStats)); // Deep copy to avoid mutation
        let range: StatRange = {
            value: {}
        };
        // TODO: 3 Stages, add 1 new, new stage ignores stage 3's stats

        // Stats Setup
        if (stats.value === undefined) {
            if (stages[stage - 1] !== undefined) {
                stats = JSON.parse(JSON.stringify(stages[stage - 1]));
            }
        }

        // Range
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

        if (props.stages[stage] !== undefined) {
            if (skipStatRanges == true || Object.keys(range.value).length === 0 || reset == true) {
                range = JSON.parse(JSON.stringify(props.stages[stage]));
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

        setStages(prevStatRange => ({
            ...prevStatRange,
            [stage]: {
                value: { ...range.value }
            }
        }));

        // Stats
        const sum: number = Object.entries(stats.value)
            .filter(([key]) => key !== 'Total')
            .reduce((acc, [, val]) => acc + val, 0);
        if (sum > stats.value['Total']) {
            stats = {
                value: Object.fromEntries(
                    Object.keys(range.value).map(key => [key, 0])
                )
            };
        }
        else if (Object.keys(stats.value).length === 0) {
            if (currentStats[stage - 1] !== undefined) {
                stats = JSON.parse(JSON.stringify(currentStats[stage - 1]));
            }
            else {
                stats = {
                    value: Object.fromEntries(
                        Object.keys(range.value).map(key => [key, 0])
                    )
                };
            }
        }

        // Randomize Stats
        const goalSum = randomizeStat(range.value.Total[0], range.value.Total[1]);
        stats.value['Total'] = goalSum;

        let currentSum = 0;
        for (const key in range.value) {
            if (key === 'Total') continue;
            const value = randomizeStat(range.value[key][0], range.value[key][1]);
            stats.value[key] = value;
            currentSum += value;
        }

        let difference: number = goalSum - currentSum;
        while (difference !== 0) {
            const statToModify: string = getRandomStatKey();
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
    }, [currentStats, stages, props.stages, props.numStages, props.statIncrement, getRandomStatKey, randomizeStat]);

    useEffect(() => {
        if (JSON.stringify(prevStages.current) === JSON.stringify(props.stages)) {
            return;
        }
        prevStages.current = props.stages;
        setStages(props.stages);
        RandomizeAllStatsOfStage(1, undefined, true);
    }, [props.stages, RandomizeAllStatsOfStage, stages, prevStages]);

    useEffect(() => {
        RandomizeAllStatsOfStage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const addNewStage = useCallback((newstage: number): StatRange => {
        const minStats: Stats = {
            value: Object.fromEntries(
                Object.entries(currentStats[newstage - 1].value)
                    .map(([key, value]) => [key, value])
            )
        };
        const newStatRange: StatRange = {
            value: Object.fromEntries(
                Object.entries(stages[newstage - 1].value)
                    .map(([key, value]) => [key, [minStats.value[key], value[1]]])
            )
        };

        setStages(prevStatRange => ({
            ...prevStatRange,
            [newstage]: newStatRange
        }));

        setCurrentStages(newstage);
        RandomizeAllStatsOfStage(newstage, minStats);

        return newStatRange;
    }, [currentStats, stages, RandomizeAllStatsOfStage]);

    useEffect(() => {
        if (props.numStages > currentStages) {
            addNewStage(props.numStages);
        }
    }, [props.numStages, currentStages, addNewStage]);

    function WriteAllStats() {
        const result: ReactElement[] = [];

        function WriteStatSpread(stage: number) {
            const spread: ReactElement[] = [];

            if (currentStats[stage] === undefined) {
                return;
            }
            for (const key in currentStats[stage].value) {
                if (currentStats[stage].value[key] === undefined) {
                    break;
                }
                const statValue = currentStats[stage].value[key];
                if (props.stages[stage] === undefined && stages[stage] === undefined) {
                    RandomizeAllStatsOfStage(stage);
                    break;
                }
                const statRangeValue = stages[stage] === undefined ? props.stages[stage].value[key] : stages[stage].value[key];
                spread.push(
                    <div key={key} className={styles.statSpread}>
                        <div style={{ flex: '2 1 0', textAlign: 'right' }}>{key}:</div>
                        <div style={{ flex: '1 1 0', textAlign: 'center' }}>{statValue}</div>
                        <div style={{ flex: '2 1 0', textAlign: 'left' }}>{WriteStatRange(stage, key, statRangeValue)}</div>
                    </div>
                );
            }
            return spread;
        }

        for (let i = 1; i < props.numStages + 1; i++) {
            result.push(
                <div
                    key={`Stage${i}`}
                    className={styles.statCard}>
                    <div style={{ margin: '8px' }}>
                        <>
                            Stage {i}
                        </>
                        <>
                            {currentStats[i] !== undefined && WriteStatSpread(i)}
                        </>
                        <>
                            {currentStats[i] !== undefined && <DrawStats stats={currentStats[i]} />}
                        </>
                        <button onClick={() => RandomizeAllStatsOfStage(i)}>
                            Randomize Stats
                        </button>
                    </div>
                </div>
            );
        }

        return result;
    }

    function ModifyStatRange(stage: number, stat: string, min: number, max: number) {
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

    function WriteStatRange(stage: number, stat: string, values: number[]) {
        return (
            <label style={{ whiteSpace: 'nowrap' }}>
                <input
                    name="min"
                    value={values[0]}
                    style={{ width: `${String(values[0]).length + 1}ch` }}
                    onChange={(e) => ModifyStatRange(stage, stat, Number(e.target.value), values[1])}
                />
                -
                <input
                    name="max"
                    value={values[1]}
                    style={{ width: `${String(values[1]).length + 1}ch` }}
                    onChange={(e) => ModifyStatRange(stage, stat, values[0], Number(e.target.value))}
                />
            </label>
        )
    }

    return (
        <>
            <div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    {WriteAllStats()}
                </div>
            </div>
        </>
    );
}
export default StatManager;