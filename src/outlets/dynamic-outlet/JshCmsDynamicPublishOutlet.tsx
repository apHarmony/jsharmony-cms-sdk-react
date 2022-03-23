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

/**
 * @internal
 */
export class JshCmsDynamicPublishOutlet extends React.Component<JshCmsDynamicPublishOutletProps, JshCmsDynamicPublishOutletState> {

  declare public context: React.ContextType<typeof JshCmsClientContext> | undefined;
  public static override contextType = JshCmsClientContext;

  private _abortRenderData: (() => void) | undefined;
  private _unloadPath: (() => void) | undefined;

  public constructor(props: JshCmsDynamicPublishOutletProps) {
    super(props);
    this.state = {};
  }

  public override componentDidMount(): void {
    this.context?.cmsClient.appendRenderCss();
    this.loadContent();
  }

  public override componentDidUpdate(prevProps: Readonly<JshCmsDynamicPublishOutletProps>): void {
    const pageChanged = prevProps.page !== this.props.page;
    const componentFactoryChanged = prevProps.componentFactory !== this.props.componentFactory;

    if (pageChanged || componentFactoryChanged) {
      this.loadContent();
    }
  }

  public override componentWillUnmount(): void {
    this._abortRenderData?.();
    this._unloadPath?.();
    document.head.querySelector('#jshcms_render_styles')?.remove();
  }

  public override render(): React.ReactElement {

    if (this.state.renderData?.template == null) {
      return <></>
    } else {
      return (
        <div ref={el => this.renderData(el, this.props.page)}>
          { this.state.renderData.template }
        </div>
      );
    }
  }

  private appendCanonicalUrl(url: string | undefined): HTMLLinkElement | undefined {
    if (this.props.options?.onSetCanonicalUrl != null) {
      this.props.options.onSetCanonicalUrl(url ?? '');
      return undefined;
    }

    return this.setCanonicalUrl(url);
  }

  private appendMetaDescription(description: string | undefined): HTMLMetaElement | undefined {
    if (this.props.options?.onSetMetaDescription != null) {
      this.props.options.onSetMetaDescription(description ?? '');
      return undefined;
    }

    return this.setMetaElement('description', description);
  }

  private appendMetaKeywords(keywords: string | undefined): HTMLMetaElement | undefined {
    if (this.props.options?.onSetMetaKeywords != null) {
      this.props.options.onSetMetaKeywords(keywords ?? '');
      return undefined;
    }

    return this.setMetaElement('keywords', keywords);
  }

  private appendStyleElement(css: string | undefined): HTMLStyleElement | undefined {
    css = css ?? '';
    if (css.length < 1) { return undefined; }
    const styleEl = document.createElement('style');
    styleEl.appendChild(document.createTextNode(css));
    document.head.append(styleEl);
    return styleEl;
  }

  private loadContent(): void {

    this._abortRenderData?.();
    this._unloadPath?.();


    let data = this.props.page;
    data = this.props.options?.onBeforeRenderData?.(data) ?? data;

    this.setDocumentTitle(data.seo.title);

    const canonicalUrl = this.appendCanonicalUrl(data.seo.canonical_url);
    const metaDescriptionEl = this.appendMetaDescription(data.seo.metadesc);
    const metaKeywordsEl = this.appendMetaKeywords(data.seo.keywords);
    const styleEl = this.appendStyleElement(data.css);

    this._unloadPath = () => {
      canonicalUrl?.remove();
      metaDescriptionEl?.remove();
      metaKeywordsEl?.remove();
      styleEl?.remove();
      this.context?.cmsClient?.destroyPage();
      this._unloadPath = undefined;
    };

    this.setState({
      renderData: {
        pageData: data,
        template: this.props.componentFactory()
      }
    });
  }

  private renderData(wrapperEl: HTMLDivElement | null, pageData: JshCmsPage | undefined): void {

    this._abortRenderData?.();
    if (wrapperEl == null || pageData == null) { return; }

    const abortable = this.context?.cmsClient.renderElement(wrapperEl, pageData);
    this._abortRenderData = () => {
      abortable?.abort();
      this._abortRenderData = undefined;
    };

    this.context?.cmsClient.destroyPage();
    abortable?.exec().then(() => this.props.options?.onAfterRenderData?.(wrapperEl));
  }

  private setCanonicalUrl(url: string | undefined): HTMLLinkElement | undefined {
    url =  url ?? '';
    let element: HTMLLinkElement | undefined = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;

    if (url.length < 1) {
      element?.remove();
      return undefined;
    }

    if (element == null) {
      element = document.createElement('link');
      element.setAttribute('rel', 'canonical');
      document.head.appendChild(element);
    }

    element.setAttribute('href', url);
    return element;
  }

  private setDocumentTitle(title: string): void {
    if (this.props.options?.onSetTitle != null) {
      this.props.options.onSetTitle(title);
    } else {
      document.title = title;
    }
  }

  private setMetaElement(name: string, content: string | undefined): HTMLMetaElement | undefined {
    content = content ?? '';
    let element: HTMLMetaElement | undefined = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;

    if (content.length < 1) {
      element?.remove();
      return undefined;
    }

    if (element == null) {
      element = document.createElement('meta');
      element.setAttribute('name', name);
      document.head.appendChild(element);
    }

    element.setAttribute('content', content);
    return element;
  }
}

/**
 * @internal
 */
export interface  JshCmsDynamicPublishOutletProps {
  componentFactory: () => React.ReactElement<unknown>;
  options: PublishedDynamicContentOptions;
  page: JshCmsPage;
}

/**
 * @public
 */
export interface  PublishedDynamicContentOptions {
  /**
   * This function is called after rendering the page.
   * Can be used for various post-processing tasks.
   */
   onAfterRenderData?: (element: HTMLDivElement | null) => void;
  /**
   * This function is called before rendering the page.
   * Can be used for various pre-processing tasks.
   */
  onBeforeRenderData?: (pageData: JshCmsPage) => JshCmsPage;
  /**
   * Set this function to manually handle
   * canonical url changes. If not set
   * then the <link rel="canonical" href="canonical-url">
   * tag will be updated or added when
   * CMS content loads.
   */
  onSetCanonicalUrl?: (url: string) => void;
  /**
   * Set this function to manually handle
   * meta description changes. If not set
   * then the <meta name="description" content="">
   * header tag will be updated or added when
   * CMS content loads.
   */
  onSetMetaDescription?: (description: string) => void;
  /**
   * Set this function to manually handle
   * meta keywords changes. If not set
   * then the <meta name="keywords" content="">
   * header tag will be updated or added when
   * CMS content loads.
   */
  onSetMetaKeywords?: (keywords: string) => void;
  /**
   * Set this function to manually handle
   * title changes. Otherwise the document
   * title will automatically be set when
   * the CMS content loads.
   */
  onSetTitle?: (title: string) => void;
}

/**
 * @internal
 */
export interface JshCmsDynamicPublishOutletState {
  renderData?: {
    pageData: JshCmsPage;
    template: React.ReactElement | undefined;
  };
}

/**
 * @public
 */
export interface JshCmsPage {
  content: { [areaId: string]: string };
  css: string;
  footer: string;
  header: string;
  js: string;
  /* eslint-disable-next-line @typescript-eslint/naming-convention */
  page_template_id: string;
  properties: { [propName: string]: Record<string, unknown> };
  seo: {
    /* eslint-disable-next-line @typescript-eslint/naming-convention */
    canonical_url: string;
    keywords: string;
    metadesc: string;
    title: string;
  };
  title: string;
}
