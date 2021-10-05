var inputCity = $("#citySearch");
var searchBtn = $("#searchBtn");
var resetBtn = $("#resetBtn");
var cityDate = $("#cityDate");
var cityTemp = $("#cityTemp");
var cityWind = $("#cityWind");
var cityHum = $("#cityHum");
var cityUV = $("#cityUV");
var leftCol = $("#leftCol");
var forecastRow = $("#forecast");
var root = "https://api.openweathermap.org/";
var apiKey = "a852a215ebbd2a19b987e59d3f679619";
var week = [];
var cities = [];

if(localStorage.getItem("cities") == null){
    storecities();
}
else{
    getcities();
}
displayLocalCities();

function displayLocalCities(){
    for(var i = 0; i < cities.length; i++){
        var addCity = $("<button class='isCity m-1'></button>").text(cities[i]);
        addCity.attr('id', cities[i]);
        leftCol.append(addCity);
    }
}

function storecities(){
    localStorage.setItem("cities", JSON.stringify(cities));
}

function getcities(){
    var tempCities = JSON.parse(localStorage.getItem("cities"));
    console.log(tempCities);
  
    if(tempCities !== null || tempCities !== undefined){
      cities = tempCities
    }
}

function resetCities(){
    localStorage.clear();
    cities = [];
    $("button").remove(".isCity");
    for(var i=0; i < 5; i++){
        forecastRow.children().eq(i).empty();
    }
    cityDate.text("");
    cityTemp.text("");
    cityWind.text("");
    cityHum.text("");
    cityUV.text("");
    cityUV.css("background-color", "white");
}

function getWeather(city){
    fetch(root + "data/2.5/weather?q=" + city + "&appid=" + apiKey).then(function(response){
        if(response.status === 404){
            alert("Enter a real city");
        }else{
            var addCity = $("<button class='isCity m-1'></button>").text(city);
            addCity.attr('id', city);
            leftCol.append(addCity);
            cities.push(city);
            storecities();
        }
        return response.json();
    })
    .then(function(data){
        console.log(data);
        cityDate.text( city + " " + moment().format("MM/DD/YYYY"));
        cityTemp.text("Temp: " + ((data.main.temp -273.15) * (9/5 ) +32).toFixed(2));
        cityWind.text("Wind: " + data.wind.speed);
        cityHum.text("Humidity: " + data.main.humidity + "%");
        fetch(root + "data/2.5/onecall?lat=" + data.coord.lat + "&lon=" + data.coord.lon + "&exclude=hourly,daily&appid=" + apiKey).then(function(response){
            return response.json();
        })
        .then(function(data){
            cityUV.text("UV Index: " + data.current.uvi);
            if(data.current.uvi <= 2){
                cityUV.css("background-color", "green");
            }
            else if(data.current.uvi <=8){
                cityUV.css("background-color", "yellow");
            }
            else{
                cityUV.css("background-color", "red");
            }

        })
    })
    fetch(root + "data/2.5/forecast?q=" + city + "&appid=" + apiKey).then(function(response){
        return response.json();
    })
    .then(function(data){
        console.log(data);
        week = [];
        for(var i=0; i < 5; i++){
            var day = {
                dayNum: i,
                temp: ((data.list[i].main.temp -273.15) * (9/5 ) +32).toFixed(2),
                wind: data.list[i].wind.speed,
                humidity: data.list[i].main.humidity,
                weatherIcon: data.list[i].weather[0].Icon
            }
            week.push(day);
            forecastRow.children().eq(i).empty();
        }
        
        for(var i=0; i < 5; i++){
            var date = $("<h3></h3>").text(moment().add(i + 1,'days'));
            var status = $("<h3></h3>").attr("src", week[i].weatherIcon);
            console.log(week[i].weatherIcon);
            var temp = $("<h3></h3>").text(week[i].temp);
            var wind = $("<h3></h3>").text(week[i].wind);
            var humidText = $("<h3></h3>").text(week[i].humidity);
            forecastRow.children().eq(i).append(date, status, wind, temp, humidText);
        }
    })
}

searchBtn.on("click", function(){
    console.log(inputCity.val());
    getWeather(inputCity.val());
    inputCity.text = "";
})

resetBtn.on("click", function(){
    resetCities();
})

leftCol.on("click", ".isCity", function(event){
    console.log($(this).text());
    getWeather($(this).text());
})