import { useState, useEffect, type ReactElement } from 'react';
import fakemonData from '../assets/fakemondata.json';
import styles from '../styles/DataManager.module.css';
import { climateSvgComponentMap, dietSvgComponentMap, habitatSvgComponentMap, sizeSvgComponentMap, typeSvgComponentMap } from '../assets/DataSvgManager.ts';
import { QuestionMark } from '../components/DescriptionPopup.tsx';

const defaultColor: string = "#000000";

function DataManager() {
    const [datamap] = useState<Record<string, { Description: string; Values: Record<string, string> }>>(
        fakemonData.Data
    );
    const [types] = useState<{
        Description: Record<string, string>;
        Values: Record<string, string>;
    }>(fakemonData.Types);
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
            const values = datamap[key].Values;
            const valueKeys = Object.keys(values);
            if (valueKeys.length > 0) {
                const randomKey = valueKeys[Math.floor(Math.random() * valueKeys.length)];
                tempData[key] = randomKey;
            }
        }

        const tempColors = [defaultColor, defaultColor];
        const typeKeys = Object.keys(types.Values);
        const randomTypeKey = typeKeys[Math.floor(Math.random() * typeKeys.length)];
        const firstType: string = randomTypeKey;
        tempData["Primary Type"] = firstType;
        const secondType: string = typeKeys[Math.floor(Math.random() * typeKeys.length)];
        tempColors[0] = types.Values[firstType];
        if (secondType !== firstType) {
            tempData["Secondary Type"] = secondType;
            tempColors[1] = types.Values[secondType];
        }
        console.log("Randomized Data:", tempData);
        setColors(tempColors);
        setCurrentData(tempData);
    }

    function getDescription(key: string): string {
        let type: boolean = false;
        if (!datamap[key]) {
            type = true;
        }

        let text = datamap[key]?.Description ? datamap[key].Description : types?.Description?.[key];
        if (type === true) {
            return text;
        }

        const values = Object.keys(datamap[key].Values);
        for (let i = 0; i < values.length; i++) {
            const topic = values[i];
            text += topic;
            if (i === values.length - 1) {
                text += ".";
                continue;
            }
            text += ", ";
        }

        return text;
    }

    function writeAllData() {
        const result: ReactElement[] = [];

        if (Object.entries(currentData).length === 0) {
            randomizeData();
        }

        for (const key in currentData) {
            const dataType = <div className={styles.dataTypeText} key={key + "_dataType"}>{key}</div>;
            const questionMark = <QuestionMark title={key} text={getDescription(key)} />
            const value = <div className={styles.valueText} key={key + "_value"}>{currentData[key]}</div>;
            const icon: string = currentData[key];
            let IconSvg: React.FunctionComponent<React.SVGProps<SVGSVGElement>> = typeSvgComponentMap[icon];
            let fillColor: string | undefined = types.Values[icon];
            switch (key) {
                case "Primary Type":
                    IconSvg = typeSvgComponentMap[icon];
                    break;
                case "Secondary Type":
                    IconSvg = typeSvgComponentMap[icon];
                    break;
                case "Size":
                    IconSvg = sizeSvgComponentMap[icon];
                    fillColor = datamap["Size"].Values[currentData[key]];
                    break;
                case "Climate":
                    IconSvg = climateSvgComponentMap[icon];
                    fillColor = datamap["Climate"].Values[currentData[key]];
                    break;
                case "Habitat":
                    IconSvg = habitatSvgComponentMap[icon];
                    fillColor = datamap["Habitat"].Values[currentData[key]];
                    break;
                case "Diet":
                    IconSvg = dietSvgComponentMap[icon];
                    fillColor = datamap["Diet"].Values[currentData[key]];
                    break;
            }

            const image = <IconSvg className={styles.typeIcon} fill={fillColor} key={key + "_image"} />;
            result.push(
                <div className={styles.element} key={key + "_element"}>
                    <div className={styles.elementColumn} key={key + "_elementText"}>
                        {dataType}
                        {questionMark}
                        :&nbsp;
                    </div>
                    <div className={styles.typeIconColumn} key={key + "_iconColumn"}>
                        {image}
                        {value}
                    </div>
                </div>
            );
        }
        return result;
    }

    return (
        <div className={styles.dataComponent}>
            <div className="card">
                {writeAllData()}
                <button onClick={randomizeData} >
                    Randomize Data
                </button>
            </div>
        </div>
    );
}

export default DataManager;