// Copyright (c) 2019 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const {ArgumentParser} = require('argparse');

const parser = new ArgumentParser({
  addHelp: true,
  description: 'Data converter'
});

parser.addArgument(['-i', '--input'], {
  required: true,
  help: 'Path to raw data.'
});

parser.addArgument(['-o', '--output'], {
  required: true,
  help: 'Path to generated data.'
});

parser.addArgument(['-l', '--limit'], {
  defaultValue: Number.MAX_SAFE_INTEGER,
  help: 'Limit of lines to parse.'
});

parser.addArgument(['-m', '--toMap'], {
  defaultValue: Number.MAX_SAFE_INTEGER,
  help: 'Limit of lines to parse.'
});

parser.addArgument(['-s', '--samples'], {
  action: 'storeTrue',
  help: 'If use samples.'
});

parser.addArgument(['-p', '--preprocess'], {
  action: 'storeTrue',
  help: 'If preprocess (stops, routes).'
});

// extract args from user input
module.exports = function getArgs() {
  const args = parser.parseArgs();
  const inputDir = args.input;
  const outputDir = args.output;
  const limit = args.limit;
  const toMap = args.toMap;
  const samples = args.samples;
  const preprocess = args.preprocess;

  console.log(inputDir, outputDir); // eslint-disable-line
  return {
    inputDir,
    outputDir,
    limit,
    toMap,
    samples,
    enablePreprocess: preprocess
  };
};
