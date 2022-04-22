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
import { InternalPassthrough } from './InternalPassthrough';
import { JshCmsClientContext } from './jshCmsClientContext';
import { JshCmsDynamicEditorOutlet } from './outlets/dynamic-outlet/JshCmsDynamicEditorOutlet';
import { JshCmsDynamicPublishOutlet, JshCmsPage, PublishedDynamicContentOptions } from './outlets/dynamic-outlet/JshCmsDynamicPublishOutlet';
import { JshCmsStaticOutlet, PublishedStaticContentOptions } from './outlets/JshCmsStaticOutlet';

/**
 * Load and render CMS content.
 *
 * This component Must have {@link JshCms} component as an ancestor.
 *
 * See {@link JshCmsContentProps} for all render options.
 *
 * @example
 * This example shows a standalone component:
 * ```tsx
 * function Standalone() {
 *   // This is optional. Using React Router hooks to handle link binding.
 *   const history = useHistory();
 *   const location = useLocation();
 *
 *   return (
 *    <JshCmsContent bindLinks={{ history, location }}>
 *      <JshCmsPageConfig
 *        config={{
 *          content: {
 *            analytics: "<script cms-component='analytics' cms-component-remove-container><\/script>",
 *          }
 *        }}
 *      ></JshCmsPageConfig>
 *      <h1 cms-title="true" cms-onrender="showIf(page.properties.showTitle!='N');">Page Title</h1>
 *      <div cms-content-editor="page.content.body" cms-onrender="addClass(page.properties.containerClass); addStyle(page.properties.containerStyle);">Page Content</div>
 *    </JshCmsContent>
 *   );
 * }
 * ```
 *
 * @example
 * This example shows a dynamic page:
 * ```tsx
 * function MyTemplate() {
 *    return (
 *      <div>
 *        <div cms-component='topmenu' cms-menu-tag="mainmenu" cms-component-remove-container="true" cms-component-content="page.content.topmenu"></div>
 *        <div cms-template="!two-column-page-object" cms-content-editor="page.content.body" cms-onrender="addClass(page.properties.containerClass); addStyle(page.properties.containerStyle);">Page Content</div>
 *      </div>
 *    );
 * }
 * // Render content edited at "./about/team.html" into
 * // the "MyTemplate" component
 * <JshCmsContent
 *    cmsContentPath="./about/team.html"
 *    component={MyTemplate}>
 * </JshCmsContent>
 * ```
 *
 * @public
 */
export class JshCmsContent extends React.Component<JshCmsContentProps, JshCmsContentState> {

  /**
   * @internal
   */
  declare public context: React.ContextType<typeof JshCmsClientContext> | undefined;
  /**
   * @internal
   */
  public static override contextType = JshCmsClientContext;

  private _abortPageLoad: (() => void) | undefined;
  private _removeLinkEvenHandlers: (() => void)[] = [];
  private _ref = React.createRef<HTMLDivElement>();

  /**
   * @internal
   */
  public constructor(props: JshCmsContentProps) {
    super(props);

    this.state = {
      renderType: 'notSet'
    };
  }

  /**
   * @internal
   */
   public override componentDidMount(): void {

    if (this.context == null) {
      throw new Error('JshCmsClientContext was not provided.');
    }

    const renderType = this.context?.cmsClient.isInEditor() ? 'editor' : 'publish';
    this.setState({ renderType });

    if (renderType === 'editor') {
      const templateId = this.context?.cmsClient.getEditorTemplateId() ?? '';
      const componentFactory = this.getComponentFactory(templateId, window.location.pathname);

      if (componentFactory == null) {
        throw new Error(
          'A component is required for the CMS editor. ' +
          'Ensure the the  "component" property is set with a valid JSXElementConstructor or function ((templateName: string, contentPath: string) => JSXElementConstructor).'
        );
      }
      this.setState({ componentFactory });
    }

    if (renderType === 'publish') {
      this.loadContent(this.getCmsPath(this.props.cmsContentPath));
    }
  }

  /**
   * @internal
   */
   public override componentDidUpdate(prevProps: Readonly<JshCmsContentProps>, prevState: Readonly<JshCmsContentState>): void {
    if (prevState.loading !== this.state.loading && this.state.renderType === 'publish') {
      this.props.published?.onLoadingChange?.(this.state.loading === true)
    }

    if (this.state.renderType === 'publish') {
      const pathChanged = prevProps.cmsContentPath !== this.props.cmsContentPath;
      if (pathChanged) { this.loadContent(this.getCmsPath(this.props.cmsContentPath)); }
    }
  }

  /**
   * @internal
   */
   public override componentWillUnmount(): void {
    this._abortPageLoad?.();
  }

