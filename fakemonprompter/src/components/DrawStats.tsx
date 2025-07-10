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

/**
 * Draws the background hexagon for the stats radar chart.
 * @param ctx CanvasRenderingContext2D
 * @param stats Stats
 */
function drawBackgroundHexagon(ctx: CanvasRenderingContext2D, stats: Stats) {
    ctx.beginPath();
    let index: number = 0;
    
    for (const [key] of Object.entries(stats.value)) {
        if (key === 'Total') continue;
        const angle = (Math.PI / 3) * index + rotationOffset;
        const x = centerX + maxRadius * Math.cos(angle);
        const y = centerY + maxRadius * Math.sin(angle);
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        index++;
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
    let index = 0;
    for (const [key, value] of Object.entries(stats.value)) {
        if (key === 'Total') continue;
        const normalized = Math.max(0, Math.min(1, value / 200));
        const radius = minRadius + (maxRadius - minRadius) * normalized;
        const angle = (Math.PI / 3) * index + rotationOffset;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        ctx.lineTo(x, y);
        index++;
    }
    ctx.closePath();
    ctx.fillStyle = '#80dfff';
    ctx.globalAlpha = 0.8;
    ctx.fill();
}

function drawLines(ctx: CanvasRenderingContext2D, stats: Stats) {
    ctx.beginPath();
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = '#ffdb4d';
    let index = 0;
    const degrees = -90;
    const rotationOffset = degrees * (Math.PI / 180)
    for (const [key] of Object.entries(stats.value)) {
        if (key === 'Total') continue;
        const angle = (Math.PI / 3) * index + rotationOffset;
        const x = centerX + maxRadius * Math.cos(angle);
        const y = centerY + maxRadius * Math.sin(angle);
        const textX = centerX + (maxRadius + textOffset) * Math.cos(angle);
        const textY = centerY + (maxRadius + textOffset) * Math.sin(angle);

        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.fillText(key, textX, textY);
        index++;
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

        drawLines(ctx, stats);

        drawPolygon(ctx, stats);
    }, [stats]);

    return (
        <div>
            <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} style={{ border: '1px solid #000' }} />
        </div>
    );
}