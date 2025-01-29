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

import * as React from 'react';

/**
 * @internal
 */
export class InternalPassthrough  extends React.Component<InternalPassthroughProps, never> {

  public static getNearestPassthroughPath(element: HTMLElement | null | undefined): string | undefined {

    const passThroughElement = element?.closest('[data-internal-passthrough-path]');
    const value = passThroughElement?.getAttribute('data-internal-passthrough-path') ?? '';

    return value.length > 0 ? value : undefined;
  }

  public override render(): React.ReactElement {
    return (
      <div data-internal-passthrough-path={this.props.resolvedCmsPath}>
        {this.props.children}
      </div>
    );
  }
}

/**
 * @internal
 */
export interface InternalPassthroughProps {
  resolvedCmsPath: string;
  children?: React.ReactElement | React.ReactElement[];
}
