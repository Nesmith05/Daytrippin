//get nearby cities
//  1. Take the city entered
//      -https://maps.googleapis.com/maps/api/geocode/json?address=atlanta&key=AIzaSyBPY1-NPGowiZS7Qh8AlOaUVeNnwWxtjVQ
//      - VERIFY that the city is in the US
//  2. create bounding box
//      - pass in the longitude and latitude as well as the distance into the function 'getBoundingBox'
//  3. use the bounding box N/S/E/W params to return the cities in the specified distance
//      http://api.geonames.org/citiesJSON?north=36.44395688601068&south=31.054033913989322&east=-77.38003110725805&west=-83.86342889274196&lang=de&username=nmanderson314
//  4. store the list of cities for use and display
//

var city;
var distance=0;
var cityResults = [
    {
        resultNum: 0,
        location: "" ,
        state: "",
        lat: "",
        lng: ""
    }
];
var searchCity;
var searchLng;
var searchLat;
var north, south, east, west;

//this is the final destination selected by the user
var destination;
var destinationLat;
var destinationLng;

//////////////////////////////////////////////////////////////
//////////////////////END VARIABLES///////////////////////////
//////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////
//////////////////////BEGIN FUNCTIONS/////////////////////////
//////////////////////////////////////////////////////////////

function googleGeoCode(){
    var queryURL = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + city + '&key=AIzaSyBPY1-NPGowiZS7Qh8AlOaUVeNnwWxtjVQ'
    console.log(queryURL);
    $.ajax({
        url: queryURL,
        method: "GET"
    })
// After the data from the AJAX request comes back
    .then(function(response) {
        console.log(response.results);
        console.log(response.results.length);
        if(response.results.length > 1){
            cityResults=[];
            for (var i = 0; i < response.results.length;i++){
                returnedCity = response.results[i].formatted_address;
                returnedLat = response.results[i].geometry.location.lat;
                returnedLng = response.results[i].geometry.location.lng;

//  Need to collect the country & ensure entering US country
                //Could check the last 3 chars of the formatted_address?
                //ex:   "formatted_address": "Atlanta, GA, USA",

                function addResult(resultNum, location, lat, lng){
                    cityResults.push({resultNum, location, lat, lng})
                };

                addResult(i, returnedCity, returnedLat, returnedLng);
                
                //create a clickable object for each city
                $("#possible-results").append("<a href='#'>" + returnedCity+ "</a><br>");

            }
        }
        else if(response.results.length === 1){
            searchCity = response.results[0].formatted_address;
            searchLat = response.results[0].geometry.location.lat;
            searchLng = response.results[0].geometry.location.lng;
            
            getBoundingBox([searchLat,searchLng],distance);
        }
        else{
            $("#possible-results").append("That search returned no results. Please try again.");
        }
    });
};

//*******************************************************
///NOTE: 
//Credit for the function 'getBoundingBox' is mentioned below
//https://stackoverflow.com/questions/238260/how-to-calculate-the-bounding-box-for-a-given-lat-lng-location
//*******************************************************
    // /**
    //  * @param {number} distance - distance (km) from the point represented by centerPoint
    //  * @param {array} centerPoint - two-dimensional array containing center coords [latitude, longitude]
    //  * @description
    //  *   Computes the bounding coordinates of all points on the surface of a sphere
    //  *   that has a great circle distance to the point represented by the centerPoint
    //  *   argument that is less or equal to the distance argument.
    //  *   Technique from: Jan Matuschek <http://JanMatuschek.de/LatitudeLongitudeBoundingCoordinates>
    //  * @author Alex Salisbury
    // */
//*******************************************************


