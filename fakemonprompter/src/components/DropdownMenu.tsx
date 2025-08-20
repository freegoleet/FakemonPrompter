import { useState, useRef, useEffect } from 'react';
import styles from '../styles/DropdownMenu.module.css';

type DropdownMenuProps = {
    options: string[];
    onSelect: (option: string) => void;
    label?: string;
};

const DropdownMenu: React.FC<DropdownMenuProps> = ({ options, onSelect, label }) => {
    const [selected, setSelected] = useState<string>(options[0] || '');
    const [open, setOpen] = useState<boolean>(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleSelect = (option: string) => {
        setSelected(option);
        onSelect(option);
        setOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div ref={menuRef} style={{ position: 'relative', display: 'inline-block' }}>
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
                <ul
                    className={styles.dropDown}
                    role="listbox"
                >
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
            )}
        </div>
    );
};

export default DropdownMenu;
