export default {
  define: {
    'process.env.GoogleMapsAPIKey': JSON.stringify(process.env.GoogleMapsAPIKey),
    'process.env.GoogleMapsMapId': JSON.stringify(process.env.GoogleMapsMapId)
  }
};
