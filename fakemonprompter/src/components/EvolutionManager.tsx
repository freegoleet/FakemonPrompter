import { useState } from 'react';
import DataManager from '../components/DataManager.tsx';
import StatManager from '../components/StatManager.tsx';
import fakemonData from '../assets/fakemondata.json';
import type { Stages, StatRange } from '../components/StatManager.tsx';

function EvolutionManager() {
    const [numStages, setNumStages] = useState<number>(1);
    const [stages, setStages] = useState<Stages>({});
    const [statIncrement, setStatIncrement] = useState<number>(5);

    if (stages[1] === undefined) {
        PickPreset("Starter");
    }

    function PickPreset(presetName: keyof typeof fakemonData.Stats.Presets) {
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

    function SetupPresetButtons() {
        return Object.keys(fakemonData.Stats.Presets).map((key) => (
            <button
                key={key}
                onClick={() => { PickPreset(key as keyof typeof fakemonData.Stats.Presets); }}
            >
                {key}
            </button>
        ));
    }

    return (
        <>
            <div>
                Preset:
            </div>
            <div>
                {SetupPresetButtons()}
            </div>
            <div>
                <div>
                    Stages:
                </div>
                <button onClick={() => { if (numStages > 1) setNumStages(numStages - 1); }}>
                    -
                </button>
                <label style={{ width: `1ch` }}>
                    {numStages}
                </label>
                <button onClick={() => { if (numStages < 5) setNumStages(numStages + 1); }}>
                    +
                </button>
            </div>

            <div>
                <div>
                    Stat Increment:
                </div>
                <button onClick={() => { if (statIncrement > 1) setStatIncrement(statIncrement - 1); }}>
                    -
                </button>
                <label style={{ width: `1ch` }}>
                    {statIncrement}
                </label>
                <button onClick={() => { if (statIncrement < 20) setStatIncrement(statIncrement + 1); }}>
                    +
                </button>
            </div>

            <>
                {DataManager()}
            </>
            <>
                <StatManager stages={stages} numStages={numStages} statIncrement={statIncrement} />
            </>
        </>
    );
}

export default EvolutionManager;