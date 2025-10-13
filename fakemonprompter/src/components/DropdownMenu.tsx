import React, { useRef, useEffect, useState } from 'react';
import styles from '../styles/DropdownMenu.module.css';
import ReactDOM from 'react-dom';

type DropdownMenuProps = {
    options: string[];
    onSelect: (option: string) => void;
    left: number;
    top: number;
    portalParent?: HTMLElement | null;
    label?: string;
};

const width: number = 24 * 12; // 24ch, assuming 1ch ≈ 12px for monospace font

const DropdownMenu: React.FC<DropdownMenuProps> = ({ options, onSelect, label, left, top, portalParent }) => {
    const [selected, setSelected] = useState<string>(options[0] || '');
    const [open, setOpen] = useState<boolean>(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const portalMenuRef = useRef<HTMLDivElement>(null);

    const handleSelect = (option: string) => {
        console.log(`Trying to handle select: `, option);
        setSelected(option);
        onSelect(option);
        setOpen(false);
    };

    const menu = (
        <div
            className={styles.dropDown}
            style={{ left: left - (width * 0.5), top: top, width: width }}
            ref={portalParent ? portalMenuRef : undefined}
        >
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {options.map(option => (
                    <li
                        key={option}
                        onClick={() => handleSelect(option)}
                        className={styles.option}
                        role="option"
                        aria-selected={option === selected}
                    >
                        {option}
                    </li>
                ))}
            </ul>
        </div>
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const isOutsideMain = menuRef.current && !menuRef.current.contains(target);
            const isOutsidePortal = portalMenuRef.current && !portalMenuRef.current.contains(target);

            if (portalParent ? (isOutsideMain && isOutsidePortal) : isOutsideMain) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [portalParent]);

    useEffect(() => {
        console.log(selected);
    }, [selected]);

    return (
        <div ref={menuRef}>
            {label && <label>{label}</label>}
            <button
                className={styles.button}
                onClick={() => setOpen(!open)}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                {selected}
                <span style={{ float: 'right' }}>▼</span>
            </button>
            {open && (
                portalParent
                    ? ReactDOM.createPortal(menu, portalParent)
                    : menu
            )}
        </div>
    );
};

export default DropdownMenu;
