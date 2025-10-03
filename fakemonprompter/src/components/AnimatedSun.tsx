import { useState, useEffect, useRef } from 'react';
import { weatherMap, type SvgComponent } from '../assets/DataSvgManager';
import styles from '../styles/AnimatedWeather.module.css';
import backgroundData from '../assets/background-data.json';
import { isMobileScreen } from '../assets/utils/ScreenUtils';

enum SunLayer {
    OuterGlare = "OuterGlare",
    MiddleGlare = "MiddleGlare",
    InnerGlare = "InnerGlare",
    Orb = "Orb"
}

interface SunProps {
    baseScale: number;
    pulseScaleRange: number;
    pulseSpeed: number;
    rotationSpeed: number;
}

const SvgSun: SvgComponent = weatherMap["Dry1"];
const SvgInnerGlare: SvgComponent = weatherMap["Dry2"];
const SvgMiddleGlare: SvgComponent = weatherMap["Dry3"];
const SvgOuterGlare: SvgComponent = weatherMap["Dry4"];

const AnimatedSun: React.FC = () => {
    const [size] = useState(backgroundData.Weather.Dry.baseSize);
    const [intensity] = useState(backgroundData.Weather.Dry.intensity);
    const [color] = useState(backgroundData.Weather.Dry.color);

    const requestRef = useRef<number>(0);
    const [sunProps] = useState<Record<SunLayer, SunProps>>(
        Object.entries(backgroundData.Weather.Dry.Layers).reduce((acc, [key, value]) => {
            const layerKey = key as SunLayer;
            acc[layerKey] = {
                baseScale: value.baseScale,
                pulseScaleRange: value.pulseScale,
                pulseSpeed: value.pulseSpeed,
                rotationSpeed: value.rotationSpeed
            } as SunProps;
            return acc;
        }, {} as Record<SunLayer, SunProps>)
    );
    const [rot, setRot] = useState<Record<SunLayer, number>>(
        Object.values(SunLayer).reduce((acc, layer) => {
            acc[layer] = 0;
            return acc;
        }, {} as Record<SunLayer, number>)
    );
    const [pulse, setPulse] = useState<Record<SunLayer, number>>(
        Object.values(SunLayer).reduce((acc, layer) => {
            acc[layer] = 0;
            return acc;
        }, {} as Record<SunLayer, number>)
    );
    const [top] = useState(isMobileScreen() ? 300 : 0);
    const [left] = useState(isMobileScreen() ? 150 : window.innerWidth - size);

    useEffect(() => {
        let lastTime = performance.now();
        const animate = (time: number) => {
            const delta = time - lastTime;
            lastTime = time;
            for (const layer in sunProps) {
                setRot(prev => {
                    const updated: Record<SunLayer, number> = { ...prev };
                    const key = layer as SunLayer;
                    updated[key] = (prev[key] + sunProps[key].rotationSpeed * delta * 0.001) % 360;
                    return updated;
                });


                setPulse(prev => {
                    const updated: Record<SunLayer, number> = { ...prev };
                    const key = layer as SunLayer;
                    const t = performance.now() * sunProps[key].pulseSpeed * 0.0001;
                    updated[key] = sunProps[key].baseScale + sunProps[key].pulseScaleRange * (0.3 + 0.3 * Math.sin(t));
                    return updated;
                });


            }
            requestRef.current = requestAnimationFrame(animate);
        };
        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [size, intensity, rot, pulse, sunProps]);

    return (
        <div className={styles.weather}>
            {SvgOuterGlare &&
                (<SvgOuterGlare
                    width={size}
                    height={size}
                    style={{
                        position: 'absolute',
                        top: top,
                        left: left,
                        opacity: 0.3 + 0.4 * intensity,
                        pointerEvents: 'none',
                        fill: color,
                        transform: `rotate(${rot[SunLayer.OuterGlare]}deg) scale(${pulse[SunLayer.OuterGlare]})`,
                        transformOrigin: '50% 50%'
                    }}
                />)
            }
            {SvgMiddleGlare &&
                (<SvgMiddleGlare
                    width={size}
                    height={size}
                    style={{
                        position: 'absolute',
                        top: top,
                        left: left,
                        opacity: 0.3 + 0.4 * intensity,
                        pointerEvents: 'none',
                        fill: color,
                        transform: `rotate(${rot[SunLayer.MiddleGlare]}deg) scale(${pulse[SunLayer.MiddleGlare]})`,
                        transformOrigin: '50% 50%'
                    }}
                />)
            }
            {SvgInnerGlare &&
                (<SvgInnerGlare
                    width={size}
                    height={size}
                    style={{
                        position: 'absolute',
                        top: top,
                        left: left,
                        opacity: 0.5 + 0.5 * intensity,
                        pointerEvents: 'none',
                        fill: color,
                        transform: `rotate(${rot[SunLayer.InnerGlare]}deg) scale(${pulse[SunLayer.InnerGlare]})`,
                        transformOrigin: '50% 50%'
                    }}
                />)
            }
            {SvgSun &&
                (<SvgSun
                    width={size}
                    height={size}
                    style={{
                        position: 'absolute',
                        top: top,
                        left: left,
                        opacity: 0.8 + 0.2 * intensity,
                        transform: `scale(${pulse[SunLayer.Orb]})`,
                        fill: color
                    }}
                />)
            }
        </div>
    )
}

export default AnimatedSun;
