declare module '@theme-init/DocItem/Footer' {
  import type {ComponentType} from 'react';

  const Footer: ComponentType<object>;
  export default Footer;
}

declare module '@theme-init/BlogPostItem/Footer' {
  import type {ComponentType} from 'react';

  const Footer: ComponentType<object>;
  export default Footer;
}

declare module '@theme-init/EditThisPage' {
  import type {ComponentType} from 'react';

  const EditThisPage: ComponentType<{editUrl: string}>;
  export default EditThisPage;
}

declare module '@theme/Icon/Edit' {
  import type {ComponentProps, ComponentType} from 'react';

  const IconEdit: ComponentType<ComponentProps<'svg'>>;
  export default IconEdit;
}

declare module '@docusaurus/theme-common' {
  export const ThemeClassNames: {
    common: {editThisPage: string};
  };
}

declare module '@docusaurus/useGlobalData' {
  export function usePluginData(
    pluginName: string,
    pluginId?: string,
    options?: {failfast?: boolean},
  ): unknown;
}

declare module '*.module.css' {
  const classes: {readonly [key: string]: string};
  export default classes;
}
