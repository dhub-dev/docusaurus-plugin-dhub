import React from 'react';
import Footer from '@theme-init/DocItem/Footer';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import {DhubSourceProvider} from '../../DhubEditLink/context';
import DhubEditRow from '../../DhubEditLink/Row';

export default function FooterWrapper(props: object): React.ReactNode {
  const {metadata} = useDoc();
  return (
    <DhubSourceProvider source={metadata.source}>
      <Footer {...props} />
      {/* Without an editUrl the theme renders no edit slot for us to shadow. */}
      {!metadata.editUrl && <DhubEditRow source={metadata.source} />}
    </DhubSourceProvider>
  );
}
