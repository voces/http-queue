import { work } from "./worker.ts";

const FREQUENCY = 1000;

const timeout = (interval: number) => () =>
  new Promise<void>((resolve) => setTimeout(() => resolve, interval));

const cb = async () => {
  const start = Date.now();
  try {
    await Promise.race([timeout(5000), work()]);
  } catch (err) {
    console.error(err);
  }
  setTimeout(cb, Math.max(start - Date.now() + FREQUENCY, 0));
};

cb();
