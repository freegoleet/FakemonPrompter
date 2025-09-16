import { type Stages, type StatRange } from '../components/StatManager';
import DropdownMenu from '../components/DropdownMenu';
import styles from '../styles/EvolutionManager.module.css';
import fakemonData from '../assets/fakemondata.json';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { faCircleMinus } from '@fortawesome/free-solid-svg-icons';
import { useEffect } from 'react';

type EvolutionManagerProps = {
    numStages: number,
    stages: Stages,
    statIncrement: number,
    onChange?: (values: { numStages: number; stages: Stages; statIncrement: number }) => void;
};

function EvolutionManager({ numStages, stages, statIncrement, onChange }: EvolutionManagerProps) {
    function notifyChange(newNumStages: number, newStages: Stages, newStatIncrement: number) {
        if (onChange) {
            onChange({
                numStages: newNumStages,
                stages: newStages,
                statIncrement: newStatIncrement,
            });
        }
    }

    useEffect(() => {
        if (stages[1] === undefined) {
            pickPreset("Starter");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stages]);

    function pickPreset(presetName: keyof typeof fakemonData.Stats.Presets) {
        const preset = Object.values(fakemonData.Stats.Presets[presetName]);

        if (!Array.isArray(preset)) {
            console.log(`Preset "${presetName}" is not an Array.`);
            return;
        }

        const tempStages: Stages = {};
        for (let i = 0; i < preset.length; i++) {
            const statRange: StatRange = { value: preset[i] };
            tempStages[i + 1] = statRange;
        }
        notifyChange(preset.length, tempStages, statIncrement);
    }

    function setupPresetButtons() {
        return (
            <DropdownMenu
                options={Object.keys(fakemonData.Stats.Presets)}
                onSelect={(selectedKey: string) => pickPreset(selectedKey as keyof typeof fakemonData.Stats.Presets)}
            />
        );
    }

    function handleNumStagesChange(newNumStages: number) {
        notifyChange(newNumStages, stages, statIncrement);
    }

    function handleStatIncrementChange(newStatIncrement: number) {
        notifyChange(numStages, stages, newStatIncrement);
    }

    return (
        <>
            <div className={styles.evolutionComponent}>
                <div className="card">
                    <div>
                        Preset:
                    </div>
                    <div className={styles.presets}>
                        {setupPresetButtons()}
                    </div>
                </div>

                <div className="card">
                    <div>
                        Stages:
                    </div>
                    <div className={styles.incrementSpread}>
                        <button
                            type="button"
                            className={styles.plusminus}
                            onClick={() => { if (numStages > 1) handleNumStagesChange(numStages - 1); }}
                            aria-label="Decrease stages"
                        >
                            <FontAwesomeIcon icon={faCircleMinus} />
                        </button>
                        <h2 className={styles.value}>
                            {numStages}
                        </h2>
                        <button
                            type="button"
                            className={styles.plusminus}
                            onClick={() => { if (numStages < 5) handleNumStagesChange(numStages + 1); }}
                            aria-label="Increase stages"
                        >
                            <FontAwesomeIcon icon={faCirclePlus} />
                        </button>
                    </div>
                </div>

                <div className="card">
                    <div>
                        Stat Increment:
                    </div>
                    <div className={styles.incrementSpread}>
                        <button
                            type="button"
                            className={styles.plusminus}
                            onClick={() => { if (statIncrement > 1) handleStatIncrementChange(statIncrement - 1); }}
                            aria-label="Decrease increment"
                        >
                            <FontAwesomeIcon icon={faCircleMinus} />
                        </button>
                        <h2 className={styles.value}>
                            {statIncrement}
                        </h2>
                        <button
                            type="button"
                            className={styles.plusminus}
                            onClick={() => { if (statIncrement < 20) handleStatIncrementChange(statIncrement + 1); }}
                            aria-label="Increase increment"
                        >
                            <FontAwesomeIcon icon={faCirclePlus} />
                        </button>
                    </div>
                </div>
            </div>


        </>
    );
}

export default EvolutionManager;