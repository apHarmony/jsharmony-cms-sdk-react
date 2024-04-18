[jsharmony-cms-sdk-react](../README.md) / JshCmsRouteProps

# Interface: JshCmsRouteProps

## Table of contents

### Properties

- [bindLinks](JshCmsRouteProps.md#bindlinks)
- [children](JshCmsRouteProps.md#children)
- [cmsContentPath](JshCmsRouteProps.md#cmscontentpath)
- [component](JshCmsRouteProps.md#component)
- [options](JshCmsRouteProps.md#options)

## Properties

### bindLinks

• `Optional` **bindLinks**: `boolean`

Set to true to convert anchor element to navigate using the React
Router instead of standard browser navigation.

This defaults to true. Must be explicitly set
to false to prevent link binding.

___

### children

• `Optional` **children**: `ReactElement`\<`any`, `string` \| `JSXElementConstructor`\<`any`\>\>

The children of this component.

___

### cmsContentPath

• `Optional` **cmsContentPath**: `string` \| (`location`: `Location`\<`unknown`\>) => `undefined` \| `string`

This sets the path of the CMS content to load.
E.g., '/about/team.html'.
This path will be combined with pageFilesPath set in JshCmsClient

This should not be confused with path.

If this is left empty then the current location.pathname will be used.

___

### component

• `Optional` **component**: `JSXElementConstructor`\<`unknown`\> \| (`templateName`: `string`, `contentPath`: `string`) => JSXElementConstructor\<unknown\> \| undefined

A component is required to load a dynamic page.
This can be left undefined for static HTML pages.

___

### options

• `Optional` **options**: PublishedContentOptions & (PublishedDynamicContentOptions \| PublishedStaticContentOptions)
