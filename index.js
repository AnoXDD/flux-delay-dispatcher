/**
 * Created by Anoxic on 9/25/2017.
 *
 * @flow
 */

import {Dispatcher} from "flux";

export default class DelayDispatcher<TPayload> extends Dispatcher {

  _idKey: string;
  _payloadQueue: { [key: number]: (payload: TPayload) => void };
  _queue: Array<TPayload>;

  constructor(idKey: string = idKey) {
    super();

    this._payloadQueue = {};
    this._queue = [];
    this._idKey = idKey;

    super.register(payload => {
      if (!this.willBeDispatching()) {
        this._dispatchQueue();
      }
    });
  }

  dispatch(payload: TPayload, delay: number = 0) {
    if (delay === 0) {
      super.dispatch(payload);
      return;
    }

    let token = setTimeout(() => {
      this._payloadQueue[token] = payload;
      this._dispatchOnTimeout(token);
    }, delay);
  }

  /**
   * Dispatches the payload after all the delayed dispatches are done
   * @param payload
   */
  dispatchOnClear(payload: TPayload) {
    if (this.willBeDispatching()) {
      super.dispatch(payload);
      return;
    }

    this._queue.push(payload);
  }

  /**
   * Returns if current dispatcher WILL be dispatching any payload
   */
  willBeDispatching() {
    return (Object.keys(this._payloadQueue).length === 0);
  }

  /**
   * Release all the payloads in the queue
   */
  releaseDelayedPayload() {
    for (let token in this._payloadQueue) {
      if (this._payloadQueue.hasOwnProperty(token)) {
        super.dispatch(this._payloadQueue[token]);
      }
    }

    // this._dispatchQueue() will be called after all delayed payloads are
    // dispatched
  }

  _dispatchOnTimeout(token) {
    let payload = this._payloadQueue[token];
    delete this._payloadQueue[token];

    super.dispatch(payload);
  }

  /**
   * Dispatches all the payloads
   * @private
   */
  _dispatchQueue() {
    for (let payload of this._queue) {
      super.dispatch(payload);
    }

    this._queue = [];
  }
}
