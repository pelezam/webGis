let osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
let osmAttrib = '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors';
let osm = L.tileLayer(osmUrl, {maxZoom: 22, attribution: osmAttrib});
var map = L.map('map',{
    fullscreenControl: true,
}).setView([8.9374800,1.2122700], 7);

drawnItems = L.featureGroup().addTo(map);

//variable d'ajout sur la map
var featureGroup = L.featureGroup().addTo(map);
var all_layers = [];

var default_style={
    "fillColor": "#000",
    "color": "#38f",
    "weight": 5,
    "opacity": 0.65,
    "fillOpacity": 0
};


L.control.layers({
    "osm": osm.addTo(map),
    "google": L.tileLayer('http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}', {
        attribution: 'google'
    })
}, {'drawlayer':drawnItems}, { position: 'topright', collapsed: false }).addTo(map);

map.addControl(new L.Control.Draw({
    edit: {
        featureGroup: drawnItems,
        poly : {
            allowIntersection : false
        }
    },
    draw: {
        polygon : {
            allowIntersection: false,
            showArea:true
        }
    }
}));

// Truncate value based on number of decimals
var _round = function(num, len) {
    return Math.round(num*(Math.pow(10, len)))/(Math.pow(10, len));
};
// Helper method to format LatLng object (x.xxxxxx, y.yyyyyy)
var strLatLng = function(latlng) {
    return "("+_round(latlng.lat, 6)+", "+_round(latlng.lng, 6)+")";
};

// Generate popup content based on layer type
// - Returns HTML string, or null if unknown object
var getPopupContent = function(layer) {
    // Marker - add lat/long
    if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        return strLatLng(layer.getLatLng());
        // Circle - lat/long, radius
    } else if (layer instanceof L.Circle) {
        var center = layer.getLatLng(),
            radius = layer.getRadius();
        return "Center: "+strLatLng(center)+"<br />"
            +"Radius: "+_round(radius, 2)+" m";
        // Rectangle/Polygon - area
    } else if (layer instanceof L.Polygon) {
        var latlngs = layer._defaultShape ? layer._defaultShape() : layer.getLatLngs(),
            area = L.GeometryUtil.geodesicArea(latlngs);
        return "<span style='font-size:18px'>Area: "+L.GeometryUtil.readableArea(area, true)+"</span>";
        // Polyline - distance
    } else if (layer instanceof L.Polyline) {
        var latlngs = layer._defaultShape ? layer._defaultShape() : layer.getLatLngs(),
            distance = 0;
        if (latlngs.length < 2) {
            return "Distance: N/A";
        } else {
            for (var i = 0; i < latlngs.length-1; i++) {
                distance += latlngs[i].distanceTo(latlngs[i+1]);
            }
            return "<span style='font-size:18px'>Distance: "+_round(distance/1000, 2)+" km</span>";
        }
    }
    return null;
};

// Object created - bind popup to layer, add to feature group
map.on(L.Draw.Event.CREATED, function(event) {
    var layer = event.layer;
    var content = getPopupContent(layer);
    if (content !== null) {
        layer.bindPopup(content);
    }
    drawnItems.addLayer(layer);
});

// Object(s) edited - update popups
map.on(L.Draw.Event.EDITED, function(event) {
    var layers = event.layers,
        content = null;
    layers.eachLayer(function(layer) {
        content = getPopupContent(layer);
        if (content !== null) {
            layer.setPopupContent(content);
        }
    });
});


var customActionToPrint = function(context) {
    return function() {
        window.alert("Impression personnalisé");
        context._printCustom();
    }
};

L.control.browserPrint({
    printLayer: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a>",
        minZoom: 1,
        maxZoom: 19,
        ext: 'png'
    }),
    closePopupsOnPrint: false,
    printModes: [
        L.control.browserPrint.mode("Alert", "personnalisation", "A6", customActionToPrint, false),
        L.control.browserPrint.mode.landscape(),
        "POrtrait",
        L.control.browserPrint.mode.auto("Auto", "B4"),
        L.control.browserPrint.mode.custom("Séléctionnez la zone", "B5")
    ]

}).addTo(map);

L.Control.BrowserPrint.Utils.registerLayer(L.TileLayer.WMS, 'L.TileLayer.WMS', function(layer) {
    console.info("Printing WMS layer.");
    return L.tileLayer.wms(layer._url, layer.options);
});









function resetHighlight(e) {
    let layer = e.target;
    let geojson = L.geoJson(togo)
    layer.setStyle(default_style);
}

function zoomToFeature(e) {
    let layer = e.target;
    let data = layer.feature.properties
    let keys = Object.keys(data);
    let values = Object.values(data);
    let proprety_table = $('.map_popup .proprety_table').empty();
    let attribute_data = $('.map_popup .attribute_data');
    for (let i = 0; i < keys.length; i++) {
        let tr = document.createElement('tr');
        let td1 = document.createElement('td');
        let td2 = document.createElement('td');
        td1.innerText = keys[i];
        td2.innerText = values[i];
        tr.append(td1);
        tr.append(td2);
        proprety_table.append(tr);

    }
    $('.map_popup .voir-plus').attr('data-id', layer.feature.id);



    let popup = L.popup({
        'minWidth': '250',
        'autoPan': true,
        'maxHeight':'175',
    }).setContent($('.map_popup').html());
    layer.bindPopup(popup).addTo(map).openPopup();
    map.fitBounds(e.target.getBounds());

}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

}


function setLayerStyle(id) {
    let index = all_layers.findIndex(element => element.layer_id === id)
    let stroke = $("#styleModal form input[name='stroke']").val()
    let stroke_width = $("#styleModal form input[name='stroke-width']").val()
    let stroke_opacity = $("#styleModal form input[name='stroke-opacity']").val()
    let fill = $("#styleModal form input[name='fill']").val()
    let fill_color = $("#styleModal form input[name='fill_color']").val()

    let style={
        "fillColor": fill_color,
        "color": stroke,
        "weight": stroke_width,
        "opacity": stroke_opacity,
        "fillOpacity": fill
    };
    all_layers[index].setStyle(style)
}