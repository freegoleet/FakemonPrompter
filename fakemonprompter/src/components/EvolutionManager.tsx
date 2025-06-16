import React, { useState } from 'react';
import DataManager from './DataManager';
import StatManager from './StatManager';
const activeColor = '#1976d2';
const inactiveColor = '';


function EvolutionManager() {
    const [activeStage, setActiveStage] = useState<number | null>(null);
    const [stages, setStages] = useState<number>(1);

    function handleButtonClick(stage: number) {
        setActiveStage(stage);
    }

    function setNumberOfStages(stages: number) {
        setStages(stages);
    }

    function createButton(stage: number) {
        return (
            <button
                onClick={() => { handleButtonClick(stage); }}
                style={{
                    backgroundColor: activeStage === stage ? activeColor : inactiveColor,
                    color: activeStage === stage ? '#fff' : ''
                }}
            >
                Stage {stage}
            </button>
        )
    }

    function setupButtons(buttons: number) {
        const elements: React.ReactElement[] = [];
        for (let i = 1; i <= buttons; i++) {
            elements.push(createButton(i));
        }
        return elements;
    }

    function randomizeStage(stage: number) {
        // Placeholder for randomizing logic
        console.log(`Randomizing Stage ${stage}`);
    }

    return (
        <>
            <div>
                <button onClick={() => { setNumberOfStages(stages - 1); }}>
                    -
                </button>
                <label style={{ width: `1ch` }}>
                    {stages}
                </label>
                <button onClick={() => { setNumberOfStages(stages + 1); }}>
                    +
                </button>
            </div>
            <div>
                {setupButtons(stages)}
            </div>
            <div>
                <button onClick={() => {  }}>
                    Randomize Stage
                </button>
                <button onClick={() => {  }}>
                    Randomize All
                </button>
            </div>
        </>
    );
}

export default EvolutionManager;