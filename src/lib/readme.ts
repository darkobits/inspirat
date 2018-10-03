import chalk from 'chalk';

chalk.enabled = true;
chalk.level = 2;

export default function printReadme() {
  const vr = process.env.PACKAGE_VERSION;

  console.info(chalk.reset([
    `+------ Front Lawn Splash v${vr} ----------------------------------------------+`,
    `|                                                                              |`,
    `|  Welcome! To set your name, use the 'setName' method:                        |`,
    `|                                                                              |`,
    `|  setName(${chalk.green('\'Alice\'')});                                                           |`,
    `|                                                                              |`,
    `|  If you experience any issues, head over GitHub:                             |`,
    `|                                                                              |`,
    `|  http://bit.ly/2y95akl                                                       |`,
    `|                                                                              |`,
    `+------------------------------------------------------------------------------+`
  ].join('\n')));
}
