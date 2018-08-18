function zomato(){
    var cities = {
      "async": true,
      "crossDomain": true,
      "url": "https://developers.zomato.com/api/v2.1/cities?lat=" + destinationLat +"&lon="+ destinationLng,
      "method": "GET",
      "headers": {
        "user-key": "c7288644a7a1a0bb320b8e22c80479c6",
      }
      
    }
    
    $.ajax(cities).done(function (response) {
    //  console.log(response.location_suggestions[0].id);
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
        var list=response.restaurants;
        list.forEach(element => {
          // console.log(element.restaurant.name)
    
          $(".table > tbody").append("<tr><td>" +  element.restaurant.name+ "</td><td>" + element.restaurant.location.address + "</td><td>"  + element.restaurant.cuisines );
        });
    
      //   for(var restaurant in response){
      //     console.log(restaurant);
      
      //   }
      });
    });
    };
    
    
    
    zomato();
    