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

export class JshCms extends React.Component<JshCmsProps, JshCmsState> {

  private readonly _contextData: JshCmsClientContextData;

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

  public override render(): React.ReactElement {
    return  (
      <JshCmsClientContext.Provider value={this._contextData}>
        {this.props.children}
      </JshCmsClientContext.Provider>
    )
  }
}

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

export interface JshCmsState {}
