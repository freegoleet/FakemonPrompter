import { useState, useEffect, useRef } from 'react';
import styles from '../styles/DescriptionPopup.module.css';
import { createPortal } from 'react-dom';

interface PopupProps {
    top: number;
    left: number;
    reverseDir: boolean;
    text?: string;
    children?: React.ReactNode;
}

const Popup: React.FC<PopupProps> = ({ top, left, text, children, reverseDir }) => {
    const [transform, setTransform] = useState("translate(4%, calc(-100% - 2ch))");
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (reverseDir == false) {
            if (isMobileDevice() === true) {
                setTransform("translate(-50%, 0px)");
                return;
            }
            setTransform("translate(4%, 0px)");
        } else {
            if (isMobileDevice() === true) {
                setTransform("translate(-50%, calc(-100% - 2ch))");
                return;
            }
            setTransform("translate(4%, calc(-100% - 2ch))");
        }
    }, [reverseDir]);

    return (
        <div
            ref={popupRef}
            className={styles.descriptionPopupCard}
            style={{
                transform: transform,
                top: top,
                left: left

            }}
        >
            {text
                ? text.split('\n').map((line, idx) => (
                    <span key={idx}>
                        {line}
                        {idx < text.split('\n').length - 1 && <br />}
                    </span>
                ))
                : children}
        </div>
    );
};

export default Popup;

let closeAllPopups: (() => void)[] = [];

export function QuestionMark({ title, text }: { title: string, text: string }) {
    const [isPopupOpen, setPopupOpen] = useState(false);
    const [popupPos, setPopupPos] = useState<{ x: number, y: number } | null>(null);
    const [reverseDir, setReverseDir] = useState<boolean>(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const closeFn = () => setPopupOpen(false);
        if (isMobileDevice()) {
            closeAllPopups.push(closeFn);
            return () => {
                closeAllPopups = closeAllPopups.filter(fn => fn !== closeFn);
            };
        }
    }, []);

    useEffect(() => {
        if (isPopupOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setPopupPos({
                x: rect.left + window.scrollX,
                y: rect.bottom + window.scrollY
            });
            setReverseDir(rect.bottom > window.innerHeight * 0.5);
            console.log(rect.bottom);
        }
    }, [isPopupOpen]);

    useEffect(() => {
        function handleDocumentMouseDown(event: MouseEvent) {
            if (
                isPopupOpen &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node) &&
                !(event.target instanceof HTMLButtonElement)
            ) {
                setPopupOpen(false);
            }
        }

        document.addEventListener('mousedown', handleDocumentMouseDown);

        return () => {
            document.removeEventListener('mousedown', handleDocumentMouseDown);
        };
    }, [isPopupOpen]);

    function handleClick() {
        if (isMobileDevice()) {
            closeAllPopups.forEach(fn => fn());
        }
        setPopupOpen(!isPopupOpen);
    }

    return (
        <>
            <button
                ref={buttonRef}
                onClick={handleClick}
                onMouseEnter={() => !isMobileDevice() && setPopupOpen(true)}
                onMouseLeave={() => !isMobileDevice() && setPopupOpen(false)}
                className={`${styles.questionMark} ${(isPopupOpen) ? styles.hover : ''}`}
                key={title + "_questionMark"}
                disabled={isPopupOpen}
            >
                ?
            </button>
            {isPopupOpen && popupPos && createPortal(
                <Popup text={text} left={popupPos.x} top={popupPos.y} reverseDir={reverseDir} />,
                document.body
            )}
        </>
    )
}

function isMobileDevice() {
    return typeof window !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent);
}
