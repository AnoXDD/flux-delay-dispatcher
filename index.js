/**
 * Created by Anoxic on 9/25/2017.
 *
 * @flow
 */

import {Dispatcher} from "flux";

export default class DelayDispatcher<TPayload> extends Dispatcher {

  _payloadQueue: {
    [key: string]: {
      id: string,
      token: number,
      payload: TPayload,
    }
  };
  _queue: Array<TPayload>;
  _id: number;

  constructor() {
    super();

    this._payloadQueue = {};
    this._queue = [];
    this._id = 0;
  }

  dispatch(payload: TPayload, delay: number = 0): void {
    if (delay === 0) {
      super.dispatch(payload);
      return;
    }

    let id = `${new Date().getTime()}-${this._id++}`;
    this._payloadQueue[id] = payload;

    setTimeout(() => {
      this._dispatchOnTimeout(id);
    }, delay);
  }

  /**
   * Dispatches the payload after all the delayed dispatches are done
   * @param payload
   */
  dispatchOnClear(payload: TPayload): void {
    if (!this.willBeDispatching()) {
      super.dispatch(payload);
      return;
    }

    this._queue.push(payload);
  }

  /**
   * Returns if current dispatcher WILL be dispatching any payload
   */
  willBeDispatching(): boolean {
    return (Object.keys(this._payloadQueue).length !== 0);
  }

  /**
   * Release all the payloads in the queue
   */
  releaseDelayedPayload(): void {
    for (let id in this._payloadQueue) {
      if (this._payloadQueue.hasOwnProperty(id)) {
        this._dispatchOnTimeout(id);
      }
    }
  }

  _dispatchOnTimeout(id): void {
    let payload = this._payloadQueue[id];
    delete this._payloadQueue[id];

    if (!this.willBeDispatching()) {
      this._dispatchQueue();
    }

    super.dispatch(payload);
  }

  /**
   * Dispatches all the payloads
   * @private
   */
  _dispatchQueue(): void {
    for (let payload of this._queue) {
      super.dispatch(payload);
    }

    this._queue = [];
  }
}
