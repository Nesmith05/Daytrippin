$(document).ready(function () {
    $("#possible-results").hide();
    $("#top-ten").hide();
    $("#weather").hide();
    $("#zomato-table").hide();
    $("#results-page").hide();
    $("#the-results").hide();

    //////////////////////////////////////////////////////////////
    //////////////////////BEGIN FIREBASE//////////////////////////
    //////////////////////////////////////////////////////////////

    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyDrbAOcXQwc3wrl38mfUUr5FFIZGy_ctjo",
        authDomain: "daytrippin-26a14.firebaseapp.com",
        databaseURL: "https://daytrippin-26a14.firebaseio.com",
        projectId: "daytrippin-26a14",
        storageBucket: "daytrippin-26a14.appspot.com",
        messagingSenderId: "869251076265"
    };
    firebase.initializeApp(config);


    //////////////////////////////////////////////////////////////
    //////////////////////END FIREBASE////////////////////////////
    //////////////////////////////////////////////////////////////

    //////////////////////////////////////////////////////////////
    //////////////////////BEGIN VARIABLES///////////////////////////
    //////////////////////////////////////////////////////////////
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
    var database = firebase.database();

    var city;
    var distanceInput = 0;
    var distance = 0;
    var cityResults = [
        {
            resultNum: 0,
            location: "",
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
    
    //////////////////////NATALIE FUNCTIONS/////////////////////////
    function miToKmConvert(){
        // 1 mi, mi(Int) = 1.609344 km
        // 15 mi, mi(Int) = 15 × 1.609344 km = 24.14016 km
        distance = distanceInput * 1.609344
    }


    function googleGeoCode() {
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
            
    //  Need to collect the country & ensure entering US country
                    //Could check the last 3 chars of the formatted_address?
                    //ex:   "formatted_address": "Atlanta, GA, USA",

            //HANDLE RETURN OF MULTIPLE CITIES
            if(response.results.length > 1){
                cityResults=[];
                for (var i = 0; i < response.results.length;i++){
                    returnedCity = response.results[i].formatted_address;
                    returnedLat = response.results[i].geometry.location.lat;
                    returnedLng = response.results[i].geometry.location.lng;

                    console.log("Country: " + returnedCity.substring(returnedCity.length - 3));
                    var country3Char = returnedCity.substring(returnedCity.length - 3);
                    
                    //user validation - must be a us city.Google API always returns "USA" as last 3 characters for all US cities
                    if(country3Char === "USA"){
                        function addResult(resultNum, location, lat, lng){
                            cityResults.push({resultNum, location, lat, lng})
                        };

                        addResult(i, returnedCity, returnedLat, returnedLng);
                        
                        //create a clickable object for each city. 
                        $("#possible-results").prepend("<a href='#' id='multi-Results' city='"+returnedCity+"' lat='"+returnedLat+"' lng='"+returnedLng+"'>" + returnedCity+ "</a><br>");
                    }
                }
            }
            //ONLY ONE CITY RETURNED
            else if(response.results.length === 1){
                searchCity = response.results[0].formatted_address;
                searchLat = response.results[0].geometry.location.lat;
                searchLng = response.results[0].geometry.location.lng;
                
                console.log("Country: " + searchCity.substring(searchCity.length - 3));
                var country3Char = searchCity.substring(searchCity.length - 3);
                
            //user validation - must be a us city.Google API always returns "USA" as last 3 characters for all US cities
            //cannot be a function with out creating additional functions
                if(country3Char === "USA"){
                getBoundingBox([searchLat,searchLng],distance);
                }
                else{
                    $("#possible-results").empty();
                    $("#possible-results").append("That search returned no results within the USA. Please try again.");
                }
            }
            //NOTHING RETURNED - USER INPUT VALIDATION
            else{
                $("#possible-results").empty();
                $("#possible-results").append("That search returned no results. Please try again.");
            }
        });
    };

    function citySelect() {
        var citySearchLink = $(this);
        console.log(this);
        parseInt($("#distance-input").val().trim());
        searchCity = citySearchLink.attr("city");
        searchLat = parseInt(citySearchLink.attr("lat"))
        searchLng = parseInt(citySearchLink.attr("lng"));
        console.log(searchCity);
        console.log(searchLat);
        console.log(searchLng);
        $("#possible-results").empty();
        console.log("Accepted search of user: (["+searchLat+", "+searchLng+"], "+distance+")");
        getBoundingBox([searchLat,searchLng],distance);
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
        console.log("getBoundingBox Function Executed")
        console.log(centerPoint);
        console.log(distance);
        var MIN_LAT, MAX_LAT, MIN_LON, MAX_LON, R, radDist, degLat, degLon, radLat, radLon, deltaLon, minLat, maxLat, minLon, maxLon;
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

    function geonamesCities() {
        var queryURL = 'http://api.geonames.org/citiesJSON?north=' + north + '&south=' + south + '&east=' + east + '&west=' + west + '&lang=de&username=nmanderson314&maxRows=7';
        console.log(queryURL);

        $.ajax({
            url: queryURL,
            method: "GET"
        })
            // After the data from the AJAX request comes back
            .then(function (response) {
                console.log(response.geonames);
                console.log(response.geonames.length);
                //if cities returned
                if (response.geonames.length > 1) {
                    //for each city returned, create a box
                    for (var i = 0; i < response.geonames.length; i++) {
                        var destinationOption = response.geonames[i].name;
                        var selectedLat = response.geonames[i].lat;
                        var selectedLng = response.geonames[i].lng;
                        // console.log(selectedLat,selectedLng);
                        //omit the city that was originally searched
                        if (city.toUpperCase() != destinationOption.toUpperCase()) {
                            //create a box object for each city returned
                            $("#top-ten").append("<div class='card column is-4 destinationCities' lat = '" + selectedLat + "' lng = '" + selectedLng + "'  cityName='" + destinationOption + "'><div class='card-header-title is-centered'>" + destinationOption + "</div></div>");
                        };
                    }
                }
            });
    };



    function setDestination(){
        var destinationBox = $(this);
        console.log(this);
        destination = destinationBox.attr("cityName");
        destinationLat = destinationBox.attr("lat");
        destinationLng = destinationBox.attr("lng");
        console.log(destination);
        console.log(destinationLat);
        console.log(destinationLng);

        // CALL js of all other team members
        eventbrite();
        zomato();
        weather();

        //show results
        $("#the-results").show();
        $("#results-page").show();
        $(".destinationCities").on("click", clearResults());

       


    }
    //////////////////////END NATALIE FUNCTION/////////////////////////

    function clearResults() {
        $("#body").empty();
        $("#zomato-body").empty();
    }

    //////////////////////NAKELL FUNCTION/////////////////////////
    function zomato() {
        var cities = {
            "async": true,
            "crossDomain": true,
            "url": "https://developers.zomato.com/api/v2.1/cities?lat=" + destinationLat + "&lon=" + destinationLng,

            "method": "GET",
            "headers": {
                "user-key": "c7288644a7a1a0bb320b8e22c80479c6",
            }

        }

        $.ajax(cities).done(function (response) {
            console.log(response.location_suggestions[0].id);
            console.log(response);
            var cityID = response.location_suggestions[0].id;
            // console.log(cityID);
            var restuarant = {
                "async": true,
                "crossDomain": true,
                "url": `https://developers.zomato.com/api/v2.1/search?entity_id=${cityID}&entity_type=city&count=10&sort=rating&order=desc`,
                "method": "GET",
                "headers": {
                    "user-key": "c7288644a7a1a0bb320b8e22c80479c6",

                }
            }

            $.ajax(restuarant).done(function (response) {
                // console.log(response.restaurants);
                var list = response.restaurants;
                list.forEach(element => {
                    // console.log(element.restaurant.name)

                    $("#zomato-body").append("<tr><td>" + element.restaurant.name + "</td><td>" + element.restaurant.location.address + "</td><td>" + element.restaurant.cuisines);
                });

            });
        });
    };
    //////////////////////END: NAKELL FUNCTION/////////////////////////

    //////////////////////NATASHA FUNCTION/////////////////////////

    function eventbrite() {

        var token = "&token=7RI4EOUJ2KE4ZQYMVVTZ";
        // var queryURL = "https://www.eventbriteapi.com/v3/events/search/?location.address=charlotte" + token;
        var queryURL = "https://www.eventbriteapi.com/v3/events/search/?sort_by=date&location.latitude=" + destinationLat + "&location.longitude=" + destinationLng + "&location.within=" + distanceInput + "mi" + token;
        console.log(queryURL);

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {

            console.log(response.events);
            // var categories = response.events[i].category_id;
            // if (categories != "101", "112" ) {
            for (i = 0; i < 10; i++) {
                var eventName = response.events[i].name.text;
                console.log(eventName);
                var eventStart = response.events[i].start.local;
                console.log(moment(eventStart).format("llll"));
                console.log(eventStart);
                var eventEnd = response.events[i].end.local; //convert military time
                console.log(eventEnd);
                var eventDesc = response.events[i].description.text;
                // var Description = eventDesc.css("font-size", "12px" );
                console.log(v.prune(eventDesc, 150));
                var uRl = response.events[i].url;
                console.log(uRl);
                var elink = $("<a href=" + uRl + ">Click</a>");
                console.log(elink);
                $("#body").append("<tr><td>" + "<a href=" + uRl + ">" + eventName + "</a>" + "<td>" + moment(eventStart).format("llll") + " - " + moment(eventEnd).format("llll") + "<td>" + v.prune(eventDesc, 150));
                //   $("<a>" + elink )
                
                
                    // console.log(categories);
                    // if (categories == "103", "101") {
                    //     response.events[i].hide();
                    // }
                }
            // }
        });
       
    };


    //////////////////////END: NATASHA FUNCTION/////////////////////////

    //////////////////////MATT FUNCTION/////////////////////////
    function weather() {
        // var destinationLat = 36.0726355 
        // var destinationLng = -79.7919754
        var weatherAPI = "=86e077f1801044c6bf8210536181308";
        var queryURL = "http://api.apixu.com/v1/forecast.json?key" + weatherAPI + "&q=" + destinationLat + "," + destinationLng + "&days=3";
        var dayonemintemp;
        var daytwocondition;
        var daythreecondition;

        $.ajax({
            url: queryURL,
            method: "GET"
        })
            .then(function (response) {
                console.log(queryURL);
                console.log(response);

                $("#date1").empty();
                $("#tempmin1").empty();
                $("#tempmax1").empty();
                $("#condition1").empty();
                $("#message1").empty();

                $("#date2").empty();
                $("#tempmin2").empty();
                $("#tempmax2").empty();
                $("#condition2").empty();
                $("#message2").empty();

                $("#date3").empty();
                $("#tempmin3").empty();
                $("#tempmax3").empty();
                $("#condition3").empty();
                $("#message3").empty();

                $("#date1").append(response.forecast.forecastday[0].date);
                $("#tempmin1").append("Low: " + response.forecast.forecastday[0].day.mintemp_f);
                $("#tempmax1").append("High: " + response.forecast.forecastday[0].day.maxtemp_f);
                $("#condition1").append(response.forecast.forecastday[0].day.condition.text);


                $("#date2").append(response.forecast.forecastday[1].date);
                $("#tempmin2").append("Low: " + response.forecast.forecastday[1].day.mintemp_f);
                $("#tempmax2").append("High: " + response.forecast.forecastday[1].day.maxtemp_f);
                $("#condition2").append(response.forecast.forecastday[1].day.condition.text);


                $("#date3").append(response.forecast.forecastday[2].date);
                $("#tempmin3").append("Low: " + response.forecast.forecastday[2].day.mintemp_f);
                $("#tempmax3").append("High: " + response.forecast.forecastday[2].day.maxtemp_f);
                $("#condition3").append(response.forecast.forecastday[2].day.condition.text);



                reminder();
                reminder2();
                reminder3();
                //Natalie - moved declaring dayonemintemp to be outside of the 'then' function and setting the variable to be within the 'then' function due to errors encountered because 'response' is not defined outside of the 'then' function
                dayonemintemp = response.forecast.forecastday[0].day.mintemp_f;
                daytwocondition = response.forecast.forecastday[1].day.condition.code;
                daythreecondition = response.forecast.forecastday[2].day.condition.code;
            });


        //   var dayonemintemp = response.forecast.forecastday[0].day.mintemp_f;
        function reminder() {
            if (dayonemintemp < 80) {
                $("#message1").append("Don't Forget a jacket!");
            } else {
                $("#message1").append("Don't forget your sunglasses!");
            };
        };
        function reminder2() {
            if (daytwocondition === 1063 || 1180 || 1183 || 1186 || 1189 || 1192 || 1195 || 1198 || 1201 || 1240 || 1246 || 1273 || 1276 || 1243) {
                $("#message2").append("Don't forget your umbrella!");
            } else if (daytwocondition === 1066 || 1114 || 1117 || 1210 || 1213 || 1216 || 1219 || 1222 || 1225 || 1237 || 1255 || 1258 || 1261 || 1264 || 1279 || 1282) {
                $("#message2").append("drive safely");
            } else if (daytwocondition === 1000) {
                $("#message2").append("remember you sunglasses");
            }
        };


        function reminder3() {
            if (daythreecondition === 1063 || 1180 || 1183 || 1186 || 1189 || 1192 || 1195 || 1198 || 1201 || 1240 || 1246 || 1273 || 1276 || 1243) {
                $("#message3").append("Don't forget your umbrella!");
            } else if (daythreecondition === 1066 || 1114 || 1117 || 1210 || 1213 || 1216 || 1219 || 1222 || 1225 || 1237 || 1255 || 1258 || 1261 || 1264 || 1279 || 1282) {
                $("#message3").append("drive safely");
            } else if (daytwocondition === 1000) {
                $("#message3").append("remember you sunglasses");
            }
        };

    };
    //////////////////////END: MATT FUNCTION/////////////////////////


    //////////////////////////////////////////////////////////////
    //////////////////////END FUNCTIONS/////////////////////////
    //////////////////////////////////////////////////////////////



    //////////////////////////////////////////////////////////////
    //////////////////////BEGIN EVENTS////////////////////////////
    //////////////////////////////////////////////////////////////

    // Hide results section on page load
    $("#search-area").on("click", function (event) {
        event.preventDefault();
        city = $("#city-input").val().trim();
        distanceInput = parseInt($("#distance-input").val().trim());
        console.log("Distance (mi)" + distanceInput);
        
        if (city != '' && distanceInput >= 50  && distanceInput <= 200) {
            $("#possible-results").empty();
            $(".destinationCard").empty();
            //convert distance from miles to km - set list of selected ranges because some of the search apis only accept up to 400km
            miToKmConvert();

            console.log(city);
            console.log("Distance (km)" + distance);
            
            //USE GOOGLE API TO GET COORDINATES OF SEARCH CITY + VALIDATION
            googleGeoCode();

            //add to firebase
            database.ref().push({
                city: city,
                distance: distanceInput,
            });
            $("#possible-results").show();
            $("#top-ten").show();
            
           
        }
        else {

            $("#possible-results").empty();
            $(".destinationCard").empty();
            $("#possible-results").show();
            $("#possible-results").append("Please make sure you've entered a valid US city within range (50-200mi)");
        }
    });
    //if user were to click on links of multiple cities
    $(document).on("click", "#multi-Results", citySelect);



    //////////////////////////////////////////////////////////////
    ////////////////////////FIREBASE PULL/////////////////////////
    //////////////////////////////////////////////////////////////
    ////////////// Firebase Storing User Information///////////////
    // Adding Recent searches
    $(".searchBtn").on("click", function (event) {
        // Preventing Duplicates
        event.preventDefault();
        // clear text-boxes
        $("#cityInput").val("");
        $("#distanceInput").val("");
    });

    database.ref().limitToLast(5).on("child_added", function (childSnapshot) {
        console.log(childSnapshot.val());
        // assign firebase variables to snapshots.
        var fbCity = childSnapshot.val().city;
        var fbDistance = childSnapshot.val().distance;

        // Append train info to table on page
        $("#last-searches").prepend("<p id='firebase-return'>" + "Within "
            + fbDistance + " Miles of " + v.titleCase(fbCity)
            + "</p>");
    });

    //////////////////////////////////////////////////////////////
    ////////////////////////END: FIREBASE PULL////////////////////
    //////////////////////////////////////////////////////////////


    //when the user selects one of the cities returned
    $(document).on("click", ".destinationCities", setDestination);

    //////////////////////////////////////////////////////////////
    ////////////////////////END EVENTS////////////////////////////
    //////////////////////////////////////////////////////////////
});
