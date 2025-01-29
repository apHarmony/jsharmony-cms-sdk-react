/*!
Copyright 2022 apHarmony

This file is part of jsHarmony.

jsHarmony is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

jsHarmony is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with this package.  If not, see <http://www.gnu.org/licenses/>.
*/

import React from 'react';
import { JshCmsRouteHoc, JshCmsRouteProps } from './JshCmsRouteBase';

/**
 * Render CMS content within the React Router.
 *
 * This component Must have {@link JshCms} component as an ancestor and be within
 * a React Router `BrowserRouter` context.
 *
 * This will automatically bind CMS content links to navigate through the React Router,
 * as well as allow the CMS content path and component to be resolved based on the
 * current router path.
 *
 * @example
 * ```tsx
 *  function R() {
 *    return (
 *      <BrowserRouter>
 *        <Routes>
 *          <Route path="/about" element={<About/>}></Route>
 *          <Route path="/introduction.html" element={
 *            <JshCmsRoute component={Introduction}/>
 *          }></Route>
 *          // Catch-all path that will dynamically resolve CMS content path and component
 *          <Route path="*" element={
 *            <JshCmsRoute path="*"
 *              component={resolveCatchAllComponent}
 *              cmsContentPath={resolveContentPath}/>
 *          }></Route>
 *        </Routes>
 *      </BrowserRouter>
 *    );
 *  }
 *
 *  function Introduction() {
 *    return (
 *      <div cms-template="!two-column-page-object" cms-content-editor="page.content.body" cms-onrender="addClass(page.properties.containerClass); addStyle(page.properties.containerStyle);">Page Content</div>
 *    );
 *  }
 *
 *  function resolveCatchAllComponent(templateName, path) {
 *    if (templateName.length < 1) {
 *          return undefined;
 *    }
 *
 *    if (templateName.toLowerCase() === 'one-column-page-object') {
 *      return CmsPageObjectTemplate;
 *    } else if (templateName.toLowerCase() === 'two-column-page-object') {
 *      return CmsPageObjectTemplate;
 *    }
 *  }
 *
 *  function resolveContentPath(location: Location): string {
 *    if (location.pathname === '/') return '/cms_overview.html';
 *    return location.pathname;
 *  }
 * ```
 * @public
 */
export class JshCmsRoute extends React.Component<JshCmsRouteProps, never> {

  /**
   * @internal
   */
   public constructor(props: JshCmsRouteProps) {
    super(props);
  }

  /**
   * @internal
   */
  public override render(): React.ReactElement {

  // Dev note:
  // This setup is for generated documentation.
  //
  // JshCmsRouteHoc is just a React Router HOC using JshCmsRouteBase but
  // this makes the documentation confusing.
  //
  // Wrapping it in JshCmsRoute component make the docs
  // much more clean and understandable.

    return <JshCmsRouteHoc {...this.props}></JshCmsRouteHoc>
  }
}
