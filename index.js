/**
 * Created by Anoxic on 9/25/2017.
 */

import {Dispatcher} from "flux";

export default class DelayDispatcher extends Dispatcher {

  constructor() {
    super();

    this._payloadQueue = {};
    this._callbackQueue = [];
    this._id = 0;
  }

  dispatch(payload, delay = 0) {
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
  dispatchOnClear(payload) {
    if (!this.willBeDispatching()) {
      super.dispatch(payload);
      return;
    }

    this._callbackQueue.push(payload);
  }

  /**
   * Returns if current dispatcher WILL be dispatching any payload
   */
  willBeDispatching() {
    return (Object.keys(this._payloadQueue).length !== 0);
  }

  /**
   * Dispatches all the payloads in the queue
   */
  dispatchDelayedPayload() {
    for (let id in this._payloadQueue) {
      if (this._payloadQueue.hasOwnProperty(id)) {
        this._dispatchOnTimeout(id);
      }
    }
  }

  /**
   * Dispatch only if no payloads are scheduled to be dispatched
   */
  dispatchOnlyIfClear(payload) {
    if (this.willBeDispatching()) {
      return;
    }

    super.dispatch(payload);
  }

  /**
   * Skips all the payloads in the queue and executes payloads originally
   * scheduled after those delayed payloads are dispatched
   */
  clearAllDelayedPayloads() {
    this._resetPayloadQueue();
    this._dispatchQueue();
  }

  /**
   * Clears all the payloads originally scheduled after delayed payloads are
   * dispatched
   */
  clearAllCallbackPayloads() {
    this._callbackQueue = [];
  }

  /**
   * Clears all the payloads in the queue and payloads originally scheduled
   * after those delayed payloads are dispatched
   */
  clearAllFuturePayloads() {
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

  _dispatchOnTimeout(id) {
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
  _dispatchQueue() {
    for (let payload of this._callbackQueue) {
      super.dispatch(payload);
    }

    this._callbackQueue = [];
  }
}
