[jsharmony-cms-sdk-react](../README.md) / PublishedDynamicContentOptions

# Interface: PublishedDynamicContentOptions

## Table of contents

### Methods

- [onAfterRenderData](PublishedDynamicContentOptions.md#onafterrenderdata)
- [onBeforeRenderData](PublishedDynamicContentOptions.md#onbeforerenderdata)
- [onSetCanonicalUrl](PublishedDynamicContentOptions.md#onsetcanonicalurl)
- [onSetMetaDescription](PublishedDynamicContentOptions.md#onsetmetadescription)
- [onSetMetaKeywords](PublishedDynamicContentOptions.md#onsetmetakeywords)
- [onSetTitle](PublishedDynamicContentOptions.md#onsettitle)

## Methods

### onAfterRenderData

▸ `Optional` **onAfterRenderData**(`element`): `void`

This function is called after rendering the page.
Can be used for various post-processing tasks.

#### Parameters

| Name | Type |
| :------ | :------ |
| `element` | ``null`` \| `HTMLDivElement` |

#### Returns

`void`

___

### onBeforeRenderData

▸ `Optional` **onBeforeRenderData**(`pageData`): [`JshCmsPage`](JshCmsPage.md)

This function is called before rendering the page.
Can be used for various pre-processing tasks.

#### Parameters

| Name | Type |
| :------ | :------ |
| `pageData` | [`JshCmsPage`](JshCmsPage.md) |

#### Returns

[`JshCmsPage`](JshCmsPage.md)

___

### onSetCanonicalUrl

▸ `Optional` **onSetCanonicalUrl**(`url`): `void`

Set this function to manually handle
canonical url changes. If not set
then the <link rel="canonical" href="canonical-url">
tag will be updated or added when
CMS content loads.

#### Parameters

| Name | Type |
| :------ | :------ |
| `url` | `string` |

#### Returns

`void`

___

### onSetMetaDescription

▸ `Optional` **onSetMetaDescription**(`description`): `void`

Set this function to manually handle
meta description changes. If not set
then the <meta name="description" content="">
header tag will be updated or added when
CMS content loads.

#### Parameters

| Name | Type |
| :------ | :------ |
| `description` | `string` |

#### Returns

`void`

___

### onSetMetaKeywords

▸ `Optional` **onSetMetaKeywords**(`keywords`): `void`

Set this function to manually handle
meta keywords changes. If not set
then the <meta name="keywords" content="">
header tag will be updated or added when
CMS content loads.

#### Parameters

| Name | Type |
| :------ | :------ |
| `keywords` | `string` |

#### Returns

`void`

___

### onSetTitle

▸ `Optional` **onSetTitle**(`title`): `void`

Set this function to manually handle
title changes. Otherwise the document
title will automatically be set when
the CMS content loads.

#### Parameters

| Name | Type |
| :------ | :------ |
| `title` | `string` |

#### Returns

`void`
