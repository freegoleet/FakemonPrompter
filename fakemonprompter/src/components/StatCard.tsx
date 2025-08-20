import { type ReactElement } from 'react';
import { type Stats, type StatRange } from '../components/StatManager';
import { DrawStats } from '../components/DrawStats';
import styles from '../styles/StatCard.module.css';

interface StatCardProps {
    stage: number;
    stats: Stats;
    statRange: StatRange;
    randomizeCallback: (stage: number) => void;
    setRangeCallback: (stage: number, stat: string, min: number, max: number) => void;
}

const StatCard: React.FC<StatCardProps> = ({ stage, stats, statRange, randomizeCallback, setRangeCallback }) => {
    if (stats === undefined) {
        return;
    }
    function WriteStatSpread() {
        const spread: ReactElement[] = [];

        if (stats === undefined) {
            return;
        }
        for (const key in stats.value) {
            if (stats.value[key] === undefined) {
                break;
            }
            const statValue = stats.value[key];
            spread.push(
                <div key={key} className={styles.statSpread}>
                    <div className={styles.statName}>{key}:</div>
                    <div className={styles.statValue}>{statValue}</div>
                    <div className={styles.statRange}>{WriteStatRange(key)}</div>
                </div>
            );
        }
        return spread;
    }

    function WriteStatRange(stat: string) {
        return (
            <label style={{ whiteSpace: 'nowrap' }}>
                <input
                    name="min"
                    value={statRange.value[stat][0]}
                    style={{ width: `3ch` }}
                    onChange={(e) => setRangeCallback(stage, stat, Number(e.target.value), statRange.value[stat][1])}
                />
                -
                <input
                    name="max"
                    value={statRange.value[stat][1]}
                    style={{ width: `3ch` }}
                    onChange={(e) => setRangeCallback(stage, stat, statRange.value[stat][0], Number(e.target.value))}
                />
            </label>
        )
    }


    return (
        <div
            key={`Stage${stage}`}
            className="card">
            <>
                Stage {stage}
            </>
            <>
                {WriteStatSpread()}
            </>
            <>
                <DrawStats stats={stats} />
            </>
            <button onClick={() => randomizeCallback(stage)} >
                Randomize Stats
            </button>
        </div>
    );
};


export default StatCard;