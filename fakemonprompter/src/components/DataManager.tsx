import { useState, useEffect, type ReactElement } from 'react';
import fakemonData from '../assets/fakemondata.json';
import styles from '../styles/DataManager.module.css';

const defaultColor: string = "#000000"

function DataManager() {
    const [datamap] = useState<Record<string, string[]>>(
        fakemonData.Data
    );

    const [types] = useState<Record<string, string>>(fakemonData.Types);
    const [currentData, setCurrentData] = useState<Record<string, string>>({});
    const [colors, setColors] = useState<string[]>([defaultColor, defaultColor]);

    useEffect(() => {
        if (colors[1] === defaultColor) {
            document.body.style.background = `linear-gradient(${colors[0]}, ${colors[1]})`;
            return;
        }
        document.body.style.background = `linear-gradient(to right, ${colors[0]}, ${colors[1]})`;
    }, [colors]);

    function randomizeData() {
        const tempData: Record<string, string> = Object.keys(datamap).reduce((acc, key) => {
            acc[key] = "";
            return acc;
        }, {} as Record<string, string>);

        for(const key in datamap) {
            const values = datamap[key];
            if (values.length > 0) {
                const randomValue = values[Math.floor(Math.random() * values.length)];
                tempData[key] = randomValue;
            }
        };

        const tempColors = [defaultColor, defaultColor];
        const typeKeys = Object.keys(types);
        const randomTypeKey = typeKeys[Math.floor(Math.random() * typeKeys.length)];
        const firstType: string = randomTypeKey;
        tempData["Primary Type"] = firstType;
        const secondType: string = typeKeys[Math.floor(Math.random() * typeKeys.length)];
        tempColors[0] = types[firstType];
        if (secondType !== firstType) {
            tempData["Secondary Type"] = secondType;
            tempColors[1] = types[secondType];
        }

        setColors(tempColors);
        setCurrentData(tempData);
    }

    function writeAllData() {
        const result: ReactElement[] = [];

        if (Object.entries(currentData).length === 0) {
            randomizeData();
        }
        for (const key in currentData) {
            const value = currentData[key];
            const displayValue = Array.isArray(value) ? value.join(', ') : value;
            result.push(<div className={styles.dataElement} key={key}>{key}: {displayValue}</div>);
        }
        return result;
    }

    return (
        <div className={styles.data}>
            <div className={styles.dataCard}>
                <div className={styles.dataTitle}> Data </div>
                {writeAllData()}
                <button onClick={randomizeData} className={styles.button}>
                    Randomize Data
                </button>
            </div>
        </div>
    );
}

export default DataManager;