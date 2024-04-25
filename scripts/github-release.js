import {execSync} from 'child_process';
import {readFileSync} from 'fs';

// Get the latest tag
const tag = getGitTag();
if (!tag) {
  console.error('TAG NOT FOUND');
  process.exit(1);
}

// Parse changelog
const changelog = getReleaseNotes(tag);
if (!changelog) {
  console.error('CHANGELOG NOT FOUND');
  process.exit(1);
}

// Publish release notes to GitHub
// https://docs.github.com/en/rest/reference/repos#create-a-release
const requestBody = {
  tag_name: tag,
  name: tag,
  body: changelog,
  prerelease: tag.search(/alpha|beta|rc/) > 0
};

console.log(JSON.stringify(requestBody));

function getGitTag() {
  try {
    return execSync('git describe --tags --exact-match HEAD', {
      stdio: [null, 'pipe', null],
      encoding: 'utf-8'
    }).trim();
  } catch (err) {
    // not tagged
    return null;
  }
}

function getReleaseNotes(version) {
  let changelog = readFileSync('CHANGELOG.md', 'utf-8');
  const header = changelog.match(new RegExp(`^###.*\\b${version.replace('v', '')}\\b.*$`, 'm'));
  if (!header) {
    return null;
  }
  changelog = changelog.slice(header.index + header[0].length);
  const endIndex = changelog.search(/^#/m);
  if (endIndex > 0) {
    changelog = changelog.slice(0, endIndex);
  }
  return changelog.trim();
}
