// function showResults () {


    var token = "&token=7RI4EOUJ2KE4ZQYMVVTZ";

    var queryURL = "https://www.eventbriteapi.com/v3/events/search/?location.address=charlotte" + token;


    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {

        console.log(response.events);
        var categories = response.events[i].category_id;

        if (categories != "101", "112" ) {
    
            for (i=0; i < 10; i++) {
                var eventName = response.events[i].name.text;
                console.log(eventName);
                var eventStart = response.events[i].start.local;
                console.log(moment(eventStart).format("llll"));
                console.log(eventStart);
                var eventEnd = response.events[i].end.local; //convert military time
                console.log(eventEnd);
                var eventDesc = response.events[i].description.text;
                console.log(v.prune(eventDesc, 150));
                var uRl = response.events[i].url;
                console.log(uRl);
                var elink = $("<a href=" + uRl +">Click</a>");
                console.log(elink);
            $("#body").append("<tr><td>" + "<a href=" + uRl +">" + eventName + "</a>" + "<td>" + moment(eventStart).format("llll") + " - " + moment(eventEnd).format("llll") + "<td>" +v.prune(eventDesc, 150));
            //   $("<a>" + elink )
               
                console.log(categories);
                if (categories == "103", "101") {
                    response.events[i].hide();
                }
            }
        }

    });
// }
// "101", "110", "113", "105", "104", "108", "107", "102", "109", "111", "114", "115", "116", "117", "118", "119", "199", "120"