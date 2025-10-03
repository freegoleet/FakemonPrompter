import React, { useEffect, useRef, useState } from 'react';
import { randomRange, inverseLerp, lerp, randomSign, normalizeVector2, type vector2 } from '../assets/utils/MathUtils';
import { DataField, Climate, type DataMap } from '../assets/utils/FakemonUtils';
import backgroundData from '../assets/background-data.json';
import { isMobileScreen } from '../assets/utils/ScreenUtils';
import { weatherMap } from '../assets/DataSvgManager';
import styles from '../styles/AnimatedWeather.module.css';
import { deepCopy } from '../assets/utils/GeneralUtils';
import AnimatedSun from './AnimatedSun'

interface WeatherProps {
    spawnRate: number; // In milliseconds
    mSpawnRate: number;
    spawnAreaStart: vector2;
    spawnAreaEnd: vector2;
    mSpawnAreaStart: vector2;
    mSpawnAreaEnd: vector2;
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
interface AnimatedSvg {
    id: number;
    y: number;
    x: number;
    height: number;
    width: number;
    scale: number;
    rotation?: number;
    xScale?: number;
    speed: number;
    moveDirection: vector2;
    currentDirection: vector2;
    xScaleDirection: number;
    flipX: boolean;
    rotationTime: number;
    lastFlutterTime: number;
    xDirection: number;
    flutter?: Flutter;
}
interface Flutter {
    flutterPhase: number;
    flutterInterval: number;
    flutterDuration: number;
    flutterDirection: vector2;
    startDirection: vector2;
    targetDirection: vector2;
    elapsedFlutterTime: number;
}
interface AnimatedWeatherProps {
    data: DataMap;
    children?: React.ReactNode;
}

const AnimatedWeather: React.FC<AnimatedWeatherProps> = ({ data, children }: AnimatedWeatherProps) => {
    const [animSvgInstances, setAnimSvgInstances] = useState<AnimatedSvg[]>([]);
    const [nextId, setNextId] = useState(0);
    const [climate, setClimate] = useState<Climate>(data[DataField.Climate] as Climate);
    const requestRef = useRef<number>(10);
    const [SvgClimate, setSvgClimate] = useState<React.ComponentType<React.SVGProps<SVGSVGElement>> | undefined>(undefined);
    const [weatherProps] = useState<Record<Climate, WeatherProps>>(
        Object.entries(backgroundData.Weather.Precipitation).reduce((acc, [key, value]) => {
            const climateKey = key as Climate;
            if (climateKey !== undefined) {
                acc[climateKey] = value as WeatherProps;
            }
            return acc;
        }, {} as Record<Climate, WeatherProps>));
    const lastFrameTimeRef = useRef<number>(performance.now());

    // Setting Climate
    useEffect(() => {
        const newClimate = data[DataField.Climate] as Climate;
        if (newClimate === climate) {
            return;
        }
        setAnimSvgInstances([]);
        setClimate(newClimate);
    }, [data, climate])

    // Spawning SVGs6
    useEffect(() => {
        if (climate === Climate.Dry) {
            setAnimSvgInstances([]);

            return;
        }

        const props = weatherProps[climate];
        const MAX_INSTANCES = 100; // Set your desired maximum here
        const interval = setInterval(() => {
            setAnimSvgInstances(instances => {
                if (instances.length >= MAX_INSTANCES) {
                    return instances;
                }
                const startArea = isMobileScreen() ? props.mSpawnAreaStart : props.spawnAreaStart;
                const endArea = isMobileScreen() ? props.mSpawnAreaEnd : props.spawnAreaEnd;
                const screenheight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
                const screenwidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);

                const spawnAreaWidth = screenwidth * (endArea.x - startArea.x);
                const spawnAreaHeight = screenheight * (endArea.y - startArea.y);

                const xOffset = screenwidth * startArea.x;
                const yOffset = screenheight * startArea.y;
                const xVsY = spawnAreaWidth / (spawnAreaWidth + spawnAreaHeight * 0.5);
                const spawnX: boolean = Math.random() < xVsY;

                const randomVal = Math.random();
                const svgWidth = randomRange(props.minWidth, props.maxWidth, randomVal);
                const svgHeight = randomRange(props.minHeight, props.maxHeight, randomVal);

                let x = 0;
                let y = 0;

                if (spawnX) {
                    x = Math.random() * spawnAreaWidth + xOffset;
                    y = -props.maxHeight;
                }
                else {
                    x = -props.maxWidth;
                    y = Math.random() * spawnAreaHeight + yOffset;
                }

                let flutter: Flutter | undefined = undefined;
                const dir = normalizeVector2(props.moveDirection);

                if (climate === Climate.Temperate || climate === Climate.Continental ? true : false) {
                    const flutterDir: vector2 = normalizeVector2({ x: 0.7, y: 0.6 });
                    flutter = {
                        flutterPhase: Math.random() * Math.PI * 2,
                        flutterInterval: randomRange(3000, 5000),
                        flutterDuration: randomRange(2, 8),
                        flutterDirection: flutterDir,
                        startDirection: deepCopy(dir),
                        targetDirection: flutterDir,
                        elapsedFlutterTime: 0
                    }
                }

                return ([
                    ...instances,
                    {
                        id: nextId,
                        x: x,
                        y: y,
                        width: svgWidth,
                        height: svgHeight,
                        scale: inverseLerp(props.minHeight, props.maxHeight, randomRange(props.minHeight, props.maxHeight)),
                        xScaleDirection: randomSign(),
                        flipX: false,
                        speed: props.moveSpeed * (1 + randomVal) * 0.03,
                        moveDirection: dir,
                        currentDirection: deepCopy(dir),
                        rotation: props.randomStartRot ? Math.random() * 360 : 0,
                        rotationTime: props.rotationSpeed,
                        flutter: flutter,
                        lastFlutterTime: performance.now(),
                        xDirection: 1,
                    }
                ]);
            });
            setNextId(id => id + 1);
        }, isMobileScreen() ? props.mSpawnRate : props.spawnRate);
        return () => clearInterval(interval);
    }, [nextId, weatherProps, data, climate]);

