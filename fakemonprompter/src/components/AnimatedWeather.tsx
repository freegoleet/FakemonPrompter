import React, { useEffect, useRef, useState } from 'react';
import { randomRange, inverseLerp, randomSign, normalizeVector2, type vector2 } from '../assets/utils/MathUtils';
import { DataField, Climate, type DataMap } from '../assets/utils/FakemonUtils';
import backgroundData from '../assets/background-data.json';
import { isMobileScreen } from '../assets/utils/ScreenUtils';
import { weatherMap } from '../assets/DataSvgManager';
import styles from '../styles/AnimatedWeather.module.css';

interface WeatherProps {
    spawnRate: number; // per second
    mSpawnRate: number;
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
    direction: vector2;
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
}
interface AnimatedWeatherProps {
    data: DataMap;
    children?: React.ReactNode;
}
const getRandomXPos = (width: number) => Math.random() * (window.innerWidth - width);
function deepCopy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

const AnimatedWeather: React.FC<AnimatedWeatherProps> = ({ data, children }: AnimatedWeatherProps) => {
    const [animSvgInstances, setAnimSvgInstances] = useState<AnimatedSvg[]>([]);
    const [nextId, setNextId] = useState(0);
    const [climate, setClimate] = useState<Climate>();
    const requestRef = useRef<number>(10);
    const [SvgClimate, setSvgClimate] = useState<React.ComponentType<React.SVGProps<SVGSVGElement>> | undefined>(undefined);
    const [weatherProps] = useState<Record<Climate, WeatherProps>>(Object.keys(backgroundData.Weather).reduce((acc, key) => {
        const climateKey = Climate[key as keyof typeof Climate];
        if (climateKey !== undefined) {
            acc[climateKey] = backgroundData.Weather[key as keyof typeof backgroundData.Weather];
        }
        return acc;
    }, {} as Record<Climate, WeatherProps>));
    const lastFrameTimeRef = useRef<number>(performance.now());

    useEffect(() => {
        const newClimate = data[DataField.Climate] as Climate;
        if (newClimate === climate) {
            return;
        }
        setClimate(newClimate);
        setAnimSvgInstances([]);

    }, [data, climate])

    useEffect(() => {
        const props = weatherProps[data[DataField.Climate] as Climate];
        let horizontal = false;
        if (props.moveDirection.x === -1) {
            horizontal = true;
        }
        const MAX_INSTANCES = 1; // Set your desired maximum here

        const interval = setInterval(() => {
            setAnimSvgInstances(instances => {
                if (instances.length >= MAX_INSTANCES) {
                    return instances; // Do not spawn more if at limit
                }
                const randomVal = Math.random();
                const width = randomRange(props.minWidth, props.maxWidth, randomVal);
                const height = randomRange(props.minHeight, props.maxHeight, randomVal);
                const x = horizontal ? window.innerWidth + props.maxWidth : getRandomXPos(props.maxWidth);
                const y = horizontal ? Math.random() * window.innerHeight : -props.minHeight;
                let flutter: Flutter | undefined = undefined;
                const dir = normalizeVector2(props.moveDirection);

                if (data[DataField.Climate] as Climate === Climate.Temperate || data.Climate === Climate.Continental ? true : false) {
                    const flutterDir: vector2 = normalizeVector2({ x: 0.7, y: 0.6 });
                    flutter = {
                        flutterPhase: Math.random() * Math.PI * 2, flutterInterval: randomRange(3000, 5000), flutterDuration: randomRange(1000, 2000), flutterDirection: flutterDir
                    }
                }

                return ([
                    ...instances,
                    {
                        id: nextId,
                        x: x,
                        y: y,
                        width: width,
                        height: height,
                        scale: inverseLerp(props.minHeight, props.maxHeight, randomRange(props.minHeight, props.maxHeight)),
                        xScaleDirection: randomSign(),
                        flipX: false,
                        speed: props.moveSpeed * (1 + randomVal) * 0.03,
                        direction: dir,
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
    }, [nextId, weatherProps, data]);

    // Animating SVGs
    useEffect(() => {
        const animate = () => {
            const now = performance.now();
            const deltaTime = (now - lastFrameTimeRef.current) / 1000;
            lastFrameTimeRef.current = now;
            setAnimSvgInstances(instances =>
                instances
                    .map(inst => {
                        const direction: vector2 = inst.currentDirection;
                        const speed: number = inst.speed * 100;

                        if (inst.flutter !== undefined) {
                            const timeSinceLastChange = now - inst.lastFlutterTime;
                            const interval = inst.flutter.flutterInterval;
                            const duration = inst.flutter.flutterDuration;
                            const timeInInterval = timeSinceLastChange % interval;

                            if (timeInInterval < duration) {
                                const targetX = timeInInterval < duration * 0.5 ? inst.flutter.flutterDirection.x : inst.direction.x;
                                const targetY = timeInInterval < duration + 0.5 ? inst.flutter.flutterDirection.y : inst.direction.y;

                                // Use a time-based interpolation so direction only reaches target at the end of flutter duration
                                const progress = Math.min(timeInInterval / duration, 1);
                                // Ease in-out for smoother transition
                                const ease = 0.5 - 0.5 * Math.cos(Math.PI * progress);
                                direction.x = direction.x + (targetX - direction.x) * ease;
                                direction.y = direction.y + (targetY - direction.y) * ease;


                                const dir = normalizeVector2(direction);
                                direction.x = dir.x;
                                direction.y = dir.y;

                            }
                            //console.log(`mag: `, mag);
                        }

                        if (climate === Climate.Tropical) {
                            const angleRad = Math.atan2(direction.y, direction.x);
                            const angleDeg = angleRad * (-20 / Math.PI);
                            inst.rotation = angleDeg;
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
                    .filter(inst => inst.y < window.innerHeight && inst.x + inst.width > 0)
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
        <div >
            {animSvgInstances.map(inst =>
                SvgClimate ? (
                    <div
                        key={inst.id}
                        className={styles.precipitation}
                        style={{
                            left: inst.x,
                            top: inst.y,
                            transform: `scaleX(${inst.xScale}) rotate(${inst.rotation ?? 0}deg)`
                        }}
                    >
                        <SvgClimate
                            width={inst.width}
                            height={inst.height}
                            style={{
                                fill: 'white',
                                transform: `rotate(${inst.rotation ?? 0}deg)`
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