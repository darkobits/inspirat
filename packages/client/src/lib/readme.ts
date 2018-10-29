import chalk from 'chalk';


/**
 * Prints usage instructions and version information to the console.
 */
export default function printReadme() {
  const vr = process.env.PACKAGE_VERSION;
  const _chalk = chalk.constructor({enabled: true, level: 2});
  const name = _chalk.greenBright('\'Alice\'');

  console.info(chalk.reset([
    `+------ Inspirat v${vr} -------------------------------------------------------+`,
    `|                                                                              |`,
    `|  Welcome! To set your name, use the 'setName' method:                        |`,
    `|                                                                              |`,
    `|  setName(${name});                                                           |`,
    `|                                                                              |`,
    `|  If you experience any issues, head over GitHub:                             |`,
    `|                                                                              |`,
    `|  https://github.com/darkobits/inspirat/issues                                |`,
    `|                                                                              |`,
    `+------------------------------------------------------------------------------+`
  ].join('\n')));
}
