import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

function fakeAudioContext() {
  const oscillators = [];
  const contexts = [];
  class FakeAudioContext {
    constructor() {
      contexts.push(this);
      this.state = "suspended";
      this.currentTime = 0;
      this.destination = {};
      this.resume = vi.fn(() => Promise.resolve());
    }
    createOscillator() {
      const osc = { type: "", frequency: { value: 0 }, connect: vi.fn(), start: vi.fn(), stop: vi.fn() };
      oscillators.push(osc);
      return osc;
    }
    createGain() {
      return { gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }, connect: vi.fn() };
    }
  }
  return { FakeAudioContext, oscillators, contexts };
}

async function freshSound() {
  vi.resetModules();
  return import("./sound.js");
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("sound (S4)", () => {
  test("play() creates one 880 Hz oscillator of about 0.4 s", async () => {
    const { FakeAudioContext, oscillators } = fakeAudioContext();
    vi.stubGlobal("AudioContext", FakeAudioContext);
    const sound = await freshSound();
    sound.play();
    expect(oscillators).toHaveLength(1);
    expect(oscillators[0].frequency.value).toBe(880);
    expect(oscillators[0].start).toHaveBeenCalledWith(0);
    expect(oscillators[0].stop).toHaveBeenCalledWith(0.4);
  });

  test("unlock() resumes a suspended audio context", async () => {
    const { FakeAudioContext, contexts } = fakeAudioContext();
    vi.stubGlobal("AudioContext", FakeAudioContext);
    const sound = await freshSound();
    sound.unlock();
    sound.play();
    expect(contexts).toHaveLength(1);
    expect(contexts[0].resume).toHaveBeenCalledTimes(1);
  });

  test("without AudioContext, unlock() and play() do not throw", async () => {
    vi.stubGlobal("AudioContext", undefined);
    vi.stubGlobal("webkitAudioContext", undefined);
    const sound = await freshSound();
    expect(() => sound.unlock()).not.toThrow();
    expect(() => sound.play()).not.toThrow();
  });

  test("when AudioContext throws, unlock() and play() do not throw", async () => {
    vi.stubGlobal(
      "AudioContext",
      class {
        constructor() {
          throw new Error("blocked");
        }
      },
    );
    const sound = await freshSound();
    expect(() => sound.unlock()).not.toThrow();
    expect(() => sound.play()).not.toThrow();
  });
});
