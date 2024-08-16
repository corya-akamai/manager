/**
 * Picks a random element from an array
 * @param items { T[] } an array of any kind
 * @returns {T} an element of the given type
 */
export const pickRandom = <T>(items: T[]): T => {
  return items[Math.floor(Math.random() * items.length)];
};

/**
 * Generates a random date between two dates
 * @param start {Date} the start date
 * @param end {Date} the end date
 * @returns {Date} a random date between start and end
 */
export const randomDate = (
  start: Date = new Date(),
  end: Date = new Date(2021, 10, 25)
) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

/**
 * Generates a random date with a fixed time, ten days before today.
 * @returns {string} A string representing the date in the format 'YYYY-MM-DDTHH:mm:00.000Z'
 */
export const generateRandomDateTime = () => {
  const daysAgo = Math.floor(Math.random() * 11);
  const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

  date.setHours(1);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);

  return date.toISOString();
};
