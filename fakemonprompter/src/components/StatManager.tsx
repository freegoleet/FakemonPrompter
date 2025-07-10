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

    function randomRange(min: number, max: number) {
        const maxRange = Math.ceil(max);
        const minRange = Math.floor(min);
        return Math.floor(Math.random() * (maxRange - minRange) + minRange);
    }

    function randomizeStat (min: number, max: number): number {
        if (props.statIncrement === 0) {
            throw new Error("statIncrement must not be zero.");
        }
        const maxValue = Math.ceil(max / props.statIncrement);
        const minValue = Math.floor(min / props.statIncrement);
        return randomRange(minValue, maxValue) * props.statIncrement;
    };

    function RandomizeAllStatsOfStage(stage: number, prevStats: Stats = { value: {} }): Stats {
        function getRandomStatKey(): string {
            const keys = Object.keys(currentStatRange.value).filter(key => key !== 'Total');
            return keys[Math.floor(Math.random() * keys.length)];
        }

        let currentStatRange: StatRange = props.stages[stage];
        if (currentStatRange === undefined) {
            currentStatRange = statRanges[stage - 1];
            setStatRanges(prevStatRange => ({
                ...prevStatRange,
                [stage]: {
                    value: { ...prevStatRange[stage - 1].value }
                }
            }));
        }

        const tempStats: Stats = {
            value: Object.fromEntries(
                Object.keys(currentStatRange.value).map(key => [key, 0])
            )
        };

        const minStats: Stats = {
            value: Object.fromEntries(
                Object.entries(currentStatRange.value)
                    .map(([key, value]) => [key, value[0]])
            )
        };

        for (const key in prevStats.value) {
            minStats.value[key] = prevStats.value[key];
        }

        const finalSum = randomizeStat(currentStatRange.value.Total[0], currentStatRange.value.Total[1]);
        tempStats.value['Total'] = finalSum;

        let currentSum = 0;
        for (const key in currentStatRange.value) {
            if (key === 'Total') continue;
            const value = randomizeStat(minStats.value[key], currentStatRange.value[key][1]);
            tempStats.value[key] = value;
            currentSum += value;
        }

        const difference = finalSum - currentSum;

        for (let i = 0; i < Math.abs(difference); i += props.statIncrement) {
            const statToModify: string = getRandomStatKey();
            if (difference > 0) {
                if (tempStats.value[statToModify] >= currentStatRange.value[statToModify][1]) {
                    i -= props.statIncrement;
                    continue;
                }
                tempStats.value[statToModify] += props.statIncrement;
            } else {
                if (tempStats.value[statToModify] <= minStats.value[statToModify]) {
                    i -= props.statIncrement;
                    continue;
                }
                tempStats.value[statToModify] -= props.statIncrement;
            }
        }

        setCurrentStats(prevStats => ({
            ...prevStats,
            [stage]: {
                value: { ...tempStats.value }
            }
        }));

        if (stage < props.numStages) {
            RandomizeAllStatsOfStage(stage + 1, tempStats);
        }

        return tempStats;
    };

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
            if (currentStats[i] === undefined) {
                RandomizeAllStatsOfStage(i);
            }
        }

        return result;
    }

    function ModifyStatRange(stage: number, stat: string, min: number, max: number) {
        setStatRanges(prevStatRange => ({
            ...prevStatRange,
            [stage]: {
                value: {
                    ...prevStatRange[stage].value,
                    [stat]: [min, max]
                }
            }
        }));

        if (statRanges[stage + 1].value === undefined) {
            return;
        }
        const newValue: number[] = [statRanges[stage + 1].value[stat][0], max];
        if (statRanges[stage + 1].value[stat][1] < max) {
            setStatRanges(prevStatRange => ({
                ...prevStatRange,
                [stage + 1]: {
                    value: {
                        ...prevStatRange[stage + 1].value,
                        [stat]: newValue
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