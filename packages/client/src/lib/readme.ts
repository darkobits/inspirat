import chalk from 'chalk';


/**
 * Prints usage instructions and version information to the console.
 */
export default function printReadme() {
  const vr = process.env.PACKAGE_VERSION;
  const _chalk = chalk.constructor({enabled: true, level: 2});

  console.info(chalk.reset([
    `+------ Inspirat v${vr} -------------------------------------------------------+`,
    `|                                                                              |`,
    `|  Welcome! To set your name, use the 'setName' method:                        |`,
    `|                                                                              |`,
    `|  setName(${_chalk.greenBright('\'Alice\'')});                                                           |`,
    `|                                                                              |`,
    `|  If you experience any issues, head over GitHub:                             |`,
    `|                                                                              |`,
    `|  https://github.com/darkobits/inspirat/issues                                |`,
    `|                                                                              |`,
    `+------------------------------------------------------------------------------+`
  ].join('\n')));
}
