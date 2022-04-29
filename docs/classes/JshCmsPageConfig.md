[jsharmony-cms-sdk-react](../README.md) / JshCmsPageConfig

# Class: JshCmsPageConfig

This component is used to set the [cms-page-config](https://www.jsharmonycms.com/resources/documentation/page-templates/reference-cms-page-config/)
for a template.

Use within a [JshCmsContent](JshCmsContent.md) component.

**`example`**
```tsx
function Standalone() {
  return (
   <JshCmsContent>
     <JshCmsPageConfig
       config={{
         content: {
           analytics: "<script cms-component='analytics' cms-component-remove-container><\/script>",
         }
       }}
     ></JshCmsPageConfig>
     <h1 cms-title="true" cms-onrender="showIf(page.properties.showTitle!='N');">Page Title</h1>
     <div cms-content-editor="page.content.body" cms-onrender="addClass(page.properties.containerClass); addStyle(page.properties.containerStyle);">Page Content</div>
   </JshCmsContent>
  );
}
```

## Hierarchy

- `Component`<[`JshCmsPageConfigProps`](../interfaces/JshCmsPageConfigProps.md), `never`\>

  ↳ **`JshCmsPageConfig`**
