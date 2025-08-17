import styles from '../styles/Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            © {new Date().getFullYear()} Roy Ahlgren Löfvendahl
        </footer>
    );
}