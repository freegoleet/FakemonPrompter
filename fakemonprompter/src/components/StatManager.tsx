import { useState, type ReactElement } from 'react';
import fakemonData from '../assets/fakemondata.json';
import styles from '../styles/StatManager.module.css';
import { DrawStats } from './DrawStats.tsx';

export type Stats = {
    value: Record<string, number>;
}

type StatRange = {
    value: Record<string, number[]>;
}

export function StatManager(stages: number, statIncrement: number) {
    const initialStatRange: Record<number, StatRange> = {};
    const [currentStats, setCurrentStats] = useState<Record<number, Stats>>({});
    const [statRange, setStatRange] = useState<Record<number, StatRange>>(initialStatRange);

    for (const [stageKey, stageValue] of Object.entries(fakemonData.Stats)) {
        const stageNumber = parseInt(stageKey.replace('Stage', ''), 10);
        initialStatRange[stageNumber] = { value: stageValue };
    }

    function randomRange(min: number, max: number) {
        const maxRange = Math.ceil(max);
        const minRange = Math.floor(min);
        return Math.floor(Math.random() * (maxRange - minRange) + minRange);
    }

    function randomizeStat(min: number, max: number): number {
        if (statIncrement === 0) {
            throw new Error("statIncrement must not be zero.");
        }
        const maxValue = Math.ceil(max / statIncrement);
        const minValue = Math.floor(min / statIncrement);
        return randomRange(minValue, maxValue) * statIncrement;
    }

    function RandomizeAllStatsOfStage(stage: number): Stats {
        function getRandomStatKey(): string {
            const keys = Object.keys(statRange[stage].value).filter(key => key !== 'Total');
            return keys[Math.floor(Math.random() * keys.length)];
        }

        const tempStats: Stats = {
            value: Object.keys(statRange[stage].value).reduce((acc, key) => {
                acc[key] = 0;
                return acc;
            }, {} as Record<string, number>)
        };

        const minStats: Record<string, number> = Object.fromEntries(
            Object.entries(statRange[stage].value)
                .filter(([key]) => key)
                .map(([key, value]) => [key, value[0]])
        );

        if (stage - 1 > 0) {
            for (const key in minStats) {
                if (currentStats[stage - 1].value[key] > minStats[key]) {
                    minStats[key] = currentStats[stage - 1].value[key];
                }
            }
        }

        const finalSum = randomizeStat(statRange[stage].value.Total[0], statRange[stage].value.Total[1]);
        tempStats.value['Total'] = finalSum;

        let currentSum = 0;
        for (const key in statRange[stage].value) {
            if (key === 'Total') continue;
            const value = randomizeStat(minStats[key], statRange[stage].value[key][1]);
            tempStats.value[key] = value;
            currentSum += value;
        }

        const difference = finalSum - currentSum;

        for (let i = 0; i < Math.abs(difference); i += statIncrement) {
            const statToModify: string = getRandomStatKey();
            if (difference > 0) {
                if (tempStats.value[statToModify] >= statRange[stage].value[statToModify][1]) {
                    i -= statIncrement;
                    continue;
                }
                tempStats.value[statToModify] += statIncrement;
            } else {
                if (tempStats.value[statToModify] <= minStats[statToModify]) {
                    i -= statIncrement;
                    continue;
                }
                tempStats.value[statToModify] -= statIncrement;
            }
        }

        setCurrentStats(prevStats => ({
            ...prevStats,
            [stage]: {
                value: { ...tempStats.value }
            }
        }));

        if (stage < stages) {
            RandomizeAllStatsOfStage(stage + 1);
        }

        return tempStats;
    }

    function WriteAllStats() {
        const result: ReactElement[] = [];

        function WriteStatSpread(stage: number, tempStats: Stats) {
            const spread: ReactElement[] = [];

            const stats: Stats = Object.keys(tempStats).length === 0 ? currentStats[stage] : tempStats;
            for (const key in stats.value) {
                const statValue = stats.value[key];
                const statRangeValue = statRange[stage].value[key];
                spread.push(
                    <div key={key} style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                        <div style={{ flex: '2 1 0', textAlign: 'right' }}>{key}:</div>
                        <div style={{ flex: '1 1 0', textAlign: 'center' }}>{statValue}</div>
                        <div style={{ flex: '2 1 0', textAlign: 'left' }}>{writeStatRange(stage, key, statRangeValue)}</div>
                    </div>
                );
            }
            return spread;
        }

        let tempStats: Stats = { value: {} };

        for (let i = 1; i < stages + 1; i++) {
            if (currentStats[i] === undefined) {
                tempStats = RandomizeAllStatsOfStage(i);
            }
            else {
                tempStats = currentStats[i];
            }

            result.push(
                <div
                    key={`Stage${i}`}
                    className={
                        `${styles.statsStageDisplay}`}>
                    <div style={{ margin: '8px' }}>
                        <>
                            Stage {i}
                        </>
                        <>
                            {WriteStatSpread(i, tempStats)}
                        </>
                        <>
                            <DrawStats stats={ tempStats} />
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

    function modifyStatRange(stage: number, stat: string, min: number, max: number) {
        setStatRange(prevStatRange => ({
            ...prevStatRange,
            [stage]: {
                value: {
                    ...prevStatRange[stage].value,
                    [stat]: [min, max]
                }
            }
        }));

        if (statRange[stage + 1].value === undefined) {
            return;
        }
        const newValue: number[] = [statRange[stage + 1].value[stat][0], max];
        if (statRange[stage + 1].value[stat][1] < max) {
            setStatRange(prevStatRange => ({
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

    function writeStatRange(stage: number, stat: string, values: number[]) {
        return (
            <label style={{ whiteSpace: 'nowrap' }}>
                <input
                    name="min"
                    value={values[0]}
                    style={{ width: `${String(values[0]).length + 1}ch` }}
                    onChange={(e) => modifyStatRange(stage, stat, Number(e.target.value), values[1])}
                />
                -
                <input
                    name="max"
                    value={values[1]}
                    style={{ width: `${String(values[1]).length + 1}ch` }}
                    onChange={(e) => modifyStatRange(stage, stat, values[0], Number(e.target.value))}
                />
            </label>
        )
    }

    return (
        <>
            <div>
                <div style={{ display: 'flex' }}>
                    {WriteAllStats()}
                </div>
            </div>
        </>
    );
}
export default StatManager;