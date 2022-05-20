[jsharmony-cms-sdk-react](../README.md) / JshCmsRoute

# Class: JshCmsRoute

Render CMS content within the React Router.

This component Must have [JshCms](JshCms.md) component as an ancestor and be within
a React Router `BrowserRouter` context.

This will automatically bind CMS content links to navigate through the React Router,
as well as allow the CMS content path and component to be resolved based on the
current router path.

**`example`**
```tsx
 function R() {
   return (
     <BrowserRouter>
       <Routes>
         <Route path="/about" element={<About/>}></Route>
         <Route path="/introduction.html" element={
           <JshCmsRoute component={Introduction}/>
         }></Route>
         // Catch-all path that will dynamically resolve CMS content path and component
         <Route path="*" element={
           <JshCmsRoute path="*"
             component={resolveCatchAllComponent}
             cmsContentPath={resolveContentPath}/>
         }></Route>
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

 function resolveContentPath(location: Location): string {
   if (location.pathname === '/') return '/cms_overview.html';
   return location.pathname;
 }
```

## Hierarchy

- `Component`<[`JshCmsRouteProps`](../interfaces/JshCmsRouteProps.md), `never`\>

  ↳ **`JshCmsRoute`**
