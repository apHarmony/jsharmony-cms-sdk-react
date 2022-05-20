[jsharmony-cms-sdk-react](../README.md) / JshCmsContentProps

# Interface: JshCmsContentProps

## Table of contents

### Properties

- [cmsContentPath](JshCmsContentProps.md#cmscontentpath)
- [component](JshCmsContentProps.md#component)
- [html](JshCmsContentProps.md#html)
- [page](JshCmsContentProps.md#page)
- [published](JshCmsContentProps.md#published)

### Methods

- [onLinkActivate](JshCmsContentProps.md#onlinkactivate)

## Properties

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

## Methods

### onLinkActivate

▸ `Optional` **onLinkActivate**(`event`, `anchorElement`): `void`

The onLinkActivate function can be set for custom link
handling/router integration.

If integrating with the `react-router-dom@6` then
it is preferable to use the `JshCmsRoute` component
instead of the `JshCmsContent` component as it includes
default link handling for React Router. Alternatively, the
`JshCmsRouteLinkBinder` can be used to set the `onLinkActivate`
function with a handler that works with React Router.

Here is an example implementation

**`example`**
```ts
function handler(event, anchorElement) {
  event.preventDefault();
  const url = anchorElement.getAttribute('href');
  // myNavigator.navigate would provide custom router
  // logic to go to `url`.
  myNavigator.navigate(url);
}
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `Event` |
| `anchorElement` | `HTMLAnchorElement` |

#### Returns

`void`
