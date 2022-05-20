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
import React from 'react';
import { Navigate, NavigateFunction, Params, useLocation, useNavigate, useParams } from 'react-router-dom';
import { IframeWrapper } from '../iframeWrapper';
import { InternalPassthrough } from '../internalPassthrough';
import { JshCmsClientContext } from '../jshCmsClientContext';
import { JshCmsContent, PublishedContentOptions } from '../JshCmsContent';
import { PublishedDynamicContentOptions } from '../outlets/dynamic-outlet/JshCmsDynamicPublishOutlet';
import { PublishedStaticContentOptions } from '../outlets/JshCmsStaticOutlet';
import { JshCmsRouteLinkBinder } from './jshCmsRouteLinkBinder';
export { History, Location } from 'history';

export class JshCmsRouteBase extends React.Component<JshCmsRouteBaseProps, JshCmsRouteState> {

  declare public context: React.ContextType<typeof JshCmsClientContext> | undefined;
  public static override contextType = JshCmsClientContext;

  private _abortRedirectDataLoading: (() => void) | undefined;

  public constructor(props: JshCmsRouteBaseProps) {
    super(props);
    this.state = {};
  }

  public override componentDidMount(): void {
    this.startResolvePath();
  }

  public override componentWillUnmount(): void {
    this._abortRedirectDataLoading?.();
  }

  public override componentDidUpdate(prevProps: Readonly<JshCmsRouteBaseProps>, prevState: Readonly<JshCmsRouteState>): void {

    const isLoading = this.isLoading(this.state);
    const wasLoading = this.isLoading(prevState);
    if (isLoading !== wasLoading) {
      this.props.options?.onLoadingChange?.(isLoading);
    }

    const pathChanged = prevProps.router.location.pathname !== this.props.router.location.pathname;
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
        return <Navigate to={this.state.resolvedCmsPath.path} replace></Navigate>
      case 'internalTerminal': // Fallthrough
      case 'internalPassthrough': {

        const publishOptions = { ...(this.props.options ?? {}) };
        publishOptions.onLoadingChange = loading => this.setState({ loadingPageData: loading });

        let linkActivateHandler: ((event: Event, el: HTMLAnchorElement) => void) | undefined;
        if (this.props.bindLinks !== false) {
          // bindLinks must EXPLICITLY be false
          // in order to skip binding.
          linkActivateHandler = new JshCmsRouteLinkBinder(this.props.router.location, this.props.router.navigate).getHandler();
        }

        const cmsContentElement = (
          <JshCmsContent
            onLinkActivate={linkActivateHandler}
            component={this.props.component}
            cmsContentPath={this.state.resolvedCmsPath.path}
            published={publishOptions}
            children={this.props.children}/>
        );

        let innerElement: React.ReactElement;
        if (this.state.resolvedCmsPath.type === 'internalPassthrough') {
          innerElement = (
            <InternalPassthrough resolvedCmsPath={this.state.resolvedCmsPath.path}>
              {cmsContentElement}
            </InternalPassthrough>
          );
        } else {
          innerElement = cmsContentElement;
        }

        return innerElement;
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
        cmsContentPath = this.props.cmsContentPath(this.props.router.location) ?? '';
      } else if (typeof this.props.cmsContentPath === 'string') {
        cmsContentPath = this.props.cmsContentPath;
      }

      if (cmsContentPath.length < 1) {
        cmsContentPath = this.props.router.location.pathname;
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

interface JshCmsRouteBaseProps extends JshCmsRouteProps {
  router: {
    location: Location;
    navigate: NavigateFunction;
    params: Readonly<Params<string>>
  }
}

/**
 * @public
 */
export interface JshCmsRouteProps {
  /**
   * Set to true to convert anchor element to navigate using the React
   * Router instead of standard browser navigation.
   *
   * This defaults to true. Must be explicitly set
   * to false to prevent link binding.
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
  options?: PublishedContentOptions & (PublishedDynamicContentOptions | PublishedStaticContentOptions);
}


export interface JshCmsRouteState {
  resolvedCmsPath?: ResolvedPath;
  loadingRedirectData?: boolean;
  loadingPageData?: boolean;
}

export interface ResolvedPath {
  path: string;
  type:
    'iframe' |
    'internalPassthrough' |
    'internalRedirect' |
    'internalTerminal';
}

// eslint-disable-next-line @typescript-eslint/ban-types
function withRouter<T>(Component: Function) {
  function ComponentWithRouterProps(props: T) {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();
    return (
      <Component {...props} router={{ location, navigate, params }}></Component>
    );
  }

  return ComponentWithRouterProps;
}

export const JshCmsRouteHoc = withRouter<JshCmsRouteProps>(JshCmsRouteBase);
