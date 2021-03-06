/**
 * This script contains variables and functions for google map
 */


var map;                         // google map instance
var rect;                        // google.maps.Rectangle class
var recRegion;                   // rectangle boundary, google.maps.LatLngBounds class
var myCenter = new google.maps.LatLng(37.227799, -80.422054); // center for google map region
var chanls = 0;                  // user selected channel [0, 2]
var markers_one = [];            // makers list for 1 channel
var circles_one = [];            // circles list for 1 channel
var markers_two_channel0 = [];   // channel 0 for 2 channels
var circles_two_channel0 = []; 
var markers_two_channel1 = [];   // channel 1 for 2 channels
var circles_two_channel1 = []; 
var markers_three_channel0 = []; // channel 0 for 3 channels
var circles_three_channel0 = []; 
var markers_three_channel1 = []; // channel 1 for 3 channels
var circles_three_channel1 = []; 
var markers_three_channel2 = []; // channel 2 for 3 channels
var circles_three_channel2 = []; 
var latLines = [];               // horizontal lines for grids
var lngLines = [];               // vertical lines for grids
var numberOfMarkers = 0;

/*
 * Initialize google map
 */
function initialize() {
    // create a google map
    var mapProp = {
        zoom: 7,
        maxZoom: 9,
        center: myCenter
    };
    map = new google.maps.Map(document.getElementById("map-canvas"), mapProp);

    // create a drawing manager attached to the map to allow the user to draw markers, lines, and shapes.
    var shapeOptions = {
        strokeWeight: 1,
        strokeOpacity: 1,
        fillOpacity: 0.1,
        editable: true,
        clickable: false,
        strokeColor: '#3399FF'
    };
    var drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: true,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [google.maps.drawing.OverlayType.RECTANGLE]
        },
        rectangleOptions: shapeOptions,
        map: map
    });
    // Add an event listener on the drawingManager for drawing complete
    google.maps.event.addListener(drawingManager, 'overlaycomplete', function(e) {
        // remove previous area
        if (rect != undefined) {
            rect.setMap(null);
        }
        // draw rectangle
        rect = e.overlay;
        rect.type = e.type;
        if (rect.type == google.maps.drawing.OverlayType.RECTANGLE) {
            rect.setMap(map);
            recRegion = rect.getBounds();
            // console.log(recRegion.toString());
        }
        // restore cursor to hand
        drawingManager.setDrawingMode(null);
        // clear previous grids
        clearGrids();
        // check grid size and coverage
        if (!checkSize(recRegion) || !checkCoverage(recRegion)) {
            if (rect != undefined) rect.setMap(null);
            recRegion = undefined;
        }
        else drawGrids(recRegion); // draw new grids

        // Add an event listener on the rectangle for bounds change
        google.maps.event.addListener(e.overlay, 'bounds_changed', function() {
            rect = e.overlay;
            rect.type = e.type;
            recRegion = rect.getBounds();
            console.log(recRegion.toString());
            clearGrids();
            if (!checkSize(recRegion) || !checkCoverage(recRegion)) {
                if (rect != undefined) rect.setMap(null);
                recRegion = undefined;
            }
            else drawGrids(recRegion);
        });
    });

    // Add an event listener on the map for click
    google.maps.event.addListener(map, 'click', function(event) {
        placeMarker(event.latLng);
    });
}

/**
 * Check size of analysis area
 */
function checkSize(recRegion) {
    var sz = cellSize;
    var rows = parseInt((recRegion.getNorthEast().lat() - recRegion.getSouthWest().lat()) / sz);
    var cols = parseInt((recRegion.getNorthEast().lng() - recRegion.getSouthWest().lng()) / sz);
    if (rows > 1000 || cols > 1000) {
        console.log("Rows: " + rows + ", Cols: " + cols);
        alert("Selected region is too large to compute in reasonable time. Please draw a smaller one.");
        return false;
    }
    return true;
}

/**
 * Check if analysis area covers all primary users
 * @param  {google.maps.LatLngBounds} recRegion [analysis boundary]
 * @return {boolean}           [true if analysis area covers all primary users]
 */
