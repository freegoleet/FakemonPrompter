import './App.css'
import Header from './components/Header'
import EvolutionManager from './components/EvolutionManager'
import DataManager from './components/DataManager';
import { StatManager } from './components/StatManager';
import Footer from './components/Footer';
import AnimatedBackground from './components/AnimatedBackground';
import { useState } from "react";
import fakemonData from './assets/fakemon-data.json';
import {
    type DataMap, Stat, getDefaultDataMap,
    type StatMap, type StatRangeMap, type StageRange, type StageStats, getDefaultStatRange
} from './assets/utils/FakemonUtils';
import { saveToStorage, loadFromStorage } from './assets/utils/GeneralUtils';

function convertStageKeys(
    stagesObj: Record<string, Record<string, number[]>>
): StageRange {
    const newStages: StageRange = {
        1: getDefaultStatRange()
    };
    Object.entries(stagesObj).forEach(([key, value]) => {
        const stageNum: number = Number(key.replace(/^Stage/, ''));
        newStages[stageNum] = value as StatRangeMap;
    });
    return newStages;
}

function App() {
    const [numStages, setNumStages] = useState<number>(loadFromStorage('numStages', Object.keys(fakemonData.Stats.Presets.Starter).length));
    const [stages, setStages] = useState<StageRange>(loadFromStorage('stages', convertStageKeys(fakemonData.Stats.Presets.Starter)));
    const initialStats: StatMap = {
        [Stat.Hp]: 50,
        [Stat.Attack]: 50,
        [Stat.Defense]: 50,
        [Stat.SpecialAttack]: 50,
        [Stat.SpecialDefense]: 50,
        [Stat.Speed]: 50,
        [Stat.Total]: 300
    };
    const [stats, setStats] = useState<StageStats>(loadFromStorage('stats', { 1: initialStats, 2: initialStats, 3: initialStats, 4: initialStats, 5: initialStats }));
    const [statIncrement, setStatIncrement] = useState<number>(loadFromStorage('statIncrement', 5));
    const initialData: DataMap = getDefaultDataMap();
    const [currentData, setCurrentData] = useState<DataMap>(loadFromStorage('data', initialData));

    function handleEvolutionManagerChange(newNumStages: number, newStages: StageRange, statIncrement: number) {
        setNumStages(newNumStages);
        saveToStorage('numStages', newNumStages);
        setStages(newStages);
        if (newNumStages > numStages && Object.entries(stages).length < Object.entries(newStages).length) {
            addNewStage(newNumStages)
        }
        saveToStorage('stages', newStages);
        setStatIncrement(statIncrement);
        saveToStorage('statIncrement', statIncrement);
    }

    function addNewStage(newStage: number) {
        setStages(stages => ({
            ...stages,
            [newStage]: getDefaultStatRange()
        }));
        console.log(`new stage ${newStage}.`, stages);
    }

    function handleDataManagerChange(data: DataMap) {
        setCurrentData(data);
        saveToStorage('data', data);
    }

    function handleStatRangeChange(stages: StageRange) {
        setStages(stages);
        saveToStorage('stages', stages);
    }

    function handleStatChange(stats: StageStats) {
        setStats(stats);
        console.log(`modifying stats: ${JSON.stringify(stats)}`);
        saveToStorage('stats', stats);
    }

    return (
        <>
            <AnimatedBackground data={currentData} />
            <Header />
            <EvolutionManager numStages={numStages} stages={stages} statIncrement={statIncrement} onChange={handleEvolutionManagerChange} />
            <DataManager currentData={currentData} onChange={handleDataManagerChange} />
            <StatManager stats={stats} stages={stages} statIncrement={statIncrement} numStages={numStages} onStageChange={handleStatRangeChange} onStatChange={handleStatChange} />
            <Footer />
        </>
    )
}

export default App;