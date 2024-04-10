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
import { Location } from 'history';
import { NavigateFunction } from 'react-router-dom';

/**
 * Default link handler for React Router.
 * @public
 */
 export class JshCmsRouteLinkBinder {

  private readonly _location: Location;
  private readonly _navigate: NavigateFunction;

  public constructor(location: Location, navigate: NavigateFunction) {
    this._location = location;
    this._navigate = navigate;
  }

  public getHandler(): (event: Event, anchorElement: HTMLAnchorElement) => void {
    return (event: Event, anchorElement: HTMLAnchorElement) => {
      event.preventDefault();

      const linkPath = anchorElement.getAttribute('href') ?? '';
      if (linkPath.length < 1 || this.isPathWithProtocol(linkPath)) { return; }

      if (linkPath[0] === '#') {
        // React-router doesn't offer a good way
        // to handle this.
        // This will work okay but it doesn't restore
        // scroll in quite the same way as the browser does.
        // A more elaborate solution might be possible
        // using history replace state and saving the scroll position
        // and then restoring on navigation

        const anchorId = linkPath.slice(1);
        const anchorTargetEl = document.querySelector(`#${anchorId}`) ??
          document.querySelector(`[name="${anchorId}"]`);

        anchorTargetEl?.scrollIntoView(true);

        if (this._location.hash !== linkPath) {
          this._navigate(linkPath, { replace: false });
        }
      } else if (linkPath[0] === '/') {
        const newPath = linkPath;
        anchorElement.setAttribute('href', newPath);
        this._navigate(newPath, { replace: false });
      }

    };
  }

  private isPathWithProtocol(path: string): boolean {
    return /^[a-z]+:\//i.test(path);
  }
}