  /**
   * @internal
   */
   public override render(): React.ReactElement {
    switch (this.state.renderType) {
      case 'notSet':
        return <div style={{display: 'none'}} ref={this._ref}></div>
      case 'editor':
        return this.renderEditor();
      case 'publish':
        return this.renderPublish();
      default:
        throw new Error(`unhandled render type ${this.state.renderType as string}`);
    }
  }

  private afterRenderData(element: HTMLDivElement | null): void {

    if (element == null) { return; }

    if (this.props.bindLinks != null) {
      this._removeLinkEvenHandlers.forEach(f => f());
      this._removeLinkEvenHandlers = [];
      const { history, location } = this.props.bindLinks;
      element.querySelectorAll<HTMLAnchorElement>('a').forEach(anchorEl => this.modifyCmsAnchor(anchorEl, location, history));
    }

    return this.props.published?.onAfterRenderData?.(element);
  }

  private getCmsPath(cmsContentPath: string | undefined): string {
    if (cmsContentPath != null && cmsContentPath.length > 0) { return cmsContentPath; }

    const passThroughPath = InternalPassthrough.getNearestPassthroughPath(this._ref.current);
    if (passThroughPath != null) { return passThroughPath; }

    return window.location.pathname;
  }

  private getComponentFactory(templateId: string, path: string): (() => React.ReactElement<unknown>) | undefined {

    const children = this.props.children;

    if (this.props.component == null) {
      return children == null ? undefined : (() => <div>{children}</div>);
    } else {
      if (children != null) {
        throw new Error('Cannot set JshCmsContent.component property if JshCmsContent has child elements. Use either child elements or JshCmsContent.component to render CMS template.');
      }

      if (this.props.component?.toString().startsWith('class ')) {
        return () => React.createElement(this.props.component as React.JSXElementConstructor<unknown>, {});
      } else {
        // It is impossible to tell a function component from the ((templateId, path) => React.JSXElementConstructor<unknown>)
        // function. So try to call it and look at the return value.
        try {
          const retVal =  (this.props.component as (a: string, b: string) => (React.JSXElementConstructor<unknown> |  React.ReactElement))(templateId, path);
          if (retVal == null) {
            return undefined;
          } else if (React.isValidElement(retVal)) {
            // The component property is a function component
            return () => React.createElement(this.props.component as React.JSXElementConstructor<unknown>, {});
          } else {
            return () => React.createElement(retVal, {});
          }
        } catch {
          return undefined;
        }
      }
    }
  }

  private loadContent(path: string | undefined): void {

    this._abortPageLoad?.();

    if (path == null || path.length < 1) {
      this.setState({
        componentFactory: undefined,
        loading: false,
        pageData: undefined
      });
      return;
    }

    const abortable = this.context?.cmsClient.getPageContent(path);
    this._abortPageLoad = () => {
      abortable?.abort();
      this._abortPageLoad = undefined;
    }

    this.setState({ loading: true, pageData: undefined });
    abortable?.exec().then(data => {
      if (data == null || data.length < 1) {
        this.setState({ loading: false });
        this.props.published?.onPageNotFound?.(path);
        return;
      }

      let pageObject: JshCmsPage | undefined;
      let staticPage: string | undefined;
      let missingComponentFactoryError: Error | undefined;
      let componentFactory: (() => React.ReactElement<unknown>) | undefined;
      try {
        pageObject = JSON.parse(data) as JshCmsPage;

        const templateId = pageObject.page_template_id;
        componentFactory = this.getComponentFactory(templateId, path);
        if (componentFactory == null) {
          missingComponentFactoryError = new Error(`JshCmsContent requires either JshCmsContent.component property to be set or child elements to load a dynamic page. Template ID "${templateId}", path "${path}"`);
        }
      } catch {
        componentFactory = this.getComponentFactory('', path);
        staticPage = data;
      }

      if (missingComponentFactoryError != null) {
        console.error(missingComponentFactoryError);
        throw missingComponentFactoryError;
      }

      this.setState({
        componentFactory,
        loading: false,
        pageData: {
          page: pageObject,
          path,
          staticHtml: staticPage
        }
      });
    })
    .catch(() => {
      this.props.published?.onPageNotFound?.(path);
      this.setState({
        componentFactory: undefined,
        loading: false,
        pageData: undefined
      });
    });
  }

