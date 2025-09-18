import { useState, useEffect, type ReactElement } from 'react';
import fakemonData from '../assets/fakemon-data.json';
import styles from '../styles/DataManager.module.css';
import { climateSvgComponentMap, dietSvgComponentMap, habitatSvgComponentMap, sizeSvgComponentMap, typeSvgComponentMap } from '../assets/DataSvgManager';
import { QuestionMark } from '../components/DescriptionPopup';
import { Habitat, Climate, DataField, Size, Diet, Type, fakemonAttributes, type DataMap } from '../assets/utils/FakemonUtils';

const defaultColor: string = "#000000";

type DataManagerProps = {
    currentData: DataMap;
    onChange?: (data: DataMap) => void;
};

function DataManager({ currentData, onChange }: DataManagerProps) {
    const [datamap] = useState<Record<string, { Description: string; Values: Record<string, string> }>>(
        fakemonData.Data
    );
    const [types] = useState<{ Description: Record<string, string>; Values: Record<string, string>; }>(
        fakemonData.Types
    );
    const [colors, setColors] = useState<string[]>([defaultColor, defaultColor]);

    useEffect(() => {
        if (colors[1] === defaultColor) {
            document.body.style.background = `linear-gradient(${colors[0]}, ${colors[1]})`;
            return;
        }
        document.body.style.background = `linear-gradient(to right, ${colors[0]}, ${colors[1]})`;
    }, [colors]);

    useEffect(() => {
        randomizeData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function randomizeData() {
        const tempData: DataMap = Object.keys(datamap).reduce((acc, key) => {
            switch (key) {
                case DataField.Size:
                    acc[key] = Size.Medium;
                    break;
                case DataField.Diet:
                    acc[key] = Diet.Omnivore;
                    break;
                case DataField.Climate:
                    acc[key] = Climate.Temperate;
                    break;
                case DataField.Habitat:
                    acc[key] = Habitat.Hills;
                    break;
                case DataField.PrimaryType:
                    acc[key] = Type.Normal;
                    break;
                case DataField.SecondaryType:
                    acc[key] = Type.Normal;
                    break;
            }
            return acc;
        }, {} as DataMap);

        for (const key in tempData) {
            const dataField = key as DataField;
            const attributes = fakemonAttributes[dataField];
            if (attributes) {
                const randomValue = attributes[Math.floor(Math.random() * attributes.length)];
                tempData[dataField] = randomValue;
            }
        }

        tempData[DataField.Habitat] = Habitat.Field;

        const tempColors = [defaultColor, defaultColor];
        const enumValues = Object.values(Type);
        const firstType = enumValues[Math.floor(Math.random() * enumValues.length)] as Type;
        const secondType = enumValues[Math.floor(Math.random() * enumValues.length)] as Type;

        tempData[DataField.PrimaryType] = firstType;
        tempColors[0] = types.Values[firstType];
        if (secondType !== firstType) {
            tempData[DataField.SecondaryType] = secondType;
            tempColors[1] = types.Values[secondType];
        }
        setColors(tempColors);
        onChange?.(tempData);
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
        for (const key in currentData) {
            const dataType = <div className={styles.dataTypeText} key={key + "_dataType"}>{key}</div>;
            const questionMark = <QuestionMark title={key} text={getDescription(key)} />
            const value = <div className={styles.valueText} key={key + "_value"}>{currentData[key as DataField]}</div>;
            const icon: string = currentData[key as DataField];
            let IconSvg: React.FunctionComponent<React.SVGProps<SVGSVGElement>> = typeSvgComponentMap[icon];
            let fillColor: string | undefined = types.Values[icon];
            switch (key) {
                case DataField.PrimaryType:
                    IconSvg = typeSvgComponentMap[icon];
                    break;
                case DataField.SecondaryType:
                    IconSvg = typeSvgComponentMap[icon];
                    break;
                case DataField.Size:
                    IconSvg = sizeSvgComponentMap[icon];
                    fillColor = datamap[DataField.Size].Values[currentData[key]];
                    break;
                case DataField.Climate:
                    IconSvg = climateSvgComponentMap[icon];
                    fillColor = datamap[DataField.Climate].Values[currentData[key]];
                    break;
                case DataField.Habitat:
                    IconSvg = habitatSvgComponentMap[icon];
                    fillColor = datamap[DataField.Habitat].Values[currentData[key]];
                    break;
                case DataField.Diet:
                    IconSvg = dietSvgComponentMap[icon];
                    fillColor = datamap[DataField.Diet].Values[currentData[key]];
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
