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
  _callbackQueue: Array<TPayload>;
  _id: number;

  constructor() {
    super();

    this._payloadQueue = {};
    this._callbackQueue = [];
    this._id = 0;
  }

  dispatch(payload: TPayload, delay: number = 0): void {
    if (delay === 0) {
      super.dispatch(payload);
      return;
    }

    let id = `${new Date().getTime()}-${this._id++}`;
    let token = setTimeout(() => {
      this._dispatchOnTimeout(id);
    }, delay);

    this._payloadQueue[id] = {
      payload,
      token,
    };
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

    this._callbackQueue.push(payload);
  }

  /**
   * Returns if current dispatcher WILL be dispatching any payload
   */
  willBeDispatching(): boolean {
    return (Object.keys(this._payloadQueue).length !== 0);
  }

  /**
   * Dispatches all the payloads in the queue
   */
  dispatchDelayedPayload(): void {
    for (let id in this._payloadQueue) {
      if (this._payloadQueue.hasOwnProperty(id)) {
        this._dispatchOnTimeout(id);
      }
    }
  }

  /**
   * Skips all the payloads in the queue and executes payloads originally
   * scheduled after those delayed payloads are dispatched
   */
  clearAllDelayedPayloads(): void {
    this._resetPayloadQueue();
    this._dispatchQueue();
  }

  /**
   * Clears all the payloads originally scheduled after delayed payloads are
   * dispatched
   */
  clearAllCallbackPayloads(): void {
    this._callbackQueue = [];
  }

  /**
   * Clears all the payloads in the queue and payloads originally scheduled
   * after those delayed payloads are dispatched
   */
  clearAllFuturePayloads(): void {
    this._resetPayloadQueue();

    this.clearAllCallbackPayloads();
  }

  _resetPayloadQueue() {
    for (let id in this._payloadQueue) {
      if (this._payloadQueue.hasOwnProperty(id)) {
        clearTimeout(this._payloadQueue[id].token);
      }
    }
    this._payloadQueue = {};
  }

  _dispatchOnTimeout(id): void {
    let {payload} = this._payloadQueue[id];
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
    for (let payload of this._callbackQueue) {
      super.dispatch(payload);
    }

    this._callbackQueue = [];
  }
}
