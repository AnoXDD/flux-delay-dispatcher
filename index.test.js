/**
 * Created by Anoxic on 9/25/2017.
 */

import {ReduceStore} from "flux/utils";

import DelayDispatcher from "./index";

const f = jest.fn();
const payload = {name: "anoxic"};
const payloadNumber = 42;
const payloadString = "anoxic";
const payloadArray = "anoxic".split("");
const payloadBoolean = false;

/**
 * A class for a simple store that uses dispatcher
 */
class MyStore extends ReduceStore {
  constructor(dispatcher) {
    super(dispatcher);
  }

  static reset() {
    return null;
  }

  getInitialState() {
    return null;
  }

  reduce(state, action) {
    f(action);
    return null;
  }
}

jest.useFakeTimers();

let store = null;
let dispatcher = null;

beforeEach(() => {
  dispatcher = new DelayDispatcher();
  store = new MyStore(dispatcher);

  f.mockClear();
  jest.clearAllTimers();
});

test("simple dispatch", () => {
  dispatcher.dispatch(payload);

  expect(f).toHaveBeenCalledTimes(1);
  expect(f).toHaveBeenCalledWith(payload);
});

test("dispatch with delay", () => {
  dispatcher.dispatch(payload, 1000);

  expect(f).not.toBeCalled();

  jest.runAllTimers();

  expect(f).toHaveBeenCalledTimes(1);
  expect(f).toHaveBeenCalledWith(payload);
});

test("dispatch for all types", () => {
  dispatcher.dispatch(payloadArray);
  expect(f).toHaveBeenLastCalledWith(payloadArray);

  dispatcher.dispatch(payloadBoolean);
  expect(f).toHaveBeenLastCalledWith(payloadBoolean);

  dispatcher.dispatch(payloadNumber);
  expect(f).toHaveBeenLastCalledWith(payloadNumber);

  dispatcher.dispatch(payloadString);
  expect(f).toHaveBeenLastCalledWith(payloadString);
});

test("dispatch for multiple delays", () => {
  const firstDelay = 500;
  const secondDelay = 5000;
  dispatcher.dispatch(payload);
  dispatcher.dispatch(payload, firstDelay);
  dispatcher.dispatch(payload, secondDelay);

  expect(f).toHaveBeenCalledTimes(1);

  jest.runTimersToTime(firstDelay);
  expect(f).toHaveBeenCalledTimes(2);

  jest.runTimersToTime(secondDelay);
  expect(f).toHaveBeenCalledTimes(3);
});

test("dispatch in the middle of delay", () => {
  const firstDelay = 500;
  const secondDelay = 5000;
  const thirdDelay = 5000;
  dispatcher.dispatch(payload);
  dispatcher.dispatch(payload, firstDelay);
  dispatcher.dispatch(payload, secondDelay);

  expect(f).toHaveBeenCalledTimes(1);

  jest.runTimersToTime(firstDelay);
  expect(f).toHaveBeenCalledTimes(2);

  dispatcher.dispatch(payload, thirdDelay);
  expect(f).toHaveBeenCalledTimes(2);

  jest.runTimersToTime(secondDelay - firstDelay);
  expect(f).toHaveBeenCalledTimes(3);

  jest.runAllTimers();
  expect(f).toHaveBeenCalledTimes(4);
});

test("dispatch on clear with queue", () => {
  const delay = 500;

  dispatcher.dispatch(payload, delay);
  dispatcher.dispatchOnClear(payloadString);

  expect(f).not.toBeCalled();

  jest.runTimersToTime(delay);

  expect(f).toHaveBeenCalledTimes(2);
  expect(f).toHaveBeenCalledWith(payload);
  expect(f).toHaveBeenCalledWith(payloadString);
});

test("dispatch on clear with queue complex", () => {
  const delay = 500;

  dispatcher.dispatch(payload, delay);
  dispatcher.dispatchOnClear(payloadString);

  expect(f).not.toBeCalled();

  jest.runTimersToTime(delay / 2);
  dispatcher.dispatch(payloadBoolean, delay);
  expect(f).not.toBeCalled();

  jest.runTimersToTime(delay / 2);

  expect(f).toHaveBeenCalledTimes(1);
  expect(f).toHaveBeenCalledWith(payload);
  expect(f).not.toHaveBeenCalledWith(payloadString);
  expect(f).not.toHaveBeenCalledWith(payloadBoolean);

  jest.runTimersToTime(delay / 2);
  expect(f).toHaveBeenCalledTimes(3);
  expect(f).toHaveBeenCalledWith(payloadString);
  expect(f).toHaveBeenCalledWith(payloadBoolean);
});

test("dispatch on clear without queue", () => {
  dispatcher.dispatchOnClear(payload);

  expect(f).toBeCalled();
});

test("will be dispatching", () => {
  expect(dispatcher.willBeDispatching()).toBeFalsy();

  dispatcher.dispatch(payload);
  expect(dispatcher.willBeDispatching()).toBeFalsy();

  dispatcher.dispatchOnClear(payload);
  expect(dispatcher.willBeDispatching()).toBeFalsy();

  dispatcher.dispatch(payload, 1000);
  expect(dispatcher.willBeDispatching()).toBeTruthy();

  jest.runAllTimers();

  expect(dispatcher.willBeDispatching()).toBeFalsy();
});

test("release delayed payload", () => {
  const times = 3;

  for (let i = 0; i < 3; ++i) {
    dispatcher.dispatch(payload, 100);
  }

  dispatcher.dispatchOnClear(payload);

  expect(f).not.toBeCalled();

  dispatcher.releaseDelayedPayload();

  expect(f).toHaveBeenCalledTimes(times + 1);
});