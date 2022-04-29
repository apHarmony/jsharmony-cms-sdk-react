[jsharmony-cms-sdk-react](../README.md) / JshCmsRoute

# Class: JshCmsRoute

Render CMS content within the React Router.
This component is used in the same way as the
[React Router Route](https://v5.reactrouter.com/web/api/Route) component
except it loads and renders CMS content when the path matches.

This component Must have [JshCms](JshCms.md) component as an ancestor.

**`example`**
```tsx
 function R() {
   return (
     <BrowserRouter>
       <Switch>
         <Route path="/about"><About /></Route>
         <JshCmsRoute path="/introduction.html" component={Introduction}></JshCmsRoute>
         <JshCmsRoute path="*"
           component={resolveCatchAllComponent}
           cmsContentPath={resolveContentPath}
           bindLinks={true}/>
       </Switch>
     </BrowserRouter>
   );
 }

 function Introduction() {
   return (
     <div cms-template="!two-column-page-object" cms-content-editor="page.content.body" cms-onrender="addClass(page.properties.containerClass); addStyle(page.properties.containerStyle);">Page Content</div>
   );
 }

 function resolveCatchAllComponent(templateName, path) {
   if (templateName.length < 1) {
         return undefined;
   }

   if (templateName.toLowerCase() === 'one-column-page-object') {
     return CmsPageObjectTemplate;
   } else if (templateName.toLowerCase() === 'two-column-page-object') {
     return CmsPageObjectTemplate;
   }
 }

 function resolveContentPath(location: Location<unknown>): string {
   if (location.pathname === '/') return '/cms_overview.html';
   return location.pathname;
 }
```

## Hierarchy

- `Component`<[`JshCmsRouteProps`](../interfaces/JshCmsRouteProps.md), `never`\>

  ↳ **`JshCmsRoute`**
