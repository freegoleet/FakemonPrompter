import { useState, useEffect, type ReactElement } from 'react';
import fakemonData from '../assets/fakemondata.json';
import styles from '../styles/DataManager.module.css';
import { typeSvgComponentMap } from '../assets/types.ts';

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

        for (const key in datamap) {
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
            const title = <div className={styles.elementText} key={key + "_title"}>{key + ": "}</div>;
            const value = <div className={styles.elementText} key={key + "_value"}>{currentData[key]}</div>;
            if (key === "Primary Type" || key === "Secondary Type") {
                const typeValue: string = currentData[key];
                const TypeSvg = typeSvgComponentMap[typeValue];
                const image = <TypeSvg className={styles.typeIcon} fill={types[typeValue]} key={key + "_image"} />;
                result.push(
                    <div className={styles.element} key={key + "_element"}>
                        {title}
                        {image}
                        {value}
                    </div>
                );
                continue;
            }
            result.push(
                <div className={styles.element} key={key + "_element"}>
                    {title}
                    {value}
                </div>
            );
        }
        return result;
    }

    return (
        <div className={styles.data}>
            <div className={styles.card}>
                <div className={styles.title}> Data </div>
                {writeAllData()}
                <button onClick={randomizeData} className={styles.button}>
                    Randomize Data
                </button>
            </div>
        </div>
    );
}

export default DataManager;