function checkCoverage(recRegion) {
    for (var i = 0; i < markers_one.length; i++) {
        if (!recRegion.contains(markers_one[i].getPosition())) {
            alert("Analysis area need to cover all primary users.");
            return false;
        }
    }
    for (var i = 0; i < markers_two_channel0.length; i++) {
        if (!recRegion.contains(markers_two_channel0[i].getPosition())) {
            alert("Analysis area need to cover all primary users.");
            return false;
        }
    }
    for (var i = 0; i < markers_two_channel1.length; i++) {
        if (!recRegion.contains(markers_two_channel1[i].getPosition())) {
            alert("Analysis area need to cover all primary users.");
            return false;
        }
    }
    for (var i = 0; i < markers_three_channel0.length; i++) {
        if (!recRegion.contains(markers_three_channel0[i].getPosition())) {
            alert("Analysis area need to cover all primary users.");
            return false;
        }
    }
    for (var i = 0; i < markers_three_channel1.length; i++) {
        if (!recRegion.contains(markers_three_channel1[i].getPosition())) {
            alert("Analysis area need to cover all primary users.");
            return false;
        }
    }
    for (var i = 0; i < markers_three_channel2.length; i++) {
        if (!recRegion.contains(markers_three_channel2[i].getPosition())) {
            alert("Analysis area need to cover all primary users.");
            return false;
        }
    }
    return true;
}

/*
 * Place markers on google map
 */
function placeMarker(location) {
    if (numberOfChannels == 1) {
        chanls = 0;
    }
    if (chanls == undefined) {
        alert("Please specify channel first.");
        return;
    }
    var color;
    var img;
    switch(chanls) {
        case 0:
            color = '#FF0000'
            img = 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FF0000';
            break;
        case 1:
            color = '#FFDB00'
            img = 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FFFF00';
            break;
        case 2:
            color = '#00CC00'
            img = 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|00CC00';
            break;
    }
    var marker = new google.maps.Marker({
        position: location,
        map: map,
        icon: img
    });
    var infowindow = new google.maps.InfoWindow({
        content: 'Latitude: ' + location.lat() + '<br>Longitude: ' + location.lng()
    });

    google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(map,marker);
    });

    var protectionCircle = {
      strokeColor: color,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: color,
      fillOpacity: 0.35,
      map: map,
      clickable: false,
      center: location,
      radius: d2 * 1000    // meters
    };
    var pc = new google.maps.Circle(protectionCircle);

    if (numberOfChannels == 1) {
        markers_one.push(marker);
        circles_one.push(pc);
    }
    if (numberOfChannels == 2) {
        if (chanls == 0) {
            markers_two_channel0.push(marker);
            circles_two_channel0.push(pc);
        }
        if (chanls == 1) {
            markers_two_channel1.push(marker);
            circles_two_channel1.push(pc);
        }
    }
    if (numberOfChannels == 3) {
        if (chanls == 0) {
            markers_three_channel0.push(marker);
            circles_three_channel0.push(pc);
        }
        if (chanls == 1) {
            markers_three_channel1.push(marker);
            circles_three_channel1.push(pc);
        }
        if (chanls == 2) {
            markers_three_channel2.push(marker);
            circles_three_channel2.push(pc);
        }
    }

    if (rect != undefined && recRegion != undefined) {
        if (!recRegion.contains(marker.getPosition())) {
            alert("Analysis area need to cover all primary users.");
            if (rect != null) rect.setMap(null);
            recRegion = undefined;
            clearGrids();
        }
    }
    numberOfMarkers += 1;
    if (numberOfMarkers > 1) {
        document.getElementById("tradeOff3").disabled = false;
        document.getElementById("tradeOff4").disabled = false;
    }
    else {
        document.getElementById("tradeOff3").disabled = true;
        document.getElementById("tradeOff4").disabled = true;
    }
}

/**
 * Show grid cells in analysis area
 */