function getBoundingBox(centerPoint, distance) {
    console.log(centerPoint);
    console.log(distance);
    var MIN_LAT, MAX_LAT, MIN_LON, MAX_LON, R, radDist, degLat, degLon, radLat, radLon, deltaLon,minLat, maxLat, minLon, maxLon;
    if (distance < 0) {
    return 'Illegal arguments';
    }
    // helper functions (degrees<–>radians)
    Number.prototype.degToRad = function () {
    return this * (Math.PI / 180);
    };
    Number.prototype.radToDeg = function () {
    return (180 * this) / Math.PI;
    };
    // coordinate limits
    MIN_LAT = (-90).degToRad();
    MAX_LAT = (90).degToRad();
    MIN_LON = (-180).degToRad();
    MAX_LON = (180).degToRad();
    // Earth's radius (km)
    R = 6378.1;
    // angular distance in radians on a great circle
    radDist = distance / R;
    // center point coordinates (deg)
    degLat = centerPoint[0];
    degLon = centerPoint[1];
    // center point coordinates (rad)
    radLat = degLat.degToRad();
    radLon = degLon.degToRad();
    // minimum and maximum latitudes for given distance
    minLat = radLat - radDist;
    maxLat = radLat + radDist;
    // minimum and maximum longitudes for given distance
    minLon = void 0;
    maxLon = void 0;
    // define deltaLon to help determine min and max longitudes
    deltaLon = Math.asin(Math.sin(radDist) / Math.cos(radLat));
    if (minLat > MIN_LAT && maxLat < MAX_LAT) {
    minLon = radLon - deltaLon;
    maxLon = radLon + deltaLon;
    if (minLon < MIN_LON) {
        minLon = minLon + 2 * Math.PI;
    }
    if (maxLon > MAX_LON) {
        maxLon = maxLon - 2 * Math.PI;
    }
    }
    // a pole is within the given distance
    else {
    minLat = Math.max(minLat, MIN_LAT);
    maxLat = Math.min(maxLat, MAX_LAT);
    minLon = MIN_LON;
    maxLon = MAX_LON;
    }
    return [
    west = minLon.radToDeg(),
    console.log("minLng " + minLon.radToDeg()),
    south = minLat.radToDeg(),
    console.log("minLat " + minLat.radToDeg()),
    east = maxLon.radToDeg(),
    console.log("maxLng " + maxLon.radToDeg()),
    north = maxLat.radToDeg(),
    console.log("maxLat " + maxLat.radToDeg()),
    //NOW, call the geoname API to return the nearest most populus cities
    geonamesCities()
    ];
};

function geonamesCities(){
    var queryURL = 'http://api.geonames.org/citiesJSON?north='+north+'&south='+south+'&east='+east+'&west='+west+'&lang=de&username=nmanderson314&maxRows=7';
    console.log(queryURL);

    $.ajax({
        url: queryURL,
        method: "GET"
    })
// After the data from the AJAX request comes back
    .then(function(response) {
        console.log(response.geonames);
        console.log(response.geonames.length);
        //if cities returned
        if(response.geonames.length > 1){
            //for each city returned, create a box
            for (var i = 0; i < response.geonames.length;i++){
                var destinationOption = response.geonames[i].name;
                var selectedLat = response.geonames[i].lat;
                var selectedLng = response.geonames[i].lng;
                // console.log(selectedLat,selectedLng);
                //omit the city that was originally searched
                if(city.toUpperCase() != destinationOption.toUpperCase()){             
                    //create a box object for each city returned
                    $("#top-ten").append("<div class='card column is-4 destinationCities'><div class='card-header-title is-centered' lat = '"+selectedLat+"' lng = '"+selectedLng+"'  cityName='" + destinationOption + "'>"+ destinationOption + "</div></div>");

                };
            }
        }
    });
};

function setDestination(){
    var destinationBox = $(this);
    destination = destinationBox.attr("cityName");
    destinationLat = destinationBox.attr("lat");
    destinationLng = destinationBox.attr("lng");
    console.log(destination);
}
//////////////////////////////////////////////////////////////
//////////////////////BEGIN FUNCTIONS/////////////////////////
//////////////////////////////////////////////////////////////



//////////////////////////////////////////////////////////////
//////////////////////BEGIN EVENTS////////////////////////////
//////////////////////////////////////////////////////////////

$("#search-area").on("click", function(event) {
    event.preventDefault();
    city = $("#city-input").val().trim();
    distance = parseInt($("#distance-input").val().trim());
    
    if(city !='' && distance > 0){
        $("#possible-results").empty();
        $(".destinationCard").empty();

        //convert distance from miles to km - set list of selected ranges because some of the search apis only accept up to 400km
        if (distance == 50){
            distance = 81;
        }
        else if (distance == 100){
            distance = 161;
        }
        else if (distance == 150){
            distance = 242;
        }
        else{
            distance = 322;
        };
        console.log(city);
        googleGeoCode();
    }

    else {
        $("#possible-results").empty();
        $(".destinationCard").empty();
        $("#possible-results").append("Please enter required information.");
    }

});

//when the user selects one of the cities returned
$(document).on("click", ".destinationCities", setDestination);

//////////////////////////////////////////////////////////////
////////////////////////END EVENTS////////////////////////////
//////////////////////////////////////////////////////////////
