import React, { useState, type ReactElement } from 'react';
import fakemonData from '../assets/fakemondata.json';

type Stats = {
    value: Record<string, number>;
}

export function StatManager() {
    const [currentStats, setCurrentStats] = useState<Record<number, Stats>>({});

    const [statRange, setStatRange] = useState<Record<string, number[]>>(
        Object.keys(fakemonData.Stats).reduce((acc, key) => {
            acc[key] = fakemonData.Stats[key as keyof typeof fakemonData.Stats];
            return acc;
        }, {} as Record<string, number[]>)
    );

    function randomRange(min: number, max: number) {
        const minimum = Math.ceil(min);
        const maximum = Math.floor(max);
        return Math.floor(Math.random() * (maximum - minimum) + minimum);
    }

    function randomizeStat(stat: string): number {
        const randomValue = randomRange(statRange[stat][0], statRange[stat][1]);
        return randomValue;
    }

    function randomizeAllFakemonStats() {
        function getRandomStatKey(): string {
            const keys = Object.keys(statRange).filter(key => key !== 'Total');
            return keys[Math.floor(Math.random() * keys.length)];
        }

        const tempStats: Record<string, number> = Object.keys(statRange).reduce((acc, key) => {
            acc[key] = 0;
            return acc;
        }, {} as Record<string, number>);

        const finalSum = randomRange(statRange.Total[0], statRange.Total[1]);
        tempStats['Total'] = finalSum;

        let currentSum = 0;
        for (const key in statRange) {
            if (key === 'Total') continue;
            const value = randomizeStat(key);
            tempStats[key] = value;
            currentSum += value;
        }

        const difference = finalSum - currentSum;

        for (let i = 0; i < Math.abs(difference); i++) {
            const statToModify: string = getRandomStatKey();
            if (difference > 0) {
                if (tempStats[statToModify] >= statRange[statToModify][1]) {
                    i--;
                    continue;
                }
                tempStats[statToModify] += 1;
            } else {
                if (tempStats[statToModify] <= statRange[statToModify][0]) {
                    i--;
                    continue;
                }
                tempStats[statToModify] -= 1;
            }
        }

        for (const key in tempStats) {
            setCurrentStats(prevStats => ({
                ...prevStats,
                [key]: tempStats[key]
            }));
        }
    }

    function writeAllStats() {
        const result: ReactElement[] = [];
        for (const key in currentStats.value) {
            const statValue = currentStats.value[key];
            const statRangeValue = statRange[key];
            result.push(
                <div key={key} style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                    <div style={{ flex: '2 1 0', textAlign: 'right' }}>{key}:</div>
                    <div style={{ flex: '1 1 0', textAlign: 'center' }}>{statValue}</div>
                    <div style={{ flex: '2 1 0', textAlign: 'left' }}>{writeStatRange(key, statRangeValue)}</div>
                </div>
            );
        }
        return result;
    }

    function modifyStatRange(stat: string, min: number, max: number) {
        setStatRange(prevStats => ({
            ...prevStats,
            [stat]: [min, max]
        }));
    }

    function writeStatRange(stat: string, values: number[]) {
        return (
            <label style={{ whiteSpace: 'nowrap' }}>
                <input
                    name="min"
                    value={values[0]}
                    style={{ width: `${String(values[0]).length + 1}ch` }}
                    onChange={(e) => modifyStatRange(stat, Number(e.target.value), values[1])}
                />
                -
                <input
                    name="max"
                    value={values[1]}
                    style={{ width: `${String(values[1]).length + 1}ch` }}
                    onChange={(e) => modifyStatRange(stat, values[0], Number(e.target.value))}
                />
            </label>
        )
    }

    return (
        <>
            <div>
                <button onClick={randomizeAllFakemonStats}>
                    Randomize All Stats
                </button>
            </div>
            <div>
                Stats: {writeAllStats()}
            </div>
        </>
    )

}
export default StatManager;