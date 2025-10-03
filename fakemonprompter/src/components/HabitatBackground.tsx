import { useEffect, useState } from 'react';
import styles from '../styles/HabitatBackground.module.css';
import {
    type SvgComponent, backgroundMap
} from '../assets/DataSvgManager';
import { isMobileScreen } from '../assets/utils/ScreenUtils';
import { DataField, Habitat, type DataMap } from '../assets/utils/FakemonUtils';
import { randomRange, randomSign } from '../assets/utils/MathUtils';
import backgroundData from '../assets/background-data.json';

interface HabitatBackgroundProps {
    data: DataMap;
}

interface BgProps {
    Rows: number;
    RowScale: number;
    Amount: number;
    Width: number;
    Height: number;
    SizeVariance: number;
    YOffsetVariance: number;
    mRows: number;
    mRowScale: number;
    mAmount: number;
    mWidth: number;
    mHeight: number;
}
const mRiverYOffset: number = -200; // TODO: Variable   
const mCoastYOffset: number = -500; // TODO: Variable
const desertYOffset: number = 140; // TODO: Variable
const mDesertYOffset: number = 170; // TODO: Variable

const HabitatBackground: React.FC<React.PropsWithChildren<HabitatBackgroundProps>> = ({ data }) => {
    const [habitatFeatureNodes, setHabitatFeatureNodes] = useState<React.ReactNode[]>([]);

    const [bgProps] = useState<Record<Habitat, BgProps>>(Object.keys(backgroundData.Background).reduce((acc, key) => {
        const habitatKey = Habitat[key as keyof typeof Habitat];
        if (habitatKey !== undefined) {
            acc[habitatKey] = backgroundData.Background[key as keyof typeof backgroundData.Background];
        }
        return acc;
    }, {} as Record<Habitat, BgProps>));

    // Setting Habitat
    useEffect(() => {
        const habitat: Habitat = data[DataField.Habitat] as Habitat;
        if (habitat === undefined) {
            return;
        }

        const props: BgProps = bgProps[habitat];
        const svgHabitat = backgroundMap[habitat];

        switch (data[DataField.Habitat]) {
            case Habitat.Desert:
                setHabitatFeatureNodes(backgroundDesert(svgHabitat, props));
                break;
            case Habitat.River:
                setHabitatFeatureNodes(backgroundRiver(svgHabitat, props));
                break;
            case Habitat.Coast:
                setHabitatFeatureNodes(backgroundCoast(svgHabitat, props));
                break;
            case Habitat.Mountain:
                setHabitatFeatureNodes(habitatProcedural(svgHabitat, props));
                break;
            case Habitat.Forest:
                setHabitatFeatureNodes(habitatProcedural(svgHabitat, props));
                break;
            case Habitat.Field:
                setHabitatFeatureNodes(backgroundField(svgHabitat, props));
                break;
            case Habitat.Hills:
                setHabitatFeatureNodes(habitatProcedural(svgHabitat, props));
                break;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    function habitatProcedural(svg: SvgComponent, props: BgProps): React.ReactNode[] {
        const content: React.ReactNode[] = [];
        let botOffset: number = 0;
        let counter: number = 0;
        let baseScale: number = 1;
        let rowYOffset: number = 0;

        let amount = isMobileScreen() ? props.mAmount : props.Amount;
        const width = isMobileScreen() ? props.mWidth : props.Width;
        const height = isMobileScreen() ? props.mHeight : props.Height;
        const rows = isMobileScreen() ? props.mRows : props.Rows;
        const rowScale = isMobileScreen() ? props.mRowScale : props.RowScale;

        for (let i = 0; i < rows; i++) {
            baseScale *= (1 - rowScale);
            let leftOffset: number = Math.random() * (-width * 2);
            for (let j = 0; j < amount; j++) {
                const maxSizeScale = baseScale * props.SizeVariance;
                const minSizeScale = baseScale;
                const scale: number = (Math.random() * (maxSizeScale - minSizeScale)) + (minSizeScale);

                const maxXOffset: number = width * (1 + baseScale);
                const minXOffset: number = width * baseScale;

                const maxYOffset: number = rowYOffset + height * (baseScale * props.YOffsetVariance);
                const minYOffset: number = rowYOffset - height * (baseScale * props.YOffsetVariance);
                const heightOffset = Math.random() * (maxYOffset - minYOffset) + minYOffset;

                botOffset = heightOffset;
                leftOffset += Math.random() * (maxXOffset - minXOffset) + minXOffset;
                content.push(
                    <div className={styles.habitat}
                        key={`habitat${counter}`}
                        style={{
                            left: `${leftOffset}px`, bottom: `${botOffset}px`, scale: scale, transform: `scaleX(${randomSign()})`
                        }}>
                        {renderSvgHabitat(svg, width, height)}
                    </div>
                );
                counter++;
            }
            amount *= (1 + rowScale);
            rowYOffset += height * baseScale;
        }

        return content;
    }

    function backgroundDesert(svg: SvgComponent, props: BgProps): React.ReactNode[] {
        const content: React.ReactNode[] = [];
        const minLeft: number = -0.5;
        const maxLeft: number = 0;
        const width = isMobileScreen() ? props.mWidth : props.Width;
        const height = isMobileScreen() ? props.mHeight : props.Height;
        const rows = isMobileScreen() ? props.mRows : props.Rows;
        let botOffset = isMobileScreen() ? mDesertYOffset : desertYOffset; //TODO: Variab   le
        const botCoef = 0.9;

        for (let i = 0; i < rows; i++) {
            const flipX: number = (i + 1) % 2 === 0 ? 1 : -1;
            const leftCoef: number = Math.random() * (maxLeft - minLeft) + minLeft;
            const leftOffset: number = window.innerWidth * leftCoef;
            const yOffset: number = botOffset * i
            botOffset = botOffset *  botCoef;
            console.log(`yOffset ${i}: ${yOffset}`);
            content.push(
                <div className={`${styles.habitat} ${styles.desert}`}
                    key={`dune${i}`}
                    style={{ width: width, left: `${leftOffset}px`, bottom: `${yOffset}px` }}>
                    {renderSvgHabitat(svg, width, height, { transform: `scaleX(${flipX})` })}
                </div>
            );
        }

        return content;
    }

    function backgroundField(svg: SvgComponent, props: BgProps): React.ReactNode[] {
        const content: React.ReactNode[] = [];
        const width = isMobileScreen() ? props.mWidth : props.Width;
        const height = isMobileScreen() ? props.mHeight : props.Height;

        const flipX: number = randomSign();
        const xOffset: number = randomRange(-width * 0.3, 0);
        const yOffset: number = 0;

        content.push(
            <div className={styles.habitat}
                key={`field`}
                style={{ left: xOffset, bottom: `${yOffset}px` }}>
                {renderSvgHabitat(svg, width, height, { transform: `scaleX(${flipX})` })}
            </div>
        );

        return content;
    }

    function backgroundRiver(svg: SvgComponent, props: BgProps): React.ReactNode[] {
        const content: React.ReactNode[] = [];
        const width = isMobileScreen() ? props.mWidth : props.Width;
        const height = isMobileScreen() ? props.mHeight : props.Height;
        const left = isMobileScreen() ? mRiverYOffset : 0; // TODO: Variable

        content.push(
            <div className={`${styles.river} ${styles.habitat}`}
                key={`river`}
                style={{ left: left }}>
                {renderSvgHabitat(svg, width, height)}
            </div>
        );

        return content;
    }

    function backgroundCoast(svg: SvgComponent, props: BgProps): React.ReactNode[] {
        const content: React.ReactNode[] = [];
        const width = isMobileScreen() ? props.mWidth : props.Width;
        const height = isMobileScreen() ? props.mHeight : props.Height;
        const left = isMobileScreen() ? mCoastYOffset : 0; // TODO: Variable
        content.push(
            <div className={`${styles.coast} ${styles.habitat}`}
                key={`coast`}
                style={{ left: left }}>
                {renderSvgHabitat(svg, width, height)}
            </div>
        );

        return content;
    }

    function renderSvgHabitat(SvgComponent: SvgComponent, width: number, height: number, style?: React.CSSProperties) {
        return SvgComponent ? (
            <SvgComponent
                width={width}
                height={height}
                style={style ?? { fill: 'black' }}
                preserveAspectRatio="none"
            />
        ) : null;
    }

    return (
        <div className={styles.background}>
            {habitatFeatureNodes}
        </div>
    );
}

export default HabitatBackground;