import { useState, useEffect, type ReactElement } from 'react';
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
    const [statRanges, setStatRanges] = useState<Stages>(props.stages);

    useEffect(() => {
        setStatRanges(props.stages);
        setCurrentStats({});
    }, [props.stages]);

    function addNewStage(newstage: number): StatRange {
        const minStats: Stats = {
            value: Object.fromEntries(
                Object.entries(currentStats[newstage - 1].value)
                    .map(([key, value]) => [key, value])
            )
        };
        const newStatRange: StatRange = {
            value: Object.fromEntries(
                Object.entries(statRanges[newstage - 1].value)
                    .map(([key, value]) => [key, [minStats.value[key], value[1]]])
            )
        };

        setStatRanges(prevStatRange => ({
            ...prevStatRange,
            [newstage]: newStatRange
        }));

        return newStatRange;
    }

    function randomRange(min: number, max: number) {
        const maxRange = Math.ceil(max);
        const minRange = Math.floor(min);
        return Math.floor(Math.random() * (maxRange - minRange) + minRange);
    }

    function randomizeStat(min: number, max: number): number {
        if (props.statIncrement === 0) {
            throw new Error("statIncrement must not be zero.");
        }
        const maxValue = Math.ceil(max / props.statIncrement);
        const minValue = Math.floor(min / props.statIncrement);
        return randomRange(minValue, maxValue) * props.statIncrement;
    };

    function getRandomStatKey(): string {
        const keys = Object.keys(statRanges[1].value).filter(key => key !== 'Total');
        return keys[Math.floor(Math.random() * keys.length)];
    }

    function RandomizeAllStatsOfStage(stage: number, prevStats: Stats = { value: {} }, prevRange: StatRange = { value: {} }): Stats {
        let stats: Stats = JSON.parse(JSON.stringify(prevStats)); // Deep copy to avoid mutation
        let range: StatRange = JSON.parse(JSON.stringify(prevRange));

        // Range
        if (statRanges[stage] !== undefined) {
            range = statRanges[stage];
        }
        else if (props.stages[stage] !== undefined) {
            if (Object.keys(props.stages[stage].value).length !== 0) {
                range = props.stages[stage];
            }
            else if (Object.keys(range.value).length === 0) {
                
                range = JSON.parse(JSON.stringify(statRanges[stage - 1]));
                setStatRanges(prevStatRange => ({
                    ...prevStatRange,
                    [stage]: {
                        value: { ...prevStatRange[stage - 1].value }
                    }
                }));
            }
        }

        // Stats
        const sum: number = Object.values(stats.value).reduce((acc, val) => acc + val, 0);
        if (sum > stats.value['Total']) {
            stats = {
                value: Object.fromEntries(
                    Object.keys(range.value).map(key => [key, 0])
                )
            };
        }
        else if (Object.keys(stats.value).length === 0) {
            if (currentStats[stage - 1] !== undefined) {
                stats = JSON.parse(JSON.stringify( currentStats[stage - 1]));
            }
            else {
                stats = {
                    value: Object.fromEntries(
                        Object.keys(range.value).map(key => [key, 0])
                    )
                };
            }
        }
        
        // Min Stats
        const minStats: Stats = {
            value: Object.fromEntries(
                Object.entries(range.value)
                    .map(([key, value]) => [key, value[0]])
            )
        };

        for (const key in stats.value) {
            if (stats.value[key] < range.value[key][0]) {
                continue;
            }
            minStats.value[key] = stats.value[key];
            range.value[key][0] = stats.value[key];
        }
        
        // Randomize Stats
        const finalSum = randomizeStat(minStats.value['Total'], range.value.Total[1]);
        stats.value['Total'] = finalSum;

        let currentSum = 0;
        for (const key in range.value) {
            if (key === 'Total') continue;
            const value = randomizeStat(minStats.value[key], range.value[key][1]);
            stats.value[key] = value;
            currentSum += value;
        }

        const difference = finalSum - currentSum;
        for (let i = 0; i < Math.abs(difference); i += props.statIncrement) {
            const statToModify: string = getRandomStatKey();
            if (difference > 0) {
                if (stats.value[statToModify] >= range.value[statToModify][1]) {
                    i -= props.statIncrement;
                    continue;
                }
                stats.value[statToModify] += props.statIncrement;
            } else {
                if (stats.value[statToModify] <= minStats.value[statToModify]) {
                    i -= props.statIncrement;
                    continue;
                }
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
            RandomizeAllStatsOfStage(stage + 1, stats, range);
        }
        return stats;
    };

    function WriteAllStats() {
        const result: ReactElement[] = [];

        const currentStages: number = Object.entries(statRanges).length;
        if (props.numStages > currentStages) {
            const range = addNewStage(currentStages + 1);
            RandomizeAllStatsOfStage(currentStages + 1, currentStats[currentStages], range);
            return;
        }

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
                const statRangeValue = statRanges[stage] === undefined ? props.stages[stage].value[key] : statRanges[stage].value[key];
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

        if (currentStats[1] === undefined) {
            RandomizeAllStatsOfStage(1);
        }

        return result;
    }

    function ModifyStatRange(stage: number, stat: string, min: number, max: number) {
        console.log(`Modifying stat range for Stage ${stage}, Stat: ${stat}, Min: ${min}, Max: ${max}`);
        setStatRanges(prevStatRange => ({
            ...prevStatRange,
            [stage]: {
                value: {
                    ...prevStatRange[stage].value,
                    [stat]: [min, max]
                }
            }
        }));

        //if (statRanges[stage - 1] === undefined) {
        //    return;
        //}

        if (min < currentStats[stage - 1]?.value[stat]) {
            return;
        }

        if (max > statRanges[stage + 1]?.value[stat][1]) {
            setStatRanges(prevStatRange => ({
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