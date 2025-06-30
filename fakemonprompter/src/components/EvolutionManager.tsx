import { useState } from 'react';
import DataManager from '../components/DataManager.js';
import StatManager from '../components/StatManager.js';

function EvolutionManager() {
    const [stages, setStages] = useState<number>(1);
    const [statIncrement, setStatIncrement] = useState<number>(5);

    return (
        <>
            <div>
                <div>
                    Stages:
                </div>
                <button onClick={() => { setStages(stages - 1); }}>
                    -
                </button>
                <label style={{ width: `1ch` }}>
                    {stages}
                </label>
                <button onClick={() => { setStages(stages + 1); }}>
                    +
                </button>
            </div>

            <div>
                <div>
                    Stat Increment:
                </div>
                <button onClick={() => { setStatIncrement(statIncrement - 1); }}>
                    -
                </button>
                <label style={{ width: `1ch` }}>
                    {statIncrement}
                </label>
                <button onClick={() => { setStatIncrement(statIncrement + 1); }}>
                    +
                </button>
            </div>

            <>
                {DataManager()}
            </>
            <>
                {StatManager(stages, statIncrement)}
            </>
        </>
    );
}

export default EvolutionManager;