  private modifyCmsAnchor(anchorElement: HTMLAnchorElement, location: Location<unknown>, history: History): void {
    const linkPath = anchorElement.getAttribute('href') ?? '';
    if (linkPath.length < 1 || this.isPathWithProtocol(linkPath)) { return; }

    let handler: (() => void) | undefined;

    if (linkPath[0] === '#') {
      handler = () => {
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

        if (location.hash !== linkPath) {
          history.push({
            hash: linkPath
          });
        }
      };
    } else if (linkPath[0] === '/') {
      const newPath = linkPath;
      anchorElement.setAttribute('href', newPath);
      handler = () => {
        history.push({ pathname: newPath });
      };
    }

    if (handler != null) {
      const clickHandler = (event: MouseEvent) => {
        event.preventDefault();
        handler?.();
      };
      anchorElement.addEventListener('click', clickHandler);
      this._removeLinkEvenHandlers.push(() => anchorElement.removeEventListener('click', clickHandler));
    }
  }

  private isPathWithProtocol(path: string): boolean {
    return /^[a-z]+:\//i.test(path);
  }

  private renderEditor(): React.ReactElement {

    if (this.state.componentFactory == null) {
      return <></>;
    } else {
      return <JshCmsDynamicEditorOutlet componentFactory={this.state.componentFactory}/>;
    }
  }

  private renderPublish(): React.ReactElement {

    const publishOptions = { ...(this.props.published ?? {}) };
    publishOptions.onAfterRenderData = element => this.afterRenderData(element);

    if (this.state.loading) {
      return this.props.published?.loadingElement == null ? <></> : this.props.published.loadingElement
    } else if (this.state.pageData?.page != null && this.state.componentFactory != null) {
      return (
        <JshCmsDynamicPublishOutlet
          componentFactory={this.state.componentFactory}
          options={publishOptions as PublishedDynamicContentOptions}
          page={this.state.pageData.page}/>
      );
    } else if (this.state.pageData?.staticHtml != null) {

      if (this.state.componentFactory != null) {
        throw new Error(`Cannot set JshCsmContent.component property or have child elements when loading a static HTML page. Page loaded from path "${this.state.pageData.path}"`);
      }

      return (
        <JshCmsStaticOutlet
          html={this.state.pageData.staticHtml}
          options={publishOptions as PublishedStaticContentOptions}/>
      );
    } else {
      return this.props.published?.pageNotFoundElement == null ?  <div>Not found</div> : this.props.published.pageNotFoundElement;
    }
  }
}

/**
 * @public
 */
export interface JshCmsContentProps {
  /**
   * Set this using the React Router History and Location
   * objects if links should be navigated using React Router.
   * The history and location objects can be retrieved from the React Router
   * using either the `useHistory` and `useLocation` hooks, or the `withRouter`
   * higher-order component.
   *
   * See {@link https://v5.reactrouter.com/web/api/withRouter}
   * See {@link https://v5.reactrouter.com/web/api/Hooks/usehistory}
   * See {@link https://v5.reactrouter.com/web/api/Hooks/uselocation}
   */
  bindLinks?: { history: History; location: Location<unknown>; };
  /**
   * CMS relative path to the content to load.
   * The path should match the page path configured in the CMS.
   * E.g., '/about/team.html'.
   *
   * The path will be combined with pageFilesPath set in JshCmsClient.
   *
   * If the path is empty, then the current URL path will be used.
   * Empty paths will work only when the application paths are setup
   * to match the CMS content paths.
   */
  cmsContentPath?: string;
  /**
   * A component is required to load a dynamic page.
   * This can be left undefined for static HTML pages.
   */
  component?:
    React.JSXElementConstructor<unknown>
    | ((templateName: string, contentPath: string) => React.JSXElementConstructor<unknown> | undefined);
  /**
   * Set additional options depending on if rendering dynamic or static content.
   */
  published?: PublishedContentOptions & (PublishedDynamicContentOptions | PublishedStaticContentOptions);
}

/**
 * @public
 */
export interface PublishedContentOptions  {
  /** If set then this will be rendered any time data is loading (while the CSM content is not rendered). */
  loadingElement?: React.ReactElement;
  /**
   * This is called when the loading status changes.
   * Can be used to integrate with loading indicators
   * or other loading logic.
   */
  onLoadingChange?: (loading: boolean) => void;
  /** This is called if the CMS content is not found. */
  onPageNotFound?: (path: string) => void;
  /** If set then this will be rendered when no data is found for a given path. */
  pageNotFoundElement?: React.ReactElement
}

/**
 * @internal
 */
export interface JshCmsContentState {
  componentFactory?: () => React.ReactElement<unknown>;
  loading?: boolean;
  renderType: 'editor' | 'notSet' | 'publish';
  pageData?: {
    staticHtml: string | undefined;
    page: JshCmsPage | undefined;
    path: string;
  }
}
