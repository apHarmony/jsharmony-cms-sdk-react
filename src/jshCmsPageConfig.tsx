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

/**
 * This component is used to set the {@link https://www.jsharmonycms.com/resources/documentation/page-templates/reference-cms-page-config/ | cms-page-config}
 * for a template.
 *
 * Use within a {@link JshCmsContent} component.
 *
 * @example
* ```tsx
 * function Standalone() {
 *   return (
 *    <JshCmsContent>
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
 * @public
 */
export class JshCmsPageConfig extends React.Component<JshCmsPageConfigProps, never> {

  private _cleanupFn: (() => void) | undefined;

  /**
   * @internal
   */
   public constructor(props: JshCmsPageConfigProps) {
    super(props);
  }

  /**
   * @internal
   */
  public override componentDidMount(): void {

    const scriptEl = this.insertPageConfigElement();

    this._cleanupFn = () => {
      scriptEl.remove();
      this._cleanupFn = undefined;
    };
  }

  /**
   * @internal
   */
   public override componentWillUnmount(): void {
    this._cleanupFn?.();
  }

  /**
   * @internal
   */
   public override render(): React.ReactElement {
    return <></>
  }

  private insertPageConfigElement(): HTMLScriptElement {

    const scriptEl = document.createElement('script');
    scriptEl.type = 'text/cms-page-config';
    scriptEl.innerHTML = JSON.stringify(this.props?.config ?? {}, undefined, 4);
    document.head.appendChild(scriptEl);

    return scriptEl
  }
}

/* eslint-disable @typescript-eslint/naming-convention */
/**
 * @public
 */
export interface JshCmsPageConfigDefinition {
  title?: string;
  /**
   * Each editable content area has one entry in
   * content_elements. If no content areas are defined,
   * a default content area named "body" will be added.
   */
  content_elements?: {
    [content_area_name: string]: {
      title?: string;
      editor_toolbar?: {
        /** Dock position for the Editor Menu and Toolbar. Defaults to 'auto'. */
        dock?: 'auto' | 'bottom' | 'top_offset' | 'top';
        /** Whether to display the editor menu. Defaults to true. */
        show_menu?: boolean;
        /** Whether to display the editor toolbar. Defaults to true. */
        show_toolbar?: boolean;
      };
      /** Editable area type. Defaults to 'htmleditor' */
      type?: 'htmleditor' | 'text';
    }
  };
  /**
   * Default value for each content area.  If omitted,
   * the HTML content will be used.
   */
  default_content?: { [content_area_name: string]: string };
  /** Page Properties fields */
  properties?: {
    fields: unknown[];
  };
  options?: {
    /**  If set to false, no cms-title element required on the page. Defaults to true. */
    title_element_required?: boolean;
    /** Page toolbar dock position. Defaults to 'top_offset'. */
    dock?: 'bottom' | 'top_offset' | 'top';
  };
  /** SYSTEM - Hard-coded content element content. */
  content?: { [content_area_name: string]: string };
}
/* eslint-enable @typescript-eslint/naming-convention */

/**
 * @public
 */
export interface JshCmsPageConfigProps {
  config?: JshCmsPageConfigDefinition;
}
