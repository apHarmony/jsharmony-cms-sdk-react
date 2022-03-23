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

/**
 * @internal
 */
export class JshCmsAbortable<T> {

  private readonly _onAbort: () => void;
  private readonly _promiseFn: () => Promise<T>;
  private _state: 'aborted' | 'done' | 'pending' | 'preExec' = 'preExec';

  public constructor(promiseFn: () => Promise<T>, onAbort?: () => void) {
    this._promiseFn = promiseFn;
    this._onAbort = onAbort ?? (() => undefined);
  }

  /**
   * Make the promise hot.
   * Can be aborted by calling abort()
   * on this object.
   */
  public exec(): Promise<T> {

    if (this._state === 'aborted') {
      throw new Error('abort() has already been called');
    }
    if (this._state !== 'preExec') {
      throw new Error('exec() has already been called');
    }

    this._state = 'pending';
    return new Promise<T>((resolve, reject) => {
      this._promiseFn()
        .then(data => {
          if (this._state === 'pending') {
            this._state = 'done';
            resolve(data);
          }
        })
        .catch(error => {
            this._state = 'done';
            reject(error);
        })
    });
  }

  /**
   * Abort the pending promise.
   * The promise returned by exec()
   * will not call then() if it is aborted
   * before finishing.
   */
  public abort(): void {
    if (this._state === 'pending') {
      this._onAbort();
    }
    this._state = 'aborted';
  }
}
