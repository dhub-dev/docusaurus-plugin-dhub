import React from 'react';
import {ThemeClassNames} from '@docusaurus/theme-common';
import IconEdit from '@theme/Icon/Edit';
import styles from './styles.module.css';

/**
 * The "Edit in Dhub" link itself.
 *
 * Deliberately mirrors the theme's own `EditThisPage` markup — same semantic
 * class, same edit icon — so that it inherits site styling and sits flush with
 * the native link when both are shown.
 */
export default function DhubEditLink({
  href,
  label,
  spaced = false,
}: {
  href: string;
  label: string;
  /** Adds leading separation when rendered next to the theme's own link. */
  spaced?: boolean;
}): React.ReactNode {
  return (
    <a
      className={`${ThemeClassNames.common.editThisPage} dhub-edit-link${
        spaced ? ` ${styles.spaced}` : ''
      }`}
      href={href}
      target="_blank"
      rel="noopener noreferrer">
      <IconEdit />
      {label}
    </a>
  );
}
