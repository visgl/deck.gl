/**
 * Verifies that CHANGELOG has been updated before publishing a new version
 */
import {readFileSync} from 'fs';

const {version} = JSON.parse(readFileSync('lerna.json'));

const changelog = readFileSync('CHANGELOG.md', 'utf-8');
const header = changelog.match(new RegExp(`^###.*\\b${version}\\b.*$`, 'm'));
if (!header) {
  console.error(`Cannot find an entry for ${version} in CHANGELOG.md`);
  process.exit(1);
}
