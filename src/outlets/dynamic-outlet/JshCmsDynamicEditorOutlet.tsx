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
import { JshCmsClientContext } from '../../jshCmsClientContext';

export class JshCmsDynamicEditorOutlet extends React.Component<JshCmsDynamicEditorOutletProps, JshCmsDynamicEditorOutletState> {

  declare public context: React.ContextType<typeof JshCmsClientContext> | undefined;
  public static override contextType = JshCmsClientContext;

  private static _outletCount: number = 0;

  public constructor(props: JshCmsDynamicEditorOutletProps) {
    super(props);
    this.state = {};
  }

  public override componentDidMount(): void {

    JshCmsDynamicEditorOutlet._outletCount++;
    if (JshCmsDynamicEditorOutlet._outletCount > 1) {
      throw new Error(
        'There must only be a single JshCmsDynamicEditorOutlet rendered at any time when editing CMS content. ' +
        `Currently there are ${JshCmsDynamicEditorOutlet._outletCount} being rendered.`
      );
    }

    this.setState({ componentFactory: this.props.componentFactory });
  }

  public override componentDidUpdate(prevProps: Readonly<JshCmsDynamicEditorOutletProps>, prevState: Readonly<JshCmsDynamicEditorOutletState>): void {
    // This pattern just ensures that we render the component before
    // initializing the editor and we only initialize the editor
    // after the first render.
    if (this.state.componentFactory != null && prevState.componentFactory == null) {
      this.context?.cmsClient.initializeEditor();
    }
  }

  public override componentWillUnmount(): void {
    JshCmsDynamicEditorOutlet._outletCount--;
  }

  public override render(): React.ReactElement {
    if (this.state.componentFactory == null) {
      return <></>;
    }

    return (
      <div>
        {/* { React.createElement(this.state.component, {}) } */}
        { this.state.componentFactory() }
      </div>
    );
  }
}

export interface JshCmsDynamicEditorOutletProps {
  componentFactory: () => React.ReactElement<unknown>;
}

export interface JshCmsDynamicEditorOutletState {
  componentFactory?: () => React.ReactElement;
}
