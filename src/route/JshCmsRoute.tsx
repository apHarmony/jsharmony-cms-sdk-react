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

import { History, Location } from 'history';
import React from 'react';
import { Redirect, Route, RouteComponentProps, withRouter } from 'react-router-dom';
import { IframeWrapper } from '../iframeWrapper';
import { JshCmsClientContext } from '../jshCmsClientContext';
import { JshCmsContent, PublishedContentOptions } from '../JshCmsContent';
import { PublishedDynamicContentOptions } from '../outlets/dynamic-outlet/JshCmsDynamicPublishOutlet';
import { PublishedStaticContentOptions } from '../outlets/JshCmsStaticOutlet';

export { History, Location } from 'history';

class JshCmsRouteBase extends React.Component<JshCmsRouteProps, JshCmsRouteState> {

  declare public context: React.ContextType<typeof JshCmsClientContext> | undefined;
  public static override contextType = JshCmsClientContext;

  private _abortRedirectDataLoading: (() => void) | undefined;

  public constructor(props: JshCmsRouteProps) {
    super(props);
    this.state = {};
  }

  public override componentDidMount(): void {
    this.startResolvePath();
  }

  public override componentWillUnmount(): void {
    this._abortRedirectDataLoading?.();
  }

  public override componentDidUpdate(prevProps: Readonly<JshCmsRouteProps>, prevState: Readonly<JshCmsRouteState>): void {

    const isLoading = this.isLoading(this.state);
    const wasLoading = this.isLoading(prevState);
    if (isLoading !== wasLoading) {
      this.props.options?.onLoadingChange?.(isLoading);
    }

    const pathChanged = prevProps.location.pathname !== this.props.location.pathname;
    if (pathChanged) {
      this.startResolvePath();
    }
  }

  public override render(): React.ReactElement {

    if (this.context == null) {
      this.warnMissingContext('Rendering element');
      return <></>;
    }

    if (this.state.loadingRedirectData) {
      return this.props.options?.loadingElement ?? <></>;
    }

    if (this.state.resolvedCmsPath == null) {
      return <></>;
    }

    switch (this.state.resolvedCmsPath.type) {
      case 'iframe':
        return <IframeWrapper src={this.state.resolvedCmsPath.path}></IframeWrapper>
      case 'internalRedirect':
        return <Redirect to={this.state.resolvedCmsPath.path}></Redirect>;
      case 'internalTerminal': // Fallthrough
      case 'internalPassthrough': {

        const publishOptions = { ...(this.props.options ?? {}) };
        publishOptions.onLoadingChange = loading => this.setState({ loadingPageData: loading });

        let childBindLinks: { history: History; location: Location<unknown>; } | undefined;
        if (this.props.bindLinks) {
          childBindLinks = { history: this.props.history, location: this.props.location }
        }

        return (
          <Route path={this.props.path} exact={this.props.exact} sensitive={this.props.sensitive}>
            <JshCmsContent
              bindLinks={childBindLinks}
              component={this.props.component}
              cmsContentPath={this.state.resolvedCmsPath.path}
              published={publishOptions}
              children={this.props.children}/>
          </Route>
        );
      }
      default:
        throw new Error(`Unknown path type: ${this.state.resolvedCmsPath?.type ?? ''}`); // eslint-disable-line @typescript-eslint/restrict-template-expressions
    }
  }

  private isLoading(state: Readonly<JshCmsRouteState>): boolean {
    return (state.loadingPageData || state.loadingRedirectData) === true;
  }

  private isPathWithProtocol(path: string): boolean {
    return /^[a-z]+:\//i.test(path);
  }

