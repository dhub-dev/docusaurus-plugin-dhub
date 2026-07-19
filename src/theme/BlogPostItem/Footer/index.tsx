import React from 'react';
import Footer from '@theme-init/BlogPostItem/Footer';
import {useBlogPost} from '@docusaurus/plugin-content-blog/client';
import {DhubSourceProvider} from '../../DhubEditLink/context';
import DhubEditRow from '../../DhubEditLink/Row';

export default function FooterWrapper(props: object): React.ReactNode {
  const {metadata, isBlogPostPage} = useBlogPost();
  if (!isBlogPostPage) {
    return <Footer {...props} />;
  }
  return (
    <DhubSourceProvider source={metadata.source}>
      <Footer {...props} />
      {/* Without an editUrl the theme renders no edit slot for us to shadow. */}
      {!metadata.editUrl && <DhubEditRow source={metadata.source} />}
    </DhubSourceProvider>
  );
}
