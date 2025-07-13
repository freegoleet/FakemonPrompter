import { useRef, useEffect } from 'react';
import type { Stats } from './StatManager.tsx';

const canvasWidth: number = 200;
const canvasHeight: number = 200;
const minRadius: number = 1;
const maxRadius: number = 60;
const centerX: number = 100;
const centerY: number = 100;
const textOffset: number = 24;
const degrees = -90;
const rotationOffset = degrees * (Math.PI / 180)
const fontSize: number = 12;
const valueOffset: number = 2;
type CustomOrder = {
    [key: number]: string;
}
const customOrder: CustomOrder = { [0]: "Hp", [1]: "Attack", [2]: "Defense", [3]: "Speed", [4]: "Sp. Def.", [5]: "Sp. Atk." }

function drawBackgroundHexagon(ctx: CanvasRenderingContext2D, stats: Stats) {
    ctx.beginPath();

    for(let i = 0; i < Object.entries(customOrder).length; i++) {
        const key: string = customOrder[i];
        if (stats.value[key] === undefined) {
            console.warn(`Key "${key}" not found in stats.value. Make sure the customOrder values match those in the json.`);
        }
        const angle = (Math.PI / 3) * i + rotationOffset;
        const x = centerX + maxRadius * Math.cos(angle);
        const y = centerY + maxRadius * Math.sin(angle);
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.closePath();
    ctx.globalAlpha = 1.0;
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = 'gray';
    ctx.globalAlpha = 0.3;
    ctx.fill();
    ctx.globalAlpha = 1.0;
}

function drawPolygon(ctx: CanvasRenderingContext2D, stats: Stats) {
    ctx.beginPath();

    for(let i = 0; i < Object.entries(customOrder).length; i++) {
        const key: string = customOrder[i];
        if (stats.value[key] === undefined) {
            console.warn(`Key "${key}" not found in stats.value. Make sure the customOrder values match those in the json.`);
        }
        const normalized = Math.max(0, Math.min(1, stats.value[key] / 200));
        const radius = minRadius + (maxRadius - minRadius) * normalized;
        const angle = (Math.PI / 3) * i + rotationOffset;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.fillStyle = '#80dfff';
    ctx.globalAlpha = 0.8;
    ctx.fill();
}

function drawLinesAndText(ctx: CanvasRenderingContext2D, stats: Stats) {
    ctx.beginPath();
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = '#ffdb4d';
    const degrees = -90;
    const rotationOffset = degrees * (Math.PI / 180)

    for (let i = 0; i < Object.entries(customOrder).length; i++) {
        const key: string = customOrder[i];
        if (stats.value[key] === undefined) {
            console.warn(`Key "${key}" not found in stats.value. Make sure the customOrder values match those in the json.`);
        }

        const angle = (Math.PI / 3) * i + rotationOffset;
        const x = centerX + maxRadius * Math.cos(angle);
        const y = centerY + maxRadius * Math.sin(angle);
        const textX = centerX + (maxRadius + textOffset) * Math.cos(angle);
        let textY = centerY + (maxRadius + textOffset) * Math.sin(angle);

        if (key === 'Speed') {
            textY -= fontSize;
        }

        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.fillStyle = '#ffdb4d';
        ctx.fillText(key, textX, textY);
        ctx.fillStyle = 'white';
        ctx.fillText(stats.value[key].toString(), textX, textY + fontSize + valueOffset);
    }

    ctx.closePath();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.3;
    ctx.stroke();
    ctx.globalAlpha = 1.0;
}

export function DrawStats({ stats }: { stats: Stats }) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            console.log("canvasRef was null.");
            return;
        }
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawBackgroundHexagon(ctx, stats);

        drawLinesAndText(ctx, stats);

        drawPolygon(ctx, stats);
    }, [stats]);

    return (
        <div>
            <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} style={{ border: '1px solid #000' }} />
        </div>
    );
}