  private startResolvePath(): void {

    this._abortRedirectDataLoading?.();
    this.setState({
      loadingPageData: false,
      loadingRedirectData: true,
      resolvedCmsPath: undefined
    });

    if (this.context == null) {
      this.warnMissingContext('Resolve CMS path');
      return;
    }

    const cmsClient = this.context.cmsClient;

    const abortable = this.context?.cmsClient.getRedirectData();
    this._abortRedirectDataLoading = () => {
      abortable?.abort();
      this._abortRedirectDataLoading = undefined;
    };

    abortable.exec().then(data => {
      let cmsContentPath: string = '';
      if (typeof this.props.cmsContentPath === 'function') {
        cmsContentPath = this.props.cmsContentPath(this.props.location) ?? '';
      } else if (typeof this.props.cmsContentPath === 'string') {
        cmsContentPath = this.props.cmsContentPath;
      }

      if (cmsContentPath.length < 1) {
        cmsContentPath = this.props.location.pathname;
      }

      const redirect = cmsClient.resolveRedirect(data ?? [], cmsContentPath);
      let resolvedPath: ResolvedPath;
      if (redirect == null) {
        resolvedPath = {
          path: cmsContentPath,
          type: 'internalTerminal'
        };
      } else if (this.isPathWithProtocol(redirect.url)) {
        if (redirect.http_code === 'PASSTHRU') {
          resolvedPath = {
            path: redirect.url,
            type: 'iframe'
          };
        } else {
          // External redirect.
          window.location.replace(redirect.url);
          return;
        }
      } else {
        if (redirect.http_code === 'PASSTHRU') {
          resolvedPath = {
            path: redirect.url,
            type: 'internalPassthrough'
          };
        } else {
          resolvedPath = {
            path: redirect.url,
            type: 'internalRedirect'
          };
        }
      }

      this.setState({
        loadingRedirectData: false,
        resolvedCmsPath: resolvedPath
      });
    })
    .catch(error => console.error(error));
  }

  private warnMissingContext(taskDescription: string): void {
    console.warn(new Error(`Failed: ${taskDescription} - Missing JshCmsClientContext`));
  }
}

export interface JshCmsRouteProps extends RouteComponentProps {
  /**
   * Set to true to convert anchor element to navigate using the React
   * Router instead of standard browser navigation.
   */
  bindLinks?: boolean;
  /**
   * This sets the path of the CMS content to load.
   * E.g., '/about/team.html'.
   * This path will be combined with pageFilesPath set in JshCmsClient
   *
   * This should not be confused with path.
   *
   * If this is left empty then the current location.pathname will be used.
   */
  cmsContentPath?: string | ((location: Location) => string | undefined);
  /**
   * A component is required to load a dynamic page.
   * This can be left undefined for static HTML pages.
   */
  component?:
    React.JSXElementConstructor<unknown>
    | ((templateName: string, contentPath: string) => React.JSXElementConstructor<unknown> | undefined);
  /**
   * When true, will only match if the path matches the location.pathname exactly.
   * @see {@link https://v5.reactrouter.com/web/api/Redirect/exact-bool}
   */
  exact?: boolean;
  options?: PublishedContentOptions & (PublishedDynamicContentOptions | PublishedStaticContentOptions);
  /**
   * Any valid URL path or array of paths that path-to-regexp@^1.7.0 understands.
   * If the current window location path matches this path then this component will be
   * rendered.
   *
   * This should not be confused with cmsContentPath.
   *
   * Routes without a path always match. Use  '*' for catchall.
   * @see {@link https://v5.reactrouter.com/web/api/Route/path-string-string}
   */
  path?: string[] | string;
  /**
   * Match is case sensitive
   * @see {@link https://v5.reactrouter.com/web/api/Redirect/sensitive-bool}
   */
  sensitive?: boolean;
}

interface JshCmsRouteState {
  resolvedCmsPath?: ResolvedPath;
  loadingRedirectData?: boolean;
  loadingPageData?: boolean;
}

interface ResolvedPath {
  path: string;
  type:
    'iframe' |
    'internalPassthrough' |
    'internalRedirect' |
    'internalTerminal';
}

export const JshCmsRoute = withRouter(JshCmsRouteBase);