    // Animating SVGs
    useEffect(() => {
        const animate = () => {
            const now = performance.now();
            const deltaTime = (now - lastFrameTimeRef.current) / 1000;
            lastFrameTimeRef.current = now;
            setAnimSvgInstances(instances =>
                instances
                    .map(inst => {
                        let direction: vector2 = inst.currentDirection;
                        const speed: number = inst.speed * 100;

                        if (inst.flutter !== undefined) {
                            const duration = inst.flutter.flutterDuration;

                            if (inst.flutter.elapsedFlutterTime < duration) {
                                inst.flutter.elapsedFlutterTime += deltaTime;
                                direction = lerp(
                                    inst.flutter.startDirection,
                                    inst.flutter.targetDirection,
                                    Math.min(inst.flutter.elapsedFlutterTime / duration, 1)
                                );
                            } else {
                                inst.flutter.elapsedFlutterTime = 0;
                                inst.flutter.startDirection = inst.flutter.targetDirection === inst.flutter.flutterDirection ? inst.flutter.flutterDirection : inst.moveDirection;
                                inst.flutter.targetDirection = inst.flutter.targetDirection === inst.flutter.flutterDirection ? inst.moveDirection : inst.flutter.flutterDirection;
                            }
                        }

                        if (climate === Climate.Tropical) {
                            const angleRad = Math.atan2(direction.y, direction.x);
                            const angleDeg = angleRad * (-50 / Math.PI); // TODO: Angle
                            inst.rotation = angleDeg;
                        }

                        if (climate === Climate.Polar) {
                            inst.rotation = 0;
                        }

                        inst.x = inst.x + direction.x * speed * deltaTime;
                        inst.y = inst.y + direction.y * speed * deltaTime;
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
                            width: inst.width,
                            height: inst.height,
                            xScale: newXScale,
                            xScaleDirection: newDirection,
                            flutterPhase: inst.flutter?.flutterPhase !== undefined ? inst.flutter?.flutterPhase : Math.random() * Math.PI * 2
                        };
                    })
                    .filter(inst =>
                        inst.y < Math.max(document.documentElement.scrollHeight, document.body.scrollHeight) &&
                        inst.x < Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)
                    )
            );
            requestRef.current = requestAnimationFrame(animate);
        };
        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [data, climate]);

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

    return (
        <div className={styles.weather}>
            {climate === Climate.Dry ? <AnimatedSun /> : null}
            {animSvgInstances.map(inst =>
                SvgClimate ? (
                    <div
                        key={inst.id}
                        className={styles.precipitation}
                        style={{
                            width: inst.width * 2,
                            height: inst.height * 2,
                            left: inst.x,
                            top: inst.y,
                            transform: `rotate(${inst.rotation}deg)`,
                        }}
                    >
                        <SvgClimate
                            width={inst.width}
                            height={inst.height}
                            style={{
                                fill: 'white',
                                transform: `scaleX(${inst.xScale})`,
                                transformOrigin: '50% 50%'
                            }}
                            preserveAspectRatio={"none"}
                        />
                    </div>
                ) : null
            )}
            {children}
        </div>
    );
}

export default AnimatedWeather;