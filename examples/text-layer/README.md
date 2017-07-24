This is a standalone demo of the [text layer](./text-layer) built upon [deck.gl](http://deck.gl). This example illustrates the text layer features by animating the evolving Twitter hashtags posted in the U.S. during one day. You can tweak `app.js` to generate a static text layer instead.

![text-layer](demo.png)

### Usage
Copy the content of this folder to your project. Run
```
npm install
npm start
```
### Note on "Map Tokens"
This example is set up to read the token from the environment variable
`MapboxAccessToken`, so you don't have to edit the code to test them.

### Data format
Sample data can be found [here](https://rivulet-zhang.github.io/dataRepo/text-layer/hashtagsOneDay.json).
