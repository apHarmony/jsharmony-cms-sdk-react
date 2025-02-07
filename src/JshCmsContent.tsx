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
import { InternalPassthrough } from './InternalPassthrough';
import { JshCmsClientContext } from './JshCmsClientContext';
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
 *   const navigate = useNavigate();
 *   const location = useLocation();
 *
 *   return (
 *    <JshCmsContent bindLinks={{ navigate, location }}>
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
  private readonly _ref = React.createRef<HTMLDivElement>();

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
      this.setState({ component: componentFactory() });
    }

    const hasPageProperty = this.props.page != null;
    const hasHtmlProperty = (this.props.html ?? '').length > 0;
    const hasContentPathProperty = (this.props.cmsContentPath ?? '').length > 0;
    const hasInvalidProperties = [hasPageProperty, hasHtmlProperty, hasContentPathProperty].filter(a => a).length > 1;
    if (hasInvalidProperties) {
      throw new Error('Conflicting properties are being used. Only one of the following properties can be set at a time: "page", "html", "cmsContentPath"');
    }

    if (renderType === 'publish') {
      if (hasPageProperty) {
        this.contentLoaded(this.props.page, undefined);
      } else if (hasHtmlProperty) {
        this.contentLoaded(this.props.html, undefined);
      } else {
        this.loadContent(this.getCmsPath(this.props.cmsContentPath));
      }
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
        return <div style={ { display: 'none' } } ref={this._ref}></div>
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

    if (this.props.onLinkActivate != null) {
      this._removeLinkEvenHandlers.forEach(f => f());
      this._removeLinkEvenHandlers = [];
      const handler = this.props.onLinkActivate;
      element.querySelectorAll<HTMLAnchorElement>('a').forEach(anchorEl => this.modifyCmsAnchor(anchorEl, handler));
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
          const retVal =  (this.props.component as (a: string, b: string) => (React.ComponentClass<unknown> | React.FunctionComponent<unknown> | string))(templateId, path);
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

  private contentLoaded(content: JshCmsPage | string | undefined, path: string | undefined): void {

    let componentFactory: (() => React.ReactElement<unknown>) | undefined;
    let staticHtml: string | undefined;
    let page: JshCmsPage | undefined;

    if ((typeof content !== 'string') && (typeof content !== 'object')) {
      content = this.props.published?.onPageNotFound?.(path ?? '');
    }

    if (typeof content === 'string') {
      componentFactory = this.getComponentFactory('', path ?? '');
      staticHtml = content;
    } else if (typeof content === 'object') {
      page = content;
      const templateId = page.page_template_id;
      componentFactory = this.getComponentFactory(templateId, path ?? '');
      if (componentFactory == null) {
        const error = new Error(`JshCmsContent requires either JshCmsContent.component property to be set or child elements to load a dynamic page. Template ID "${templateId}", path "${path ?? ''}"`);
        console.error(error);
        throw error;
      }
    }

    this.setState({
      component: componentFactory?.(),
      loading: false,
      pageData: {
        page,
        path: path ?? '',
        staticHtml
      }
    });
  }

  private loadContent(path: string | undefined): void {

    this._abortPageLoad?.();

    if (path == null || path.length < 1) {
      this.setState({
        component: undefined,
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

      let content: JshCmsPage | string | undefined;
      if (data != null) {
        try {
          content = JSON.parse(data ?? '') as JshCmsPage;
        } catch {
          content = data;
        }
      }
      this.contentLoaded(content, path);
    })
    .catch(() => {
      this.props.published?.onPageNotFound?.(path);
      this.setState({
        component: undefined,
        loading: false,
        pageData: undefined
      });
    });
  }

  private modifyCmsAnchor(anchorElement: HTMLAnchorElement, handler: (event: Event, anchorElement: HTMLAnchorElement) => void): void {
     const clickHandler = (event: MouseEvent) => handler(event, anchorElement);
    anchorElement.addEventListener('click', clickHandler);
    this._removeLinkEvenHandlers.push(() => anchorElement.removeEventListener('click', clickHandler));
  }

  private renderEditor(): React.ReactElement {

    if (this.state.component == null) {
      return <></>;
    } else {
      return <JshCmsDynamicEditorOutlet component={this.state.component}/>;
    }
  }

  private renderPublish(): React.ReactElement {

    const publishOptions = { ...(this.props.published ?? {}) };
    publishOptions.onAfterRenderData = element => this.afterRenderData(element);

    if (this.state.loading) {
      return this.props.published?.loadingElement == null ? <></> : this.props.published.loadingElement
    } else if (this.state.pageData?.page != null && this.state.component != null) {
      return (
        <JshCmsDynamicPublishOutlet
          component={this.state.component}
          options={publishOptions as PublishedDynamicContentOptions}
          page={this.state.pageData.page}/>
      );
    } else if (this.state.pageData?.staticHtml != null) {

      if (this.state.component != null) {
        throw new Error(`Cannot set JshCmsContent.component property or have child elements when loading a static HTML page. Page loaded from path "${this.state.pageData.path}"`);
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
   * CMS relative path to the content to load.
   * The path should match the page path configured in the CMS.
   * E.g., '/about/team.html'.
   *
   * The path will be combined with pageFilesPath set in JshCmsClient.
   *
   * If the path is empty, then the current URL path will be used.
   * Empty paths will work only when the application paths are setup
   * to match the CMS content paths.
   *
   * This does not apply to the editor.
   * Do not set if setting the page property or
   * the html property.
   */
  cmsContentPath?: string;
  /**
   * Render the static HTML instead of loading it.
   *
   * This does not apply to the editor.
   * Do no set if setting the cmsContentPath or
   * the page property
   */
  html?: string;
  /**
   * The onLinkActivate function can be set for custom link
   * handling/router integration.
   *
   * If integrating with the `react-router-dom@6` then
   * it is preferable to use the `JshCmsRoute` component
   * instead of the `JshCmsContent` component as it includes
   * default link handling for React Router. Alternatively, the
   * `JshCmsRouteLinkBinder` can be used to set the `onLinkActivate`
   * function with a handler that works with React Router.
   *
   * Here is an example implementation
   * @example
   * ```ts
   * function handler(event, anchorElement) {
   *   event.preventDefault();
   *   const url = anchorElement.getAttribute('href');
   *   // myNavigator.navigate would provide custom router
   *   // logic to go to `url`.
   *   myNavigator.navigate(url);
   * }
   * ```
   */
   onLinkActivate?: (event: Event, anchorElement: HTMLAnchorElement) => void;
  /**
   * Render the data defined by the page instead of loading it.
   *
   * This does not apply to the editor.
   * Do no set if setting the cmsContentPath or
   * the html property
   */
  page?: JshCmsPage;
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
  /**
   * The children of this component.
   */
  children?: React.ReactElement | React.ReactElement[];
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
  onPageNotFound?: (path: string) => JshCmsPage | string | undefined;
  /** If set then this will be rendered when no data is found for a given path. */
  pageNotFoundElement?: React.ReactElement
}

/**
 * @internal
 */
export interface JshCmsContentState {
  component?: React.ReactElement<unknown>;
  loading?: boolean;
  renderType: 'editor' | 'notSet' | 'publish';
  pageData?: {
    staticHtml: string | undefined;
    page: JshCmsPage | undefined;
    path: string;
  }
}
