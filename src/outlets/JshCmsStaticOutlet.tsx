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
import { JshCmsClientContext } from '../jshCmsClientContext';

export class JshCmsStaticOutlet extends React.Component<JshCmsStaticOutletProps, JshCmsStaticOutletState> {

  declare public context: React.ContextType<typeof JshCmsClientContext> | undefined;
  public static override contextType = JshCmsClientContext;

  private _removeHeadElements: (() => void) | undefined;

  public constructor(props: JshCmsStaticOutletProps) {
    super(props);

    this.state = {};
  }

  public override componentDidMount(): void {
    this.context?.cmsClient.appendRenderCss();
    this.loadContent();
  }

  public override componentDidUpdate(prevProps: Readonly<JshCmsStaticOutletProps>): void {
    const htmlChanged = prevProps.html !== this.props.html;
    if (htmlChanged) { this.loadContent() }
  }

  public override componentWillUnmount(): void {
    this._removeHeadElements?.();
  }

  public override render(): React.ReactElement {

    if (this.state.childElements == null || this.state.childElements.length < 1) {
      return <></>;
    } else {
      return (
        <div ref={el => this.renderBody(el, this.state.childElements)}></div>
      )
    }
  }

  private appendElement(parentElement: Element, childElement: Element): Element {
    if (/script/i.test(childElement.tagName)) {
      const scriptElement = document.createElement('script');
      scriptElement.text = (childElement as HTMLScriptElement).text;
      for (let i = 0; i < childElement.attributes.length; i++) {
        const attr = childElement.attributes[i];
        scriptElement.setAttribute(attr.name, attr.value);
      }
      childElement = scriptElement;
    }
    parentElement.appendChild(childElement);
    return childElement;
  }

  private appendHeadElements(collection: HTMLCollection | undefined): Element[] {
    const appendedElements: Element[] = [];
    this.htmlCollectionToList(collection).forEach(element => {
      appendedElements.push(this.appendElement(document.head, element));
    });
    return appendedElements;
  }

  private htmlCollectionToList(collection: HTMLCollection | undefined): Element[] {
    const elements: Element[] = [];
    if (collection == null) { return elements; }

    for (let i = 0; i < collection.length; i++) {
      const element = collection.item(i);
      if (element != null) { elements.push(element); }
    }
    return elements;
  }

  private loadContent(): void {

    this._removeHeadElements?.();

    if (this.props.html == null || this.props.html.length < 1) {
      this.setState({ childElements: undefined });
      return;
    }

    const doc = new DOMParser().parseFromString(this.props.html, 'text/html');
    const headElements = this.appendHeadElements(doc.head.children);
    this._removeHeadElements = () => {
      headElements.forEach(el => el.remove());
      this._removeHeadElements = undefined;
    };

    this.setState({
      childElements: this.htmlCollectionToList(doc.body.children)
    });
  }

  private renderBody(wrapperEl: HTMLDivElement | null, bodyContent: Element[] | undefined) {

    if (bodyContent == null || wrapperEl == null) { return; }

    bodyContent.forEach(element => {
      this.appendElement(wrapperEl, element);
    });

    this.props.options?.onAfterRenderData?.(wrapperEl);
  }
}

export interface JshCmsStaticOutletProps {
  html: string;
  options?: PublishedStaticContentOptions;
}
export interface JshCmsStaticOutletState {
  childElements?: Element[];
}

/**
 * @public
 */
export interface PublishedStaticContentOptions {
  /**
   * This function is called after rendering the page.
   * Can be used for various post-processing tasks.
   */
  onAfterRenderData?: (element: HTMLDivElement | null) => void;
}
