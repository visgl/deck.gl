### Installation

    # install jekyll
    gem install jekyll
    # install dependencies
    bundle install

### Start Local Server

    bundle exec jekyll serve

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