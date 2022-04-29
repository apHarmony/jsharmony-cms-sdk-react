[jsharmony-cms-sdk-react](../README.md) / JshCms

# Class: JshCms

This is the root CMS root component that provides
the correct context to render CMS content.

This class must be an ancestor of all CMS content.
It should be near the root of the React application.

**`example`**
```tsx
<Application>
 <JshCms
   accessKeys={['key1']}
   pageFilesPath='/cms/'
   redirectListingPath='./jshcms_redirects.json'>
  <AppCode>....</AppCode>
 </JshCms>
</Application>
```

## Hierarchy

- `Component`<[`JshCmsProps`](../interfaces/JshCmsProps.md), `JshCmsState`\>

  ↳ **`JshCms`**
