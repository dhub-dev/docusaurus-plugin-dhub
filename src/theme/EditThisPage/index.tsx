import React from 'react';
import OriginalEditThisPage from '@theme-init/EditThisPage';
import DhubEditLink from '../DhubEditLink';
import {useDhubSource} from '../DhubEditLink/context';
import {useDhubEditUrl} from '../DhubEditLink/useDhubEditUrl';

/**
 * Shadows the theme's edit link so that Dhub can take over (or share) the slot
 * the theme already lays out, rather than appending a second, unstyled link
 * below the footer.
 *
 * Falls through to the original component whenever we have nothing to offer —
 * outside docs/blog footers, on non-`@site/` sources, or with `editLink: false`
 * — so shadowing this component never costs the site its own edit link.
 */
export default function EditThisPage({
  editUrl,
}: {
  editUrl: string;
}): React.ReactNode {
  const source = useDhubSource();
  const target = useDhubEditUrl(source);

  if (!target) {
    return <OriginalEditThisPage editUrl={editUrl} />;
  }
  if (target.mode === 'replace') {
    return <DhubEditLink href={target.href} label={target.label} />;
  }
  return (
    <>
      <OriginalEditThisPage editUrl={editUrl} />
      <DhubEditLink href={target.href} label={target.label} spaced />
    </>
  );
}
