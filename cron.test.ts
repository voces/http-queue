import {
  DAY_ARGS,
  DAY_OF_WEEK_ARGS,
  HOUR_ARGS,
  MINUTE_ARGS,
  MONTH_ARGS,
  nextCron,
  parseCron,
  parsePart,
  SECOND_ARGS,
} from "./cron.ts";
import { assertEquals } from "./testDeps.ts";

const every = {
  second: [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
    40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58,
    59,
  ],
  minute: [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
    40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58,
    59,
  ],
  hour: [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23,
  ],
  day: [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
  ],
  month: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  dayOfWeek: [0, 1, 2, 3, 4, 5, 6],
};

Deno.test("parsePart simple", () => {
  assertEquals([15], parsePart("15", ...SECOND_ARGS));
});

Deno.test("parsePart range", () => {
  assertEquals([15, 16, 17, 18, 19, 20], parsePart("15-20", ...SECOND_ARGS));
});

Deno.test("parsePart start", () => {
  assertEquals(every.second, parsePart("*", ...SECOND_ARGS));
});

Deno.test("parsePart step", () => {
  assertEquals([0, 11, 22, 33, 44, 55], parsePart("*/11", ...SECOND_ARGS));
});

Deno.test("parsePart ranged step", () => {
  assertEquals([11, 22, 33], parsePart("10-40/11", ...SECOND_ARGS));
});

Deno.test("parsePart minute asterisk", () => {
  assertEquals(every.minute, parsePart("*", ...MINUTE_ARGS));
});

Deno.test("parsePart ranged step with minutes", () => {
  assertEquals([11, 22, 33], parsePart("10-40/11", ...MINUTE_ARGS));
});

Deno.test("parsePart hour asterisk", () => {
  assertEquals(every.hour, parsePart("*", ...HOUR_ARGS));
});

Deno.test("parsePart days asterisk", () => {
  assertEquals(every.day, parsePart("*", ...DAY_ARGS));
});

Deno.test("parsePart days stepped", () => {
  assertEquals([10, 20, 30], parsePart("*/10", ...DAY_ARGS));
});

Deno.test("parsePart months asterisk", () => {
  assertEquals(every.month, parsePart("*", ...MONTH_ARGS));
});

Deno.test("parsePart days of week asterisk", () => {
  assertEquals(every.dayOfWeek, parsePart("*", ...DAY_OF_WEEK_ARGS));
});

Deno.test("parse every minute", () => {
  assertEquals({ ...every, second: [0] }, parseCron("* * * * *"));
});

Deno.test("parse every second", () => {
  assertEquals(every, parseCron("* * * * * *"));
});

Deno.test("parse every midnight", () => {
  assertEquals(
    { ...every, second: [0], minute: [0], hour: [0] },
    parseCron("0 0 * * *"),
  );
});

Deno.test(
  "parse every five hours from midnight of January 1st to 10 am, 2 pm, 3 pm and also every three hours from 6pm to 11 pm",
  () => {
    assertEquals(
      {
        ...every,
        second: [0],
        minute: [0],
        hour: [0, 5, 10, 14, 15, 18, 21],
        day: [1],
        month: [1],
      },
      parseCron("0 0-10/5,14,15,18-23/3 1 1 *"),
    );
  },
);

Deno.test("nextCron", () => {
  assertEquals("", nextCron("* * * * * * *", new Date()));
});
