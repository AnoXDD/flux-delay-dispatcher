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

let store = null;
let dispatcher = null;
let a = 0;

beforeEach(() => {
  dispatcher = new DelayDispatcher();
  store = new MyStore(dispatcher);
  f.mockClear();
});

test("Simple dispatch", () => {
  dispatcher.dispatch(payload);
  expect(f).toHaveBeenCalledTimes(1);
  expect(f).toHaveBeenCalledWith(payload);
});

