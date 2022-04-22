import * as React from 'react';

/**
 * @internal
 */
export class InternalPassthrough  extends React.Component<InternalPassthroughProps, never> {

  public static getNearestPassthroughPath(element: HTMLElement | null | undefined): string | undefined {

    const passThroughElement = element?.closest('[data-internal-passthrough-path]');
    const value = passThroughElement?.getAttribute('data-internal-passthrough-path') ?? '';

    return value.length > 0 ? value : undefined;
  }

  public override render(): React.ReactElement {
    return (
      <div data-internal-passthrough-path={this.props.resolvedCmsPath}>
        {this.props.children}
      </div>
    );
  }
}

/**
 * @internal
 */
export interface InternalPassthroughProps {
  resolvedCmsPath: string;
}
