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

export class IframeWrapper extends React.Component<IframeWrapperProps, IframeWrapperState> {

  public override render(): React.ReactElement {

    const style: React.CSSProperties = {
      border: 0,
      height: '100%',
      outline: 'none',
      position: 'relative',
      width: '100%'
    }

    return <iframe src={this.props.src} style={style}/>;
  }
}

export interface IframeWrapperProps {
  src: string;
}

export interface IframeWrapperState {}
