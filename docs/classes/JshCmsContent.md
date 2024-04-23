[jsharmony-cms-sdk-react](../README.md) / JshCmsContent

# Class: JshCmsContent

Load and render CMS content.

This component Must have [JshCms](JshCms.md) component as an ancestor.

See [JshCmsContentProps](../interfaces/JshCmsContentProps.md) for all render options.

**`Example`**

This example shows a standalone component:
```tsx
function Standalone() {
  // This is optional. Using React Router hooks to handle link binding.
  const navigate = useNavigate();
  const location = useLocation();

  return (
   <JshCmsContent bindLinks={{ navigate, location }}>
     <JshCmsPageConfig
       config={{
         content: {
           analytics: "<script cms-component='analytics' cms-component-remove-container></script>",
         }
       }}
     ></JshCmsPageConfig>
     <h1 cms-title="true" cms-onrender="showIf(page.properties.showTitle!='N');">Page Title</h1>
     <div cms-content-editor="page.content.body" cms-onrender="addClass(page.properties.containerClass); addStyle(page.properties.containerStyle);">Page Content</div>
   </JshCmsContent>
  );
}
```

**`Example`**

This example shows a dynamic page:
```tsx
function MyTemplate() {
   return (
     <div>
       <div cms-component='topmenu' cms-menu-tag="mainmenu" cms-component-remove-container="true" cms-component-content="page.content.topmenu"></div>
       <div cms-template="!two-column-page-object" cms-content-editor="page.content.body" cms-onrender="addClass(page.properties.containerClass); addStyle(page.properties.containerStyle);">Page Content</div>
     </div>
   );
}
// Render content edited at "./about/team.html" into
// the "MyTemplate" component
<JshCmsContent
   cmsContentPath="./about/team.html"
   component={MyTemplate}>
</JshCmsContent>
```

## Hierarchy

- `Component`\<[`JshCmsContentProps`](../interfaces/JshCmsContentProps.md), `JshCmsContentState`\>

  ↳ **`JshCmsContent`**
