This is a test app for demo chicago trips with [Sunlight](https://github.com/uber/deck.gl/blob/master/docs/api-reference/lights/sun-light.md) and Shadow effect.


**Download data**

[Chicago Data Portal](https://data.cityofchicago.org/Transportation/CTA-System-Information-Developer-Tool-GTFS-Data/sp6w-yusg)

**Process data**

`node > 11`

```
mkdir output

// -i input directory
// -o output diretory
// -l limit
// --help for all options
yarn transform -i ./data -o ./output -l 10000
```

**Start web app**

```
yarn start
```
