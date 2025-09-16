import './App.css'
import Header from './components/Header'
import EvolutionManager from './components/EvolutionManager'
import DataManager from './components/DataManager'
import { StatManager, type Stages } from './components/StatManager'
import Footer from './components/Footer'
import AnimatedBackground from './components/AnimatedBackground'
import { useState } from "react";
import fakemonData from './assets/fakemondata.json';
import { type DataMap, DataField, Habitat, Climate, Diet, Size, Type } from './assets/utils/FakemonUtils';

function convertStageKeys(
    stagesObj: Record<string, Record<string, number[]>>
): Stages {
    const newStages: Stages = {};
    Object.entries(stagesObj).forEach(([key, value]) => {
        const stageNum: number = Number(key.replace(/^Stage/, ''));
        newStages[stageNum] = { value };
    });
    return newStages;
}

function App() {
    const [numStages, setNumStages] = useState<number>(Object.keys(fakemonData.Stats.Presets.Starter).length);
    const [stages, setStages] = useState<Stages>(convertStageKeys(fakemonData.Stats.Presets.Starter));
    const [statIncrement, setStatIncrement] = useState<number>(5);
    const initialData: DataMap = {
        [DataField.Habitat]: Habitat[Object.keys(Habitat)[0] as keyof typeof Habitat],
        [DataField.Climate]: Climate[Object.keys(Climate)[0] as keyof typeof Climate],
        [DataField.Diet]: Diet[Object.keys(Diet)[0] as keyof typeof Diet],
        [DataField.Size]: Size[Object.keys(Size)[0] as keyof typeof Size],
        [DataField.PrimaryType]: Type[Object.keys(Type)[0] as keyof typeof Type],
        [DataField.SecondaryType]: Type[Object.keys(Type)[0] as keyof typeof Type],
    };
    const [currentData, setCurrentData] = useState<DataMap>(initialData);

    function handleEvolutionManagerChange(values: { numStages: number; stages: Stages; statIncrement: number }) {
        setNumStages(values.numStages);
        setStages(values.stages);
        setStatIncrement(values.statIncrement);
    }

    function handleDataManagerChange(data: DataMap) {
        setCurrentData(data);
    }

    function handleStatManagerChange(stages: Stages) {
        setStages(stages);
    }

    return (
        <>
            <AnimatedBackground data={currentData} />
            <Header />
            <EvolutionManager numStages={numStages} stages={stages} statIncrement={statIncrement} onChange={handleEvolutionManagerChange} />
            <DataManager currentData={currentData} onChange={handleDataManagerChange} />
            <StatManager stages={stages} statIncrement={statIncrement} numStages={numStages} onChange={handleStatManagerChange} />
            <Footer />
        </>
    )
}

export default App;