function drawGrids(recRegion) {
    var sz = cellSize;
    if (!isNumeric(sz)) {
        sz = 0.005;
    }
    var nLat = recRegion.getNorthEast().lat();
    var sLat = recRegion.getSouthWest().lat();
    var eLng = recRegion.getNorthEast().lng();
    var wLng = recRegion.getSouthWest().lng();
    // north east lat/lng is bigger
    var rows = parseInt((recRegion.getNorthEast().lat() - recRegion.getSouthWest().lat()) / sz);
    var cols = parseInt((recRegion.getNorthEast().lng() - recRegion.getSouthWest().lng()) / sz);
    for (var i = 1; i <= rows; i++) {
        latLines.push(new google.maps.Polyline({
            map: map,
            path: [new google.maps.LatLng(nLat - i * sz, eLng),
                   new google.maps.LatLng(nLat - i * sz, wLng)],
            geodesic: false,
            strokeColor: '#3399FF',
            strokeOpacity: 0.9,
            strokeWeight: 0.2
        }));
    }
    // only works if not across +/- 180
    for (var i = 1; i <= cols; i++) {
        lngLines.push(new google.maps.Polyline({
            map: map,
            path: [new google.maps.LatLng(nLat, wLng + i * sz),
                   new google.maps.LatLng(sLat, wLng + i * sz)],
            geodesic: false,
            strokeColor: '#3399FF',
            strokeOpacity: 0.9,
            strokeWeight: 0.2
        }));
    }
    console.log("Rows: " + rows + ", Cols: " + cols);
}

/**
 * Clear grid lines
 */
function clearGrids() {
    for (var i = 0; i < latLines.length; i++) {
        latLines[i].setMap(null);
    }
    for (var i = 0; i < lngLines.length; i++) {
        lngLines[i].setMap(null);
    }
    latLines = [];
    lngLines = [];
}

/*
 * Delete rectangle on the map
 * Delete circles on the map
 * Delete all markers on the map
 * Clear grid lines
 */
function resetAllMarkers() {
    if (rect != undefined) rect.setMap(null);
    recRegion = undefined;
    chanls = undefined;
    for (var i = 0; i < markers_one.length; i++) {
        markers_one[i].setMap(null);
        circles_one[i].setMap(null);
    }
    markers_one = [];
    circles_one = [];
    for (var i = 0; i < markers_two_channel0.length; i++) {
        markers_two_channel0[i].setMap(null);
        circles_two_channel0[i].setMap(null);
    }
    markers_two_channel0 = [];
    circles_two_channel0 = [];
    for (var i = 0; i < markers_two_channel1.length; i++) {
        markers_two_channel1[i].setMap(null);
        circles_two_channel1[i].setMap(null);
    }
    markers_two_channel1 = [];
    circles_two_channel1 = [];
    for (var i = 0; i < markers_three_channel0.length; i++) {
        markers_three_channel0[i].setMap(null);
        circles_three_channel0[i].setMap(null);
    }
    markers_three_channel0 = [];
    circles_three_channel0 = [];
    for (var i = 0; i < markers_three_channel1.length; i++) {
        markers_three_channel1[i].setMap(null);
        circles_three_channel1[i].setMap(null);
    }
    markers_three_channel1 = [];
    circles_three_channel1 = [];
    for (var i = 0; i < markers_three_channel2.length; i++) {
        markers_three_channel2[i].setMap(null);
        circles_three_channel2[i].setMap(null);
    }
    markers_three_channel2 = [];
    circles_three_channel2 = [];
    clearGrids();
    numberOfMarkers = 0;
    document.getElementById("tradeOff3").checked = false;
    document.getElementById("tradeOff4").checked = false;
    document.getElementById("tradeOff3").disabled = true; // do not allow user to plot bar if no markers on channel
    document.getElementById("tradeOff4").disabled = true;
}

/**
 * JQuery function to start modal for plot instruction
 */
$(document).ready(function(){
    $('.plotGuide').on('click', function(){
        $('#guideModal').modal({
            backdrop: true,
            keyboard: true,
            show: true
        })
    });
});
