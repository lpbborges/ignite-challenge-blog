import Image from 'next/image';

import commonStyles from '../../styles/common.module.scss';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={commonStyles.wrapper}>
      <div className={styles.container}>
        <Image
          src="/images/Logo.svg"
          alt="spacetraveling"
          width={238}
          height={25}
        />
      </div>
    </header>
  );
}
