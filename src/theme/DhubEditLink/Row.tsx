import React from 'react';
import DhubEditLink from './index';
import {useDhubEditUrl} from './useDhubEditUrl';
import styles from './styles.module.css';

/**
 * Standalone edit-link row, used only when the theme renders no edit slot of
 * its own — a site (or blog instance) with no `editUrl` configured never mounts
 * `EditThisPage`, so there is nothing for us to shadow.
 */
export default function DhubEditRow({
  source,
}: {
  source: string;
}): React.ReactNode {
  const target = useDhubEditUrl(source);
  if (!target) {
    return null;
  }
  return (
    <div className={styles.dhubEditRow}>
      <DhubEditLink href={target.href} label={target.label} />
    </div>
  );
}
