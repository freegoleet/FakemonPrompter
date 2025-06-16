import './App.css'
import StatManager from './components/StatManager'
import DataManager from './components/DataManager'
import EvolutionManager from './components/EvolutionManager'

function App() {
    return (
        <>
            <>
                {EvolutionManager()}
            </>
            <>
                {DataManager()}
            </>
            <>
                {StatManager()}
            </>
        </>
    )
}

export default App;