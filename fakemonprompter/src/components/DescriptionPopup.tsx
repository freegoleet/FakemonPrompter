import styles from '../styles/DescriptionPopup.module.css';
import { useState, useEffect } from 'react';

export function QuestionMark({ title, text }: { title: string, text: string }) {
    const [hoveredKey, setHoveredKey] = useState<string | null>(null);

    useEffect(() => {
        if (hoveredKey !== null) {
            const handleScroll = () => setHoveredKey(null);
            window.addEventListener('scroll', handleScroll, true);
            return () => {
                window.removeEventListener('scroll', handleScroll, true);
            };
        }
    }, [hoveredKey]);

    return (
        <button
            onClick={() => setHoveredKey(hoveredKey === title ? null : title)}
            className={`${styles.questionMark} ${(hoveredKey === title && hoveredKey !== null) ? styles.hover : ''}`}
            key={title + "_questionMark"}
            onMouseEnter={() => setHoveredKey(title)}
            onMouseLeave={() => setHoveredKey(null) }
            disabled={hoveredKey === title}
        >
            ?
            {hoveredKey === title && (
                <Popup text={text} />
            )}
        </button>
    )
}

export function Popup({ text }: { text: string }) {
    return (
        <div className={styles.descriptionPopupCard}>
            {text.split('\n').map((line, idx) => (
                <span key={idx}>
                    {line}
                    {idx < text.split('\n').length - 1 && <br />}
                </span>
            ))}
        </div>
    );
}