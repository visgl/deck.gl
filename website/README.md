This is the source code of the demo website for deck.gl.

## Developing

    npm install
    export MapboxAccessToken=<insert_your_token> && npm start

## About the blog

The deck.gl blog is a standalone, static website. Its contents are referenced by this demo app in the **blog** page. When publishing the demo site a build of the blog is pulled from the `origin/blog` branch to the `dist/` folder.

We use [Jekyll](https://jekyllrb.com/) to render the blog. It handles things such as templating, pagination, tagging and RSS feed for us. The source of the blog is on its own separate branch because:
- It does not depend on anything in master
- Only team members can publish articles, therefore it should not be pulled/forked with the deck.gl source code.
