import { useState, useEffect, useRef, type ReactElement } from 'react';
import styles from '../styles/StatManager.module.css';
import StatCard from './StatCard';
import { Stat, type StatMap, type StageRange, type StatRangeMap, type StageStats, getDefaultStatMap, getDefaultStatRange } from '../assets/utils/FakemonUtils';

type StatManagerProps = {
    stats: StageStats;
    stages: StageRange;
    numStages: number;
    statIncrement: number;
    onStageChange: (stages: StageRange) => void;
    onStatChange: (stats: StageStats) => void;
}

const newEvoTotalIncrease: number = 50;
const newEvoMaxRangeIncrease: number = 20;

function getStatRange(
    stage: number,
    stats: StatMap,
    stagesRange: StageRange
): StatRangeMap {
    let range: StatRangeMap = getDefaultStatRange();
    if (stage === 3) {
        console.log()
    }
    if (JSON.stringify(stagesRange[stage]) !== JSON.stringify(range)) {
        for (const key in stagesRange[stage]) {
            const statKey = key as Stat;
            if (statKey === Stat.Total) {
                range[statKey] = [...stagesRange[stage][statKey]];
                continue;
            }
            if (stats[statKey] < stagesRange[stage][statKey][0]) {
                range[statKey] = [stats[statKey], stagesRange[stage][statKey][1]];
            }
            else if (stats[statKey] >= stagesRange[stage][statKey][1]) {
                range[statKey] = [stagesRange[stage][statKey][0], stats[statKey] + newEvoMaxRangeIncrease];
            }
            else {
                range[statKey] = [...stagesRange[stage][statKey]];
            }
        }
    }
    else {
        range = JSON.parse(JSON.stringify(stagesRange[stage - 1]));
        for (const key in stats) {
            const statKey = key as Stat;
            if (statKey === Stat.Total) {
                range[statKey][0] = stats[statKey] + newEvoTotalIncrease;
                range[statKey][1] = stats[statKey] + newEvoTotalIncrease;
                continue;
            }
            range[statKey][0] = stats[statKey];
            range[statKey][1] = stagesRange[stage - 1][statKey][1] + newEvoMaxRangeIncrease;
        }
    }

    for (const key in range) {
        const statKey = key as Stat;
        if (stats[statKey] > range[statKey][0]) {
            range[statKey][0] = stats[statKey];
        }
    }
    return range;
}

