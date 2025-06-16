import React, { useState, type ReactElement } from 'react';
import fakemonData from '../assets/fakemondata.json';

function DataManager() {
    const [datamap] = useState<Record<string, string[]>>(
        Object.keys(fakemonData.Data).reduce((acc, key) => {
            acc[key] = fakemonData.Data[key as keyof typeof fakemonData.Data];
            return acc;
        }, {} as Record<string, string[]>)
    );

    const [currentData, setCurrentData] = useState<Record<string, string[]>>({});

    function randomizeData() {
        function getRandomElement(arr: string[]): string {
            return arr[Math.floor(Math.random() * arr.length)];
        }

        const tempData: Record<string, string[]> = Object.keys(datamap).reduce((acc, key) => {
            acc[key] = [];
            return acc;
        }, {} as Record<string, string[]>);

        for (const key in datamap) {
            tempData[key].push(getRandomElement(datamap[key]));
            if (key === "Types") {
                tempData[key].push(getRandomElement(datamap[key]));
            }
        }
        setCurrentData(tempData);
    }

    function writeAllData() {
        const result: ReactElement[] = [];
        for (const key in currentData) {
            const value = currentData[key];
            const displayValue = Array.isArray(value) ? value.join(', ') : value;
            result.push(<div key={key}>{key}: {displayValue}</div>);
        }
        return result;
    }

    return (
        <>
            <div>
                <button onClick={randomizeData}>
                    Randomize All Data
                </button>
            </div>
            <div>
                Data:{writeAllData()}
            </div>
        </>
    );
}

export default DataManager;