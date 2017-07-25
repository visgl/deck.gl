This blog is part of the deck.gl demo website. It is designed to work both standalone and/or hosted inside the demo app per [PR #406](https://github.com/uber/deck.gl/pull/406). When building the demo site, a build of this site (the `blog/` folder) will be copied as static asset.

### Installation

    # install gems
    gem install jekyll bundler
    # install dependencies
    bundle install

### Start Local Server

    (bundle exec) jekyll serve

Open `localhost:4000/blog/` in your browser (mind the last slash).

### Add a post

- Add your name to `_data/authors.yml`.
- Create a new file in `_posts/` with the format `yyyy-mm-dd-any-name.md` (specifying a date in the future won't show your post).
- Add metadata to the beginning of the file, look existing posts for format. Required fields are:
  + `title`: post title
  + `description`: post description
  + `author`: your nickname
  + `tags`: list of tags
- Write markdown.
- Assets goes into the root `img` folder.

### Build

    (bundle exec) jekyll build
