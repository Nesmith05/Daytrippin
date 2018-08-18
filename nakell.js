function zomato(){
    var cities = {
      "async": true,
      "crossDomain": true,
      "url": "https://developers.zomato.com/api/v2.1/cities?" + destinationLat +"&"+ destinationLng,
      "method": "GET",
      "headers": {
        "user-key": "c7288644a7a1a0bb320b8e22c80479c6",
      }
    }
    
    $.ajax(cities).done(function (response) {
     // console.log(response);
      var cityID = response.location_suggestions[0].id;
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
        console.log(response.restaurants);
        var list=response.restaurants;
        list.forEach(element => {
          console.log(element.restaurant.name)
    
          $(".table > tbody").append("<tr><td>" +  element.restaurant.name+ "</td><td>" + element.restaurant.location.address + "</td><td>"  + element.restaurant.cuisines );
        });
    
      //   for(var restaurant in response){
      //     console.log(restaurant);
      
      //   }
      });
    });
    };
        