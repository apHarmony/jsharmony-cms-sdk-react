[jsharmony-cms-sdk-react](../README.md) / PublishedContentOptions

# Interface: PublishedContentOptions

## Table of contents

### Properties

- [loadingElement](PublishedContentOptions.md#loadingelement)
- [onLoadingChange](PublishedContentOptions.md#onloadingchange)
- [onPageNotFound](PublishedContentOptions.md#onpagenotfound)
- [pageNotFoundElement](PublishedContentOptions.md#pagenotfoundelement)

## Properties

### loadingElement

• `Optional` **loadingElement**: `ReactElement`\<`any`, `string` \| `JSXElementConstructor`\<`any`\>\>

If set then this will be rendered any time data is loading (while the CSM content is not rendered).

___

### onLoadingChange

• `Optional` **onLoadingChange**: (`loading`: `boolean`) => `void`

This is called when the loading status changes.
Can be used to integrate with loading indicators
or other loading logic.

#### Type declaration

▸ (`loading`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `loading` | `boolean` |

##### Returns

`void`

___

### onPageNotFound

• `Optional` **onPageNotFound**: (`path`: `string`) => `undefined` \| `string` \| [`JshCmsPage`](JshCmsPage.md)

This is called if the CMS content is not found.

#### Type declaration

▸ (`path`): `undefined` \| `string` \| [`JshCmsPage`](JshCmsPage.md)

##### Parameters

| Name | Type |
| :------ | :------ |
| `path` | `string` |

##### Returns

`undefined` \| `string` \| [`JshCmsPage`](JshCmsPage.md)

___

### pageNotFoundElement

• `Optional` **pageNotFoundElement**: `ReactElement`\<`any`, `string` \| `JSXElementConstructor`\<`any`\>\>

If set then this will be rendered when no data is found for a given path.
