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
import { JshCmsClient } from './jshCmsClient';
import { JshCmsClientContext, JshCmsClientContextData } from './jshCmsClientContext';

/**
 * This is the root CMS root component that provides
 * the correct context to render CMS content.
 *
 * This class must be an ancestor of all CMS content.
 * It should be near the root of the React application.
 *
 * @example
 * ```tsx
 * <Application>
 *  <JshCms
 *    accessKeys={['key1']}
 *    pageFilesPath='/cms/'
 *    redirectListingPath='./jshcms_redirects.json'>
 *   <AppCode>....</AppCode>
 *  </JshCms>
 * </Application>
 * ```
 * @public
 */
export class JshCms extends React.Component<JshCmsProps, JshCmsState> {

  private readonly _contextData: JshCmsClientContextData;

  /**
   * @internal
   */
  public constructor(props: JshCmsProps) {
    super(props);

    this._contextData = {
      cmsClient: new JshCmsClient({
        accessKeys: props.accessKeys ?? [''],
        pageFilesPath: props.pageFilesPath,
        redirectListingPath: props.redirectListingPath
      })
    };
  }

  /**
   * @internal
   */
  public override render(): React.ReactElement {
    return  (
      <JshCmsClientContext.Provider value={this._contextData}>
        {this.props.children}
      </JshCmsClientContext.Provider>
    )
  }
}

/**
 * @public
 */
export interface JshCmsProps {
  /**
   * CMS Editor Access Keys.
   * Not required for static HTML pages.
   * Required dynamic and standalone pages.
   */
  accessKeys?: string[];
  /** URL to page files. E.g. '/cms' */
  pageFilesPath: string;
  /** URL to redirect listing JSON file. E.g., 'jshcms_redirects.json' */
  redirectListingPath?: string;
}

/**
 * @internal
 */
export interface JshCmsState {}
