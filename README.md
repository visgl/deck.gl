This blog is part of the deck.gl demo website. It is designed to work both standalone and/or hosted inside the demo app per [PR #406](https://github.com/uber/deck.gl/pull/406). When building the demo site, a build of this site (the `blog/` folder) will be copied as static asset.

### Installation

    # install jekyll
    gem install jekyll
    # install dependencies
    bundle install

### Start Local Server

    jekyll serve

Open `localhost:4000/blog/` in browser.

### Add a post

- Add your name to `_data/authors.yml`.
- Create a new file in `_post/` with the format `yyyy-mm-dd-any-name.md`.
- Add metadata to the beginning of the file. Required fields are:
  + `title`: post title
  + `description`: post description
  + `author`
  + `tags`: list of tags
- Write markdown

### Build

    jekyll build