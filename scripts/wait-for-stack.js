#!/usr/bin/env node

import path from 'path';

import LogFactory from '@darkobits/log';
import axios from 'axios';
import fs from 'fs-extra';
import waitOn from 'wait-on';
import * as R from 'ramda';
import readPkgUp from 'read-pkg-up';

const log = LogFactory({ heading: 'sst' });

const pkgRoot = path.dirname(readPkgUp.sync().path);

const sstOutputValuesPath = path.resolve(
  pkgRoot,
  '.build',
  'static-site-environment-output-values.json'
);


// Waits for the stack output file required by `sst-env` to be created.
async function waitForStackOutputs() {
  log.info(`Waiting for stack to deploy.`);

  // Wait for the SST CLI to write the stack outputs file it will need when we
  // start the development server using `sst-env`.
  await waitOn({ resources: [sstOutputValuesPath] });

  // Read the output file and extract the URL we need to invoke the
  // sync-collections function.
  const stack = await fs.readJson(sstOutputValuesPath);
  const client = R.find(R.propEq('id', 'web'), stack);

  if (!client) {
    throw new Error('Stack did not contain a "web" construct.');
  }

  const endpoint = client.environmentOutputs.SYNC_COLLECTION_URL;

  if (!endpoint) {
    console.log(client);
    throw new Error(`Construct "web" did not contain a "SYNC_COLLECTION_URL" environment variable.`)
  }

  log.info('Syncing collections.');

  // Invoke sync-collections to ensure photo data is present before starting the
  // development server.
  await axios.get(endpoint);

  log.info(`Starting development server.`);
}


void waitForStackOutputs();
