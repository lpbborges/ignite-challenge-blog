import Image from 'next/image';
import Link from 'next/link';

import commonStyles from '../../styles/common.module.scss';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={commonStyles.wrapper}>
      <Link href="/">
        <a className={styles.container}>
          <Image src="/images/Logo.svg" alt="logo" width={238} height={25} />
        </a>
      </Link>
    </header>
  );
}
