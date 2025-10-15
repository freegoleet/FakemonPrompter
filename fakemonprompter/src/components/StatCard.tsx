import { type ReactElement } from 'react';
import { type StatMap, type StatRangeMap, type Stat } from '../assets/utils/FakemonUtils';
import { DrawStats } from '../components/DrawStats';
import styles from '../styles/StatCard.module.css';

interface StatCardProps {
    stage: number;
    stats: StatMap;
    statRange: StatRangeMap;
    randomizeCallback: (stage: number) => void;
    setRangeCallback: (stage: number, stat: Stat, min: number, max: number) => void;
}

const StatCard: React.FC<StatCardProps> = ({ stage, stats, statRange, randomizeCallback, setRangeCallback }) => {
    function WriteStatSpread() {
        const spread: ReactElement[] = [];

        for (const [key, value] of Object.entries(stats)) {
            const statKey = key as Stat;
            if (stats[statKey] === undefined) {
                break;
            }
            const statValue = value;
            spread.push(
                <div key={key} className={styles.statSpread}>
                    <div className={styles.statName}>{key}:</div>
                    <div className={styles.statValue}>{statValue}</div>
                    <div className={styles.statRange}>{WriteStatRange(statKey)}</div>
                </div>
            );
        }
        return spread;
    }

    function WriteStatRange(stat: Stat) {
        return (
            <label style={{ whiteSpace: 'nowrap' }}>
                <input
                    name="min"
                    value={statRange[stat][0]}
                    style={{ width: `3ch` }}
                    onChange={(e) => setRangeCallback(stage, stat, Number(e.target.value), statRange[stat][1])}
                />
                -
                <input
                    name="max"
                    value={statRange[stat][1]}
                    style={{ width: `3ch` }}
                    onChange={(e) => setRangeCallback(stage, stat, statRange[stat][0], Number(e.target.value))}
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