import Image from 'next/image';
import styles from './header.module.scss';
import Logo from '../../../public/Logo.svg';

export default function Header(): JSX.Element {
  return (
    <header className={styles.container}>
      <img src="/logo.svg" alt="logo" />
    </header>
  );
}
