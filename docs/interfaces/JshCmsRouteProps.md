[jsharmony-cms-sdk-react](../README.md) / JshCmsRouteProps

# Interface: JshCmsRouteProps

## Table of contents

### Properties

- [bindLinks](JshCmsRouteProps.md#bindlinks)
- [cmsContentPath](JshCmsRouteProps.md#cmscontentpath)
- [component](JshCmsRouteProps.md#component)
- [exact](JshCmsRouteProps.md#exact)
- [options](JshCmsRouteProps.md#options)
- [path](JshCmsRouteProps.md#path)
- [sensitive](JshCmsRouteProps.md#sensitive)

## Properties

### bindLinks

• `Optional` **bindLinks**: `boolean`

Set to true to convert anchor element to navigate using the React
Router instead of standard browser navigation.

___

### cmsContentPath

• `Optional` **cmsContentPath**: `string` \| (`location`: `Location`<`unknown`\>) => `undefined` \| `string`

This sets the path of the CMS content to load.
E.g., '/about/team.html'.
This path will be combined with pageFilesPath set in JshCmsClient

This should not be confused with path.

If this is left empty then the current location.pathname will be used.

___

### component

• `Optional` **component**: `JSXElementConstructor`<`unknown`\> \| (`templateName`: `string`, `contentPath`: `string`) => `undefined` \| `JSXElementConstructor`<`unknown`\>

A component is required to load a dynamic page.
This can be left undefined for static HTML pages.

___

### exact

• `Optional` **exact**: `boolean`

When true, will only match if the path matches the location.pathname exactly.

**`see`** [https://v5.reactrouter.com/web/api/Redirect/exact-bool](https://v5.reactrouter.com/web/api/Redirect/exact-bool)

___

### options

• `Optional` **options**: [`PublishedContentOptions`](PublishedContentOptions.md) & [`PublishedDynamicContentOptions`](PublishedDynamicContentOptions.md) & [`PublishedContentOptions`](PublishedContentOptions.md) & [`PublishedStaticContentOptions`](PublishedStaticContentOptions.md)

___

### path

• `Optional` **path**: `string` \| `string`[]

Any valid URL path or array of paths that path-to-regexp\@^1.7.0 understands.
If the current window location path matches this path then this component will be
rendered.

This should not be confused with cmsContentPath.

Routes without a path always match. Use  '*' for catchall.

**`see`** [https://v5.reactrouter.com/web/api/Route/path-string-string](https://v5.reactrouter.com/web/api/Route/path-string-string)

___

### sensitive

• `Optional` **sensitive**: `boolean`

Match is case sensitive

**`see`** [https://v5.reactrouter.com/web/api/Redirect/sensitive-bool](https://v5.reactrouter.com/web/api/Redirect/sensitive-bool)
