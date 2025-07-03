import { useRef, useEffect } from 'react';
import type { Stats } from './StatManager.tsx';

export function DrawStats({ stats }: { stats: Stats }) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            console.log("canvasRef was null.");
            return;
        }
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const minRadius = 5; // Minimum radius for the hexagon
        const maxRadius = 100; // Maximum radius for the hexagon
        //const radius = 50;
        const centerX = 100;
        const centerY = 100;

        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous drawings
        ctx.beginPath();
        
        let index: number = 0;
        const rotationOffset = Math.PI / 6;
        for (const [key] of Object.entries(stats.value)) {
            if (key === 'Total') continue;
             // Rotate by 30 degrees
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
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = 'gray';
        ctx.globalAlpha = 0.3; // Make background hexagon semi-transparent
        ctx.fill();
        ctx.globalAlpha = 1.0; // Reset alpha for next drawings

        ctx.beginPath();
        index = 0;
        for (const [key, value] of Object.entries(stats.value)) {
            if (key === 'Total') continue;
            const normalized = Math.max(0, Math.min(1, value / 255));
            const radius = minRadius + (maxRadius - minRadius) * normalized;
            const angle = (Math.PI / 3) * index + rotationOffset;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            ctx.lineTo(x, y);
            index++;
        }
        ctx.closePath();
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = 'lightblue';
        ctx.fill();
    }, [stats]); // Redraw if stats change

    return (
        <div>
            <canvas ref={canvasRef} width={200} height={200} style={{ border: '1px solid #000' }} />
        </div>
    );
}