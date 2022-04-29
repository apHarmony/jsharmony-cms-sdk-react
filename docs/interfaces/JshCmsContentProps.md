[jsharmony-cms-sdk-react](../README.md) / JshCmsContentProps

# Interface: JshCmsContentProps

## Table of contents

### Properties

- [bindLinks](JshCmsContentProps.md#bindlinks)
- [cmsContentPath](JshCmsContentProps.md#cmscontentpath)
- [component](JshCmsContentProps.md#component)
- [html](JshCmsContentProps.md#html)
- [page](JshCmsContentProps.md#page)
- [published](JshCmsContentProps.md#published)

## Properties

### bindLinks

• `Optional` **bindLinks**: `Object`

Set this using the React Router History and Location
objects if links should be navigated using React Router.
The history and location objects can be retrieved from the React Router
using either the `useHistory` and `useLocation` hooks, or the `withRouter`
higher-order component.

See [https://v5.reactrouter.com/web/api/withRouter](https://v5.reactrouter.com/web/api/withRouter)
See [https://v5.reactrouter.com/web/api/Hooks/usehistory](https://v5.reactrouter.com/web/api/Hooks/usehistory)
See [https://v5.reactrouter.com/web/api/Hooks/uselocation](https://v5.reactrouter.com/web/api/Hooks/uselocation)

#### Type declaration

| Name | Type |
| :------ | :------ |
| `history` | `History`<`unknown`\> |
| `location` | `Location`<`unknown`\> |

___

### cmsContentPath

• `Optional` **cmsContentPath**: `string`

CMS relative path to the content to load.
The path should match the page path configured in the CMS.
E.g., '/about/team.html'.

The path will be combined with pageFilesPath set in JshCmsClient.

If the path is empty, then the current URL path will be used.
Empty paths will work only when the application paths are setup
to match the CMS content paths.

This does not apply to the editor.
Do not set if setting the page property or
the html property.

___

### component

• `Optional` **component**: `JSXElementConstructor`<`unknown`\> \| (`templateName`: `string`, `contentPath`: `string`) => `undefined` \| `JSXElementConstructor`<`unknown`\>

A component is required to load a dynamic page.
This can be left undefined for static HTML pages.

___

### html

• `Optional` **html**: `string`

Render the static HTML instead of loading it.

This does not apply to the editor.
Do no set if setting the cmsContentPath or
the page property

___

### page

• `Optional` **page**: [`JshCmsPage`](JshCmsPage.md)

Render the data defined by the page instead of loading it.

This does not apply to the editor.
Do no set if setting the cmsContentPath or
the html property

___

### published

• `Optional` **published**: [`PublishedContentOptions`](PublishedContentOptions.md) & [`PublishedDynamicContentOptions`](PublishedDynamicContentOptions.md) & [`PublishedContentOptions`](PublishedContentOptions.md) & [`PublishedStaticContentOptions`](PublishedStaticContentOptions.md)

Set additional options depending on if rendering dynamic or static content.
