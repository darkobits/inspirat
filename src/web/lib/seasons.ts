import Chance from 'chance';
import {
  closestTo,
  differenceInDays,
  getYear,
  getDaysInYear,
  setYear
} from 'date-fns';


interface Season {
  name: string;
  midpoint: string;
}

interface WeightedSeason extends Season {
  weight: number;
}


/**
 * @private
 *
 * Chance instance.
 */
const chance = new Chance();


/**
 * @private
 *
 * Descriptors for each season and their midpoints.
 */
const DEFAULT_SEASONS: Array<Season> = [
  {
    name: 'Spring',
    midpoint: 'April 10'
  },
  {
    name: 'Summer',
    midpoint: 'July 10'
  },
  {
    name: 'Autumn',
    midpoint: 'October 10'
  },
  {
    name: 'Winter',
    midpoint: 'January 10'
  }
];


/**
 * @private
 *
 * A modifier of 1 will ensure that at a season's midpoint, that season will
 * have a weight of 1 and all others will have a weight of 0.
 *
 * At values above 1, a season will have an larger "exclusivity period" around
 * its midpoint.
 *
 * At values below 1, adjacent seasons will begin to have increasingly higher
 * weights, and no season will have an "exclusivity period".
 */
const DISTANCE_MODIFIER = 1.2;


/**
 * Accepts a Date object and an optional list of Season objects and returns a
 * list of WeightedSeason objects. Each season is assigned a weight from 0 to 1
 * based on the provided Date's distance to the nearest midpoint of that season.
 */
export function computeSeasonWeights(now: Date, seasons: Array<Season> = DEFAULT_SEASONS) {
  const curYear = getYear(now);
  const numDaysInYear = getDaysInYear(now);

  return seasons.map(season => {
    // For this year, the previous year, and next year, determine which midpoint
    // we are the closest to for the current season.
    const closest = closestTo(now, [
      setYear(new Date(season.midpoint), curYear - 1),
      setYear(new Date(season.midpoint), curYear),
      setYear(new Date(season.midpoint), curYear + 1)
    ]);

    if (!closest) {
      throw new Error(`No closest season for "${season.name}".`);
    }

    const diff = Math.abs(differenceInDays(now, closest));

    const weight = Math.max(
      0,
      1 - diff * (DISTANCE_MODIFIER * 4.1) / numDaysInYear
    );

    return {
      ...season,
      weight
    };
  });
}


/**
 * @deprecated
 *
 * Using a pre-defined list of season descriptors, returns a season selected
 * according to
 */
export function getRandomWeightedSeason() {
  const weightedSeasons = computeSeasonWeights(new Date(), DEFAULT_SEASONS);
  const names: Array<WeightedSeason['name']> = [];
  const weights: Array<WeightedSeason['weight']> = [];

  for (const season of weightedSeasons) {
    names.push(season.name.toLowerCase());
    weights.push(season.weight);
  }

  return chance.weighted(names, weights);
}
