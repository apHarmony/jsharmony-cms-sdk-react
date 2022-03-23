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

import 'jsharmony-cms-sdk-clientjs';
import { Fetch } from './Fetch';
import { JshCmsAbortable } from './jshCmsAbortable';
import { JshCmsPage } from './outlets/dynamic-outlet/JshCmsDynamicPublishOutlet';

/**
 * @internal
 */
export class JshCmsClient {

  public get pageFilesPath(): string { return this._pageFilesPath; }

  private readonly _cmsClient: jsHarmonyCmsClient;
  private readonly _hasRedirectListingPath: boolean;
  private static _redirectData: jsh.Redirect[] | undefined;
  private readonly _pageFilesPath: string;

  public constructor(args: JshCmsClientArgs) {
    this._cmsClient = new jsHarmonyCmsClient({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      access_keys: args.accessKeys,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      auto_init: false,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      bind_routing_events: false,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      page_files_path: args.pageFilesPath,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      redirect_listing_path: args.redirectListingPath
    });

    this._cmsClient.onError = () => undefined;
    this._hasRedirectListingPath = args.redirectListingPath != null && args.redirectListingPath.length > 0;
    this._pageFilesPath = args.pageFilesPath;
  }

  public appendRenderCss(): void {
    this._cmsClient.appendRenderCss();
  }

  public destroyPage(): void {
    this._cmsClient.destroyPage();
  }

  public getEditorTemplateId(): string | undefined {
    return this._cmsClient.getPageTemplateId();
  }

  public getPageContent(path: string): JshCmsAbortable<string | undefined> {

    path = this._cmsClient.resolve(path, {});
    const fetchAbortable = Fetch.get(path);

    return new JshCmsAbortable(
      () => {
        return fetchAbortable.exec().then(data => {
          if (data.status === 200) {
            return data.response
          } else if (data.status === 404) {
            return undefined;
          } else {
            console.error(data.response);
            throw new Error(`Error loading "${path}". Status code ${data.status}`);
          }
        });
      },
      () => fetchAbortable.abort()
    );
  }

  public getRedirectData(): JshCmsAbortable<JshCmsRedirectData[]> {
    if (JshCmsClient._redirectData != null || !this._hasRedirectListingPath) {
      return new JshCmsAbortable(() => Promise.resolve(JshCmsClient._redirectData ?? []));
    }

    return new JshCmsAbortable(() => {
      return this._cmsClient.getRedirectData().then(data => {
        JshCmsClient._redirectData = data;
        return data;
      });
    }, () => undefined);
  }

  public initializeEditor(): void {
    this._cmsClient.onInit();
  }

  public isInEditor(): boolean {
    return this._cmsClient.isInEditor();
  }

  public renderElement(element: HTMLElement, page: JshCmsPage): JshCmsAbortable<void> {
    return new JshCmsAbortable(() => {
      return this._cmsClient.renderPage(
        page,
        {
          bindLinks: false,
          container: element,
          immediate: true,
          render: {
            css: false,
            elements: {
              'window-title': false
            },
            seo: {
              /* eslint-disable-next-line @typescript-eslint/naming-convention*/
              canonical_url: false,
              keywords: false,
              metadesc: false
            }
          }
        }
      );
    });
  }

  public resolveRedirect(redirectData: JshCmsRedirectData[], path: string): JshCmsResolvedRedirect | undefined {
    return this._cmsClient.matchRedirect(redirectData, path);
  }
}

/**
 * @internal
 */
export type JshCmsRedirectData = jsh.Redirect;

/**
 * @internal
 */
export type JshCmsResolvedRedirect = jsh.ResolvedRedirect;

/**
 * @public
 */
export interface JshCmsClientArgs {
  /** CMS Editor Access Keys */
  accessKeys: string[];
  /** URL to page files. E.g. '/cms' */
  pageFilesPath: string;
   /** URL to redirect listing JSON file. E.g., 'jshcms_redirects.json' */
  redirectListingPath?: string;
}
