import { useState } from 'react';
import DataManager from '../components/DataManager';
import StatManager, { type Stages, type StatRange } from '../components/StatManager';
import DropdownMenu from '../components/DropdownMenu';
import styles from '../styles/EvolutionManager.module.css';
import fakemonData from '../assets/fakemondata.json';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { faCircleMinus } from '@fortawesome/free-solid-svg-icons'
import { QuestionMark } from '../components/DescriptionPopup';

function EvolutionManager() {
    const [numStages, setNumStages] = useState<number>(1);
    const [stages, setStages] = useState<Stages>({});
    const [statIncrement, setStatIncrement] = useState<number>(5);

    if (stages[1] === undefined) {
        pickPreset("Starter");
    }

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
        setNumStages(preset.length);
        setStages(tempStages);
    }

    function setupPresetButtons() {
        return (
            <DropdownMenu
                options={Object.keys(fakemonData.Stats.Presets)}
                onSelect={(selectedKey: string) => pickPreset(selectedKey as keyof typeof fakemonData.Stats.Presets)}
            />
        );
    }

    return (
        <>
            <div className={styles.evolutionComponent}>
                <div className={styles.title}>
                    <h1 className="title">
                        Fakemon Prompter
                    </h1>
                    <QuestionMark title={"Introduction"} text={fakemonData.Descriptions.Introduction} />
                </div>

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
                            onClick={() => { if (numStages > 1) setNumStages(numStages - 1); }}
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
                            onClick={() => { if (numStages < 5) setNumStages(numStages + 1); }}
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
                            onClick={() => { if (statIncrement > 1) setStatIncrement(statIncrement - 1); }}
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
                            onClick={() => { if (statIncrement < 20) setStatIncrement(statIncrement + 1); }}
                            aria-label="Increase increment"
                        >
                            <FontAwesomeIcon icon={faCirclePlus} />
                        </button>
                    </div>
                </div>
            </div>

            <>
                <DataManager />
            </>

            <>
                <StatManager stages={stages} numStages={numStages} statIncrement={statIncrement} />
            </>
        </>
    );
}

export default EvolutionManager;