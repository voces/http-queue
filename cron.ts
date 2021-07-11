type Cron = {
  second: number[];
  minute: number[];
  hour: number[];
  day: number[];
  month: number[];
  dayOfWeek: number[];
};

// * , - / 0-59

export const SECOND_PART = "([0-5]?[0-9]|\\*)";
export const SECOND_ARGS = [SECOND_PART, 0, 59] as const;

export const MINUTE_PART = "([0-5]?[0-9]|\\*)";
export const MINUTE_ARGS = [MINUTE_PART, 0, 59] as const;

export const HOUR_PART = "([0-1]?[0-9]|2[0-3]|\\*)";
export const HOUR_ARGS = [HOUR_PART, 0, 23] as const;

export const DAY_PART = "([12][0-9]|3[01]|0?[1-9]|\\*)";
export const DAY_ARGS = [DAY_PART, 1, 31] as const;

export const MONTH_PART = "(1[012]|0?[1-9]|\\*)";
export const MONTH_ARGS = [MONTH_PART, 1, 12] as const;

export const DAY_OF_WEEK_PART = "([0-6]|\\*)";
export const DAY_OF_WEEK_ARGS = [DAY_OF_WEEK_PART, 0, 6] as const;

export const parsePart = (
  part: string,
  token: string,
  min: number,
  max: number,
): number[] => {
  const nums = new Set<number>();
  const pieces = part.split(",");
  for (const piece of pieces) {
    const match = piece.match(
      new RegExp(
        `^(?<base>${token})(-(?<range>${token}))?(/(?<step>${token}))?$`,
      ),
    );
    // console.log(part, token, min, max);
    if (!match) throw new Error(`Invalid cron part "${part}"`);

    let base = parseInt(match.groups?.base ?? "");
    let range = parseInt(match.groups?.range ?? "") || base;

    if (match.groups?.base === "*") {
      base = min;
      range = max;
    }

    const step = parseInt(match.groups?.step ?? "") || 1;

    for (let i = Math.ceil(base / step) * step; i <= range; i += step) {
      nums.add(i);
    }
  }
  return Array.from(nums);
};

export const parseCron = (expr: string): Cron => {
  const parts = expr.split(" ");
  if (parts.length === 5) parts.unshift("0");
  if (parts.length !== 6) {
    throw new Error(`Expected 5-6 parts, received ${parts.length}`);
  }

  return {
    second: parsePart(parts[0], ...SECOND_ARGS),
    minute: parsePart(parts[1], ...MINUTE_ARGS),
    hour: parsePart(parts[2], ...HOUR_ARGS),
    day: parsePart(parts[3], ...DAY_ARGS),
    month: parsePart(parts[4], ...MONTH_ARGS),
    dayOfWeek: parsePart(parts[5], ...DAY_OF_WEEK_ARGS),
  };
};

export const nextCron = (cron: string | Cron, from: Date): Date => {
  if (typeof cron === "string") cron = parseCron(cron);

  const next = new Date(from);

  {
    // let seconds = next.getSeconds();
    let seconds = 59;
    let nextIndex =
      cron.second.findIndex((v, i, arr) =>
        v <= seconds && (i === arr.length - 1 || arr[i + 1] > seconds)
      ) + 1;
    console.log({ seconds, nextIndex, second: cron.second });
  }

  //   {
  //     let month = next.getMonth() + 1;

  //     if (!cron.month.includes(month)) {
  //       let index = 0;
  //       while (cron.month.length - 1 < index && cron.month[index + 1] < month) {
  //         index++;
  //       }
  //       console.log(index);

  //       // if (index )
  //     }

  //     console.log(month);
  //   }

  return next;
};

export const elapsed = (now: Date, last: Date, cron: Cron): boolean => false;
