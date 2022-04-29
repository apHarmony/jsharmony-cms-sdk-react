[jsharmony-cms-sdk-react](../README.md) / PublishedContentOptions

# Interface: PublishedContentOptions

## Table of contents

### Properties

- [loadingElement](PublishedContentOptions.md#loadingelement)
- [pageNotFoundElement](PublishedContentOptions.md#pagenotfoundelement)

### Methods

- [onLoadingChange](PublishedContentOptions.md#onloadingchange)
- [onPageNotFound](PublishedContentOptions.md#onpagenotfound)

## Properties

### loadingElement

• `Optional` **loadingElement**: `ReactElement`<`any`, `string` \| `JSXElementConstructor`<`any`\>\>

If set then this will be rendered any time data is loading (while the CSM content is not rendered).

___

### pageNotFoundElement

• `Optional` **pageNotFoundElement**: `ReactElement`<`any`, `string` \| `JSXElementConstructor`<`any`\>\>

If set then this will be rendered when no data is found for a given path.

## Methods

### onLoadingChange

▸ `Optional` **onLoadingChange**(`loading`): `void`

This is called when the loading status changes.
Can be used to integrate with loading indicators
or other loading logic.

#### Parameters

| Name | Type |
| :------ | :------ |
| `loading` | `boolean` |

#### Returns

`void`

___

### onPageNotFound

▸ `Optional` **onPageNotFound**(`path`): `void`

This is called if the CMS content is not found.

#### Parameters

| Name | Type |
| :------ | :------ |
| `path` | `string` |

#### Returns

`void`
