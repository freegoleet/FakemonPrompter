import React from 'react';
import Logo from '../assets/fakemonlogo.svg?react';
import styles from '../styles/Header.module.css'
import { QuestionMark } from '../components/DescriptionPopup';
import fakemonData from '../assets/fakemondata.json'

const Header: React.FC = () => {
    return (
        <>
            <header className={styles.title}>
                <Logo />
                <div className={styles.logoQuestionMark}>
                    <QuestionMark title={"Introduction"} text={fakemonData.Descriptions.Introduction} />
                </div>
            </header>
        </>
    );
};

export default Header;