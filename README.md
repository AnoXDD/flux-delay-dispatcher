# flux-delay-dispatcher

[![npm](https://img.shields.io/npm/v/flux-delay-dispatcher.svg?maxAge=86400)](https://www.npmjs.com/package/flux-delay-dispatcher)

A Dispatcher for Flux that supports delayed event dispatch.

## Introduction

The [original Dispatcher](https://facebook.github.io/flux/docs/dispatcher.html) from Flux doesn't have full support for delayed dispatching. Granted, we can use `setTimeout` to fire payload, but it can be a problem if we want to fire something after all `setTimeout` has been executed. 

This module extends the original Dispatcher by adding support for delayed dispatching. It also supports dispatching after all queued dispatch has been fired. 

## Install

```
npm i flux-delay-dispatcher
```

## Behavoir

This delay dispatcher can dispatch a payload immediately or after certian delay. It also supports dispatching after all delayed payload has been dispatched. 

## API

* **dispatch(object payload, number delay = 0): void** Dispatches a payload after delay (in milliseconds). If delay is zero, the payload will be dispatched immediately.
* **dispatchOnClear(object payload): void** Dispatches a payload after all the scheduled dispatches are done (i.e. called by `dispatch(...)`)
* **dispatchOnlyIfClear(object payload): void** Dispatch only if no payloads are scheduled to be dispatched
* **willBeDispatching(): boolean** Returns if current dispatcher WILL be dispatching any payload
* **dispatchDelayedPayload() : void** Dispatches all queued payloads
* **clearAllDelayedPayloads(): void** Skips all the payloads in the queue and executes payloads originally scheduled after those delayed payloads are dispatched
* **clearAllCallbackPayloads(): void** Clears all the payloads originally scheduled after delayed payloads are dispatched
* **clearAllFuturePayload(): void** Clears all the payloads in the queue and payload originally scheduled after those delayed payloads are dispatched

## Example

```JavaScript
import DelayDispatcher from "flux-delay-dispatcher"

let dispatcher = new DelayDispatcher();

let immediatePayload = "action now";
let delayedPayload = "delayed payload";
let callbackPayload = "callback payload";

// `immediatePayload` will be dispatched right away
dispatcher.dispatch(immediatePayload);

// `delayedPayload` will be dispatched after 1 second
dispatcher.dispatch(delayedPayload, 1000);

// `callbackPayload` will be dispatched after dispatcher has dispatched all queued payload
// In this case, after delayedPayload has been dispatched
dispatcher.dispatchOnClear(callbackPayload);

dispatcher.willBeDispatching(); // true

// If we want to dispatch payload right away without waiting for 1 second
dispatcher.releaseDelayedPayload();

dispatcher.willBeDispatching(); // false
```
