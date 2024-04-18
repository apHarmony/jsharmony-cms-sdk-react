[jsharmony-cms-sdk-react](../README.md) / JshCmsPageConfigDefinition

# Interface: JshCmsPageConfigDefinition

## Table of contents

### Properties

- [content](JshCmsPageConfigDefinition.md#content)
- [content\_elements](JshCmsPageConfigDefinition.md#content_elements)
- [default\_content](JshCmsPageConfigDefinition.md#default_content)
- [options](JshCmsPageConfigDefinition.md#options)
- [properties](JshCmsPageConfigDefinition.md#properties)
- [title](JshCmsPageConfigDefinition.md#title)

## Properties

### content

• `Optional` **content**: `Object`

SYSTEM - Hard-coded content element content.

#### Index signature

▪ [content_area_name: `string`]: `string`

___

### content\_elements

• `Optional` **content\_elements**: `Object`

Each editable content area has one entry in
content_elements. If no content areas are defined,
a default content area named "body" will be added.

#### Index signature

▪ [content_area_name: `string`]: \{ `editor_toolbar?`: \{ `dock?`: ``"auto"`` \| ``"bottom"`` \| ``"top_offset"`` \| ``"top"`` ; `show_menu?`: `boolean` ; `show_toolbar?`: `boolean`  } ; `title?`: `string` ; `type?`: ``"htmleditor"`` \| ``"text"``  }

___

### default\_content

• `Optional` **default\_content**: `Object`

Default value for each content area.  If omitted,
the HTML content will be used.

#### Index signature

▪ [content_area_name: `string`]: `string`

___

### options

• `Optional` **options**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `dock?` | ``"bottom"`` \| ``"top_offset"`` \| ``"top"`` | Page toolbar dock position. Defaults to 'top_offset'. |
| `title_element_required?` | `boolean` | If set to false, no cms-title element required on the page. Defaults to true. |

___

### properties

• `Optional` **properties**: `Object`

Page Properties fields

#### Type declaration

| Name | Type |
| :------ | :------ |
| `fields` | `unknown`[] |

___

### title

• `Optional` **title**: `string`
