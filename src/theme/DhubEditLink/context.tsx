import React, {createContext, useContext, useMemo} from 'react';

/**
 * The source path of the page currently being rendered, in Docusaurus's
 * `@site/…` form.
 *
 * The theme's `EditThisPage` component receives only an `editUrl` prop, and is
 * rendered from both docs and blog footers — so it cannot call `useDoc()` or
 * `useBlogPost()` itself without knowing which context it is in. The footer
 * wrappers, which do know, publish the source here instead.
 */
const DhubSourceContext = createContext<string | null>(null);

export function DhubSourceProvider({
  source,
  children,
}: {
  source: string;
  children: React.ReactNode;
}): React.ReactNode {
  const value = useMemo(() => source, [source]);
  return (
    <DhubSourceContext.Provider value={value}>
      {children}
    </DhubSourceContext.Provider>
  );
}

/** Returns null outside a docs/blog footer, where we have no source to link. */
export function useDhubSource(): string | null {
  return useContext(DhubSourceContext);
}
