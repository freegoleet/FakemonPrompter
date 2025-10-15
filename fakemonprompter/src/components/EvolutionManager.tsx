import DropdownMenu from '../components/DropdownMenu';
import styles from '../styles/EvolutionManager.module.css';
import fakemonData from '../assets/fakemon-data.json';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { faCircleMinus } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useRef, useState } from 'react';
import { type StageRange, type StatRangeMap } from '../assets/utils/FakemonUtils';

type EvolutionManagerProps = {
    numStages: number;
    stages: StageRange;
    statIncrement: number;
    onChange?: (numStages: number, stages: StageRange, statIncrement: number) => void;
};

function EvolutionManager({ numStages, stages, statIncrement, onChange }: EvolutionManagerProps) {
    const dropDownRef = useRef<HTMLDivElement>(null);
    const [dropdownData, setDropdownData] = useState({ left: 0, top: 0, width: 0 });

    useEffect(() => {
        if (dropDownRef.current) {
            const rect = dropDownRef.current.getBoundingClientRect();
            setDropdownData({ left: rect.left, top: rect.bottom, width: rect.width * 0.5 });
        }
    }, []);

    function notifyChange(newNumStages: number, newStages: StageRange, newStatIncrement: number) {
        if (onChange) {
            onChange(
                numStages = newNumStages,
                stages = newStages,
                statIncrement = newStatIncrement,
            );
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

        const tempStages: StageRange = {};
        for (let i = 0; i < preset.length; i++) {
            const statRange: StatRangeMap = preset[i];
            tempStages[i + 1] = statRange;
        }
        notifyChange(preset.length, tempStages, statIncrement);
    }

    function setupPresetButtons() {
        return (
            <DropdownMenu
                options={Object.keys(fakemonData.Stats.Presets)}
                onSelect={(selectedKey: string) => pickPreset(selectedKey as keyof typeof fakemonData.Stats.Presets)}
                left={dropdownData.left + dropdownData.width}
                top={dropdownData.top}
                portalParent={document.body}
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
            <div className={styles.evolutionComponent} >
                <div className="card">
                    <div>
                        Preset:
                    </div>
                    <div className={styles.presets} ref={dropDownRef}>
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