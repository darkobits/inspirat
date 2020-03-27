import boxen from 'boxen';
import chalk from 'chalk';


/**
 * Prints usage instructions and version information to the console.
 */
export default function printReadme() {
  const customChalk = new chalk.Instance({level: 3});
  const version = process.env.PACKAGE_VERSION;

  const message = [
    `Inspirat v${version}`,
    '',
    'Welcome! To set your name, use the \'setName\' method:',
    '',
    `setName(${customChalk.greenBright('\'Alice\'')});`,
    '',
    'If you experience any issues, head over to GitHub:',
    '',
    'https://github.com/darkobits/inspirat/issues'
  ].join('\n');

  const boxenOpts = {
    borderStyle: 'bold',
    padding: 1
  };

  // @ts-ignore
  console.log(boxen(message, boxenOpts));
}
