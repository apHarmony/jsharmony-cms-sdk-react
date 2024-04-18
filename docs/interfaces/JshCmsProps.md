[jsharmony-cms-sdk-react](../README.md) / JshCmsProps

# Interface: JshCmsProps

## Table of contents

### Properties

- [accessKeys](JshCmsProps.md#accesskeys)
- [children](JshCmsProps.md#children)
- [pageFilesPath](JshCmsProps.md#pagefilespath)
- [redirectListingPath](JshCmsProps.md#redirectlistingpath)

## Properties

### accessKeys

• `Optional` **accessKeys**: `string`[]

CMS Editor Access Keys.
Not required for static HTML pages.
Required dynamic and standalone pages.

___

### children

• **children**: `ReactElement`\<`any`, `string` \| `JSXElementConstructor`\<`any`\>\>

The children of this component.

___

### pageFilesPath

• **pageFilesPath**: `string`

URL to page files. E.g. '/cms'

___

### redirectListingPath

• `Optional` **redirectListingPath**: `string`

URL to redirect listing JSON file. E.g., 'jshcms_redirects.json'
