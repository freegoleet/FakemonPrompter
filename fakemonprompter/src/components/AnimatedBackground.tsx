import { useState, useEffect, useRef } from 'react';
import styles from '../styles/AnimatedBackground.module.css';
import {
    backgroundMap,
    weatherMap
} from '../assets/DataSvgManager';
import { isMobileScreen } from '../assets/utils/ScreenUtils';
import { DataField, Habitat, Climate, type DataMap } from '../assets/utils/FakemonUtils';
import { randomRange, inverseLerp, randomSign } from '../assets/utils/MathUtils';
import backgroundData from '../assets/background-data.json';

export interface vector2 {
    x: number;
    y: number;
}

interface AnimatedBackgroundProps {
    data: DataMap;
    children?: React.ReactNode;
}

interface SvgInstance {
    id: number;
    y: number;
    x: number;
    height: number;
    width: number;
    scale: number;
    rotation?: number;
    xScale?: number;
    moveSpeed: number;
    moveDirection: vector2;
    xScaleDirection: number;
    flipX: boolean;
    rotationTime: number;
}

interface WeatherProps {
    spawnRate: number; // per second
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
    randomStartRot: boolean;
    rotationSpeed: number;
    sizeVariance: number;
    moveSpeed: number;
    moveDirection: vector2;
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

type SvgComponent = React.ComponentType<React.SVGProps<SVGSVGElement>> | undefined;
const getRandomXPos = (width: number) => Math.random() * (window.innerWidth - width);

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ data, children }: AnimatedBackgroundProps) => {
    const [svgInstances, setSvgInstances] = useState<SvgInstance[]>([]);
    const [nextId, setNextId] = useState(0);
    const requestRef = useRef<number>(10);
    const [SvgClimate, setSvgClimate] = useState<React.ComponentType<React.SVGProps<SVGSVGElement>> | undefined>(undefined);
    const [habitatFeatureNodes, setHabitatFeatureNodes] = useState<React.ReactNode[]>([]);

    const [bgProps] = useState<Record<Habitat, BgProps>>(Object.keys(backgroundData.Background).reduce((acc, key) => {
        const habitatKey = Habitat[key as keyof typeof Habitat];
        if (habitatKey !== undefined) {
            acc[habitatKey] = backgroundData.Background[key as keyof typeof backgroundData.Background];
        }
        return acc;
    }, {} as Record<Habitat, BgProps>));

    const [weatherProps] = useState<Record<Climate, WeatherProps>>(Object.keys(backgroundData.Weather).reduce((acc, key) => {
        const climateKey = Climate[key as keyof typeof Climate];
        if (climateKey !== undefined) {
            acc[climateKey] = backgroundData.Weather[key as keyof typeof backgroundData.Weather];
        }
        return acc;
    }, {} as Record<Climate, WeatherProps>));

    // Spawning new SVGs
    useEffect(() => {
        const props = weatherProps[data[DataField.Climate] as Climate];
        let horizontal = false;
        if (props.moveDirection.x === -1) {
            horizontal = true;
        }
        const interval = setInterval(() => {
            const randomVal = Math.random();
            const x = horizontal ? window.innerWidth + props.maxWidth : getRandomXPos(props.maxWidth);
            const y = horizontal ? Math.random() * window.innerHeight : -props.minHeight;
            console.log(y);
            setSvgInstances(instances => [
                ...instances,
                {
                    id: nextId,
                    x: x,
                    y: y,
                    width: randomRange(props.minWidth, props.maxWidth, randomVal),
                    height: randomRange(props.minHeight, props.maxHeight, randomVal),
                    scale: inverseLerp(props.minHeight, props.maxHeight, randomRange(props.minHeight, props.maxHeight)),
                    xScaleDirection: randomSign(),
                    flipX: false,
                    moveSpeed: props.moveSpeed * (1 + randomVal) * 0.03,
                    moveDirection: props.moveDirection,
                    rotation: props.randomStartRot ? Math.random() * 360 : 0,
                    rotationTime: props.rotationSpeed
                }
            ]);
            setNextId(id => id + 1);
        }, props.spawnRate);
        return () => clearInterval(interval);
    }, [nextId, data]);

    // Animating SVGs
    useEffect(() => {
        const animate = () => {
            setSvgInstances(instances =>
                instances
                    .map(inst => {
                        let newXScale = 1;
                        let newDirection = inst.xScaleDirection;

                        if (inst.rotationTime !== 0) {
                            const cycleDuration = inst.rotationTime;
                            const framesPerSecond = 60;
                            const totalFrames = cycleDuration * framesPerSecond;
                            const xScaleDelta = 2 / totalFrames;

                            newXScale = inst.xScale !== undefined ? inst.xScale + xScaleDelta * inst.xScaleDirection : 1 + xScaleDelta * inst.xScaleDirection;

                            if (newXScale > 1) {
                                newXScale = 1;
                                newDirection = -inst.xScaleDirection;
                            } else if (newXScale < -1) {
                                newXScale = -1;
                                newDirection = -inst.xScaleDirection;
                            }
                        }
                        return {
                            ...inst,
                            x: inst.x + inst.moveDirection.x * inst.moveSpeed,
                            y: inst.y + inst.moveDirection.y * inst.moveSpeed,
                            width: inst.width,
                            height: inst.height,
                            xScale: newXScale,
                            xScaleDirection: newDirection,
                        };
                    })
                    .filter(inst => inst.y < window.innerHeight && inst.x + inst.width > 0)
            );
            requestRef.current = requestAnimationFrame(animate);
        };
        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [data]);

    // Setting Climate
    useEffect(() => {
        const svgClimate = data['Climate'] ? weatherMap[data['Climate']] : undefined;
        if (typeof svgClimate === 'function') {
            setSvgClimate(() => svgClimate);
        }
        else {
            setSvgClimate(undefined);
        }
    }, [data]);

    // Setting Habitat
    useEffect(() => {
        const habitat: Habitat = data[DataField.Habitat] as Habitat;
        if (habitat === undefined) {
            return;
        }

        const props: BgProps = bgProps[habitat];
        const svgHabitat = habitat ? backgroundMap[habitat] : undefined;

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

        for (let i = 0; i < rows; i++) {
            const flipX: number = (i + 1) % 2 === 0 ? 1 : -1;
            const leftCoef: number = Math.random() * (maxLeft - minLeft) + minLeft;
            const leftOffset: number = window.innerWidth * leftCoef;
            const yOffset: number = 100 * i;
            console.log(`left offset: ${leftOffset}`);
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

        content.push(
            <div className={`${styles.river} ${styles.habitat}`}
                key={`river`}>
                {renderSvgHabitat(svg, width, height)}
            </div>
        );

        return content;
    }

    function backgroundCoast(svg: SvgComponent, props: BgProps): React.ReactNode[] {
        const content: React.ReactNode[] = [];
        const width = isMobileScreen() ? props.mWidth : props.Width;
        const height = isMobileScreen() ? props.mHeight : props.Height;

        content.push(
            <div className={`${styles.coast} ${styles.habitat}`}
                key={`river`}>
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
            {svgInstances.map(inst =>
                SvgClimate ? (
                    <div
                        key={inst.id}
                        className={styles.precipitation}
                        style={{
                            left: inst.x,
                            top: inst.y,
                            transform: `scaleX(${inst.xScale})`
                        }}
                    >
                        <SvgClimate
                            width={inst.width}
                            height={inst.height}
                            style={{
                                fill: 'white',
                                transform: `scaleX(${1}) rotate(${inst.rotation}deg)`
                            }}
                            preserveAspectRatio={"none"}
                        />
                    </div>
                ) : null
            )}
            {children}
        </div>
    );
};

export default AnimatedBackground;