import { useState, useEffect, type ReactElement } from 'react';
import fakemonData from '../assets/fakemondata.json';
import styles from '../styles/DataManager.module.css';
import { climateSvgComponentMap, dietSvgComponentMap, habitatSvgComponentMap, sizeSvgComponentMap, typeSvgComponentMap } from '../assets/DataSvgManager.ts';

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

            const icon: string = currentData[key];
            let IconSvg: React.FunctionComponent<React.SVGProps<SVGSVGElement>> = typeSvgComponentMap[icon];
            let fillColor: string | undefined = types[icon];
            switch (key) {
                case "Primary Type":
                    IconSvg = typeSvgComponentMap[icon];
                    break;
                case "Secondary Type":
                    IconSvg = typeSvgComponentMap[icon];
                    break;
                case "Size":
                    IconSvg = sizeSvgComponentMap[icon];
                    fillColor = "#FFFFFF";
                    break;
                case "Climate":
                    IconSvg = climateSvgComponentMap[icon];
                    fillColor = "#FFFFFF";
                    break;
                case "Habitat":
                    IconSvg = habitatSvgComponentMap[icon];
                    fillColor = "#FFFFFF";
                    break;
                case "Diet":
                    IconSvg = dietSvgComponentMap[icon];
                    fillColor = "#FFFFFF";
                    break;
            }

            const image = <IconSvg className={styles.typeIcon} fill={fillColor} key={key + "_image"} />;
            result.push(
                <div className={styles.element} key={key + "_element"}>
                    {title}
                    {image}
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