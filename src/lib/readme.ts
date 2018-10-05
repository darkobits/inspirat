import chalk from 'chalk';


export default function printReadme() {
  const vr = process.env.PACKAGE_VERSION;
  const _chalk = chalk.constructor({enabled: true, level: 2});

  console.info(chalk.reset([
    `+------ Inspirat v${vr} -------------------------------------------------------+`,
    `|                                                                              |`,
    `|  Welcome! To set your name, use the 'setName' method:                        |`,
    `|                                                                              |`,
    `|  setName(${_chalk.green('\'Alice\'')});                                                           |`,
    `|                                                                              |`,
    `|  If you experience any issues, head over GitHub:                             |`,
    `|                                                                              |`,
    `|  https://github.com/darkobits/inspirat/issues                                |`,
    `|                                                                              |`,
    `+------------------------------------------------------------------------------+`
  ].join('\n')));
}