function getValidStats(
    stats: StatMap,
    range: StatRangeMap,
    currentStats: StageStats,
    stage: number,
    reset: boolean
): StatMap {
    const sum: number = Object.entries(stats)
        .filter(([key]) => key !== Stat.Total)
        .reduce((acc, [, val]) => acc + val, 0);

    if (sum > stats[Stat.Total]) {
        const newStats: StatMap = getDefaultStatMap();

        for (const key in range) {
            const statKey = key as Stat;
            newStats[statKey] = range[statKey][0];
        }

        return newStats;
    } else if (Object.keys(stats).length === 0) {
        if (currentStats[stage - 1] !== undefined && reset == false) {
            return JSON.parse(JSON.stringify(currentStats[stage - 1]));
        } else {
            return JSON.parse(JSON.stringify(range));
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

export function StatManager({ stats, stages, numStages, statIncrement, onStageChange, onStatChange }: StatManagerProps) {
    const [currentStats, setCurrentStats] = useState<StageStats>(
        stats
    );
    const [statCardRanges, setStatCardRanges] = useState<StageRange>(
        stages
    );
    const prevNumStages = useRef<number>(numStages);

    const allStats: StageStats = { ...currentStats };

    function RandomizeAllStatsOfStage(stage: number, prevStats: StatMap = getDefaultStatMap(), reset: boolean = false): StatMap {
        let stats: StatMap = JSON.parse(JSON.stringify(prevStats));
        let range: StatRangeMap = getDefaultStatRange();
        console.log(`Randomizing stats for stage ${stage}`);

        if (JSON.stringify(prevStats) == JSON.stringify(getDefaultStatMap())) {
            if (allStats[stage - 1] !== undefined) {
                stats = JSON.parse(JSON.stringify(allStats[stage - 1]));
            }
            else {
                for (const [key, value] of Object.entries(stages[stage])) {
                    const statKey = key as Stat;
                    stats[statKey] = value[0];
                }
            }
        }

        if (stats == getDefaultStatMap()) {
            if (allStats[stage - 1] !== undefined && reset == false) {
                stats = JSON.parse(JSON.stringify(allStats[stage - 1]));
            }
            else if (stages[stage - 1] !== undefined) {
                stats = JSON.parse(JSON.stringify(stages[stage - 1]));
            }
        }

        range = getStatRange(stage, stats, stages);

        onStageChange({
            ...stages,
            [stage]: range
        });

        setStatCardRanges(prevRanges => ({
            ...prevRanges,
            [stage]: range
        }));

        stats = getValidStats(stats, range, allStats, stage, reset);

        const goalSum = randomizeStat(range.Total[0], range.Total[1], statIncrement);
        stats[Stat.Total] = goalSum;

        let currentSum = 0;
        for (const key in range) {
            const statKey = key as Stat;
            if (statKey === Stat.Total) continue;
            const value = randomizeStat(range[statKey][0], range[statKey][1], statIncrement);
            stats[statKey] = value;
            currentSum += value;
        }

        let difference: number = goalSum - currentSum;

        let attempts = 0;
        const maxAttempts = 1000;
        while (difference !== 0 && attempts < maxAttempts) {
            const statKeys = Object.keys(range).filter(key => key !== Stat.Total);
            const modifiableKeys = statKeys.filter(key => {
                const statKey = key as Stat;
                if (difference > 0) {
                    return stats[statKey] < range[statKey][1];
                } else {
                    return stats[statKey] > range[statKey][0];
                }
            });
            if (modifiableKeys.length === 0) {
                break;
            }
            const statToModify = modifiableKeys[Math.floor(Math.random() * modifiableKeys.length)] as Stat;

            if (difference > 0) {
                stats[statToModify] += statIncrement;
                difference -= statIncrement;
            } else {
                stats[statToModify] -= statIncrement;
                difference += statIncrement;
            }
            attempts++;
        }

        allStats[stage] = { ...stats };

        if (stage < numStages) {
            RandomizeAllStatsOfStage(stage + 1, stats);
        }

        return stats;
    }

    // When you want to randomize all stages, call this wrapper and send the final result
    function randomizeAllStagesAndSend(stage: number) {
        RandomizeAllStatsOfStage(stage);
        setCurrentStats({ ...allStats });
        onStatChange({ ...allStats });
    }

    useEffect(() => {
        if (Object.entries(currentStats).length !== 0) {
            return;
        }

        RandomizeAllStatsOfStage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stats]);

    function addNewStages(from: number, to: number) {
        for (let i = 1; i <= to; i++) {
            const newStage = from + i;
            RandomizeAllStatsOfStage(newStage);
        }
    };

    useEffect(() => {
        if (prevNumStages.current !== numStages) {
            const diff = numStages - prevNumStages.current;
            if (diff > 0) {
                addNewStages(numStages - diff, diff);
            }
            prevNumStages.current = numStages;
        }
    }, [numStages, addNewStages]);

    useEffect(() => {
        if (numStages > Object.keys(stages).length) {
            console.log(`numStages: ${numStages}. stages ${Object.keys(stages).length}`);
            //addNewStages();
            return;
        }
    }, [numStages, stages]);

    function createStatCards() {
        const result: ReactElement[] = [];

        for (let i = 1; i < numStages + 1; i++) {
            if (currentStats[i] === undefined) {
                console.error(`currentStats for stage ${i} is undefined.`);
                break;
            }
            if (statCardRanges[i] === undefined) {
                console.error(`statCardRanges for stage ${i} is undefined.`);
                break;
            }
            result.push(
                <StatCard
                    key={`Stage${i}`}
                    stage={i}
                    stats={currentStats[i]}
                    statRange={statCardRanges[i]}
                    randomizeCallback={randomizeAllStagesAndSend}
                    setRangeCallback={modifyStatRange}
                />
            );
        }

        return result;
    }

    function modifyStatRange(stage: number, stat: Stat, min: number, max: number) {
        onStageChange({
            ...stages,
            [stage]: {
                ...stages[stage],
                [stat]: [min, max]
            }
        });

        if (min < currentStats[stage - 1][stat]) {
            return;
        }

        if (max > stages[stage + 1][stat][1]) {
            onStageChange({
                ...stages,
                [stage + 1]: {
                    ...stages[stage + 1],
                    [stat]: [currentStats[stage][stat], max]
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
