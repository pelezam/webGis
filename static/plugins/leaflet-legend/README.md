# leaflet-legend

This is a simple legend plugin for Leaflet. 
It can be used to add a small popup legend to a Leaflet map, [demo](https://zostera.github.io/leaflet-legend/example.html)

### What is this?

This plugin allows you to add a simple popup legend to a Leaflet map.  It extends the Leaflet ```Control``` class: creating and positioning the necessary container elements.

### Example

After including ```leaflet-legend.js``` and ```leaflet-legend.css``` in your project, you can add a legend to your map with the following:

```js
L.control.legend({
    items: [
        {color: 'red', label: 'reserved'},
        {color: 'blue', label: 'not reserved'}
    ],
    collapsed: true,
    // insert different label for the collapsed legend button.
    buttonHtml: 'legend'
}).addTo(map);
```
The complete example can be found in [`example.html`](./example.html).

### Dependencies

- Leaflet 1.3.1

### Install
Install with npm:
```
npm install git@github.com:zostera/leaflet-legend.git
```
or fork the [github project](https://github.com/zostera/leaflet-legend).

## License

[MIT License](http://opensource.org/licenses/MIT)
