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

/* eslint-disable @typescript-eslint/naming-convention, @typescript-eslint/no-explicit-any*/
declare namespace jsh {

  export interface JsHarmonyCmsClientConfig {
    /** Array(string) CMS Editor Access Keys */
    access_keys: string[],
    /** Whether to automatically initialize the CMS Editor & Styles */
    auto_init: boolean;
    /**  URL to page files. E.g.,  '/' */
    page_files_path: string,
    /** URL to redirect listing JSON file */
    redirect_listing_path?: string;
    /** Default Directory Document. E.g., 'index.html' */
    default_document?: string;
    /** Whether to try URL variations (add "/", "/<default_document>") */
    strict_url_resolution?: boolean;
    /** List of Page Template Names supported by this instance, or use '*' for all. E.g, ['*'] */
    cms_templates?: string[];
    /** Whether to auto-bind the routing events (link click, browser back / forward buttons) for single-page functionality */
    bind_routing_events?: boolean;
    /** CSS Selector - If set, use an element ID to insert page.footer content, instead of appending to the end of the page */
    footer_container?: string;
    /** Define which items to render, or override renderer with custom function */
    render?: JsHarmonyCmsClientRenderConfigConfig;
  }

  export interface JsHarmonyCmsClientRenderConfigConfig {
    content?: boolean |
      ((val: unknown, obj: unknown, params: unknown) => void) |
      { [contentAreaId: string]: boolean | ((val: unknown, obj: unknown, params: unknown) => void) };
    header?: boolean | ((val: unknown, obj: unknown, params: unknown) => void);
    css?: boolean | ((val: unknown, obj: unknown, params: unknown) => void);
    js?: boolean | ((val: unknown, obj: unknown, params: unknown) => void);
    footer?: boolean | ((val: unknown, obj: unknown, params: unknown) => void);
    seo?: {
      metadesc?: boolean | ((val: unknown, obj: unknown, params: unknown) => void);
      keywords?: boolean | ((val: unknown, obj: unknown, params: unknown) => void);
      canonical_url?: boolean | ((val: unknown, obj: unknown, params: unknown) => void);
    };
    elements?: {
      'window-title'?: boolean | ((val: unknown, obj: unknown, params: unknown) => void);
      'cms-content-editor'?: boolean | ((val: unknown, obj: unknown, params: unknown) => void);
      'cms-component-content'?: boolean | ((val: unknown, obj: unknown, params: unknown) => void);
      'cms-onrender'?: boolean | ((val: unknown, obj: unknown, params: unknown) => void);
      'cms-title'?: boolean | ((val: unknown, obj: unknown, params: unknown) => void);
      'cms-template'?: boolean | ((val: unknown, obj: unknown, params: unknown) => void);
    };
  }

  export interface Page {
    content: { [areaId: string]: string };
    css: string;
    footer: string;
    header: string;
    js: string;
    page_template_id: string;
    properties: { [propName: string]: any };
    seo: {
      canonical_url: string;
      keywords: string;
      metadesc: string;
      title: string;
    };
    title: string;
  }

  export interface ResolvedRedirect {
    http_code: '301' | '302' | 'PASSTHRU';
    url: string;
  }

  export interface Redirect {
    redirect_key: number;
    redirect_url: string;
    redirect_url_type: string;
    redirect_dest: string;
    redirect_http_code: string;
  }

  export interface RenderPageOptions {
    /** Route links in content areas using single-page JS */
    bindLinks?: boolean;
    /** Render Config (Default Value: config.render) */
    render?: JsHarmonyCmsClientRenderConfigConfig;
    /** Container for rendering (Default Value: document.body) */
    container?: HTMLElement;
    /** Force rendering immediately.  When false, renderPage can be called before all containers are added to the DOM */
    immediate?: boolean;
  }
}

declare class jsHarmonyCmsClient {
  public onError: (error: any) => void;
  public constructor(config: jsh.JsHarmonyCmsClientConfig);
  public appendRenderCss(): void;
  public destroyPage(): void;
  public getPageTemplateId(): string;
  public getRedirectData(): Promise<jsh.Redirect[]>;
  public isInEditor(): boolean;
  public matchRedirect(redirects: jsh.Redirect[], url: string): jsh.ResolvedRedirect | undefined;
  public onInit(): void;
  public resolve(path: string, options: Record<string, unknown>): string;
  public renderPage(page: jsh.Page, options: jsh.RenderPageOptions, callback?: () => void): Promise<void>;
}
