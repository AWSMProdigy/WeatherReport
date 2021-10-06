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
var currentDay = $(".currentDay");
var root = "https://api.openweathermap.org/";
var apiKey = "a852a215ebbd2a19b987e59d3f679619";
var week = [];
var cities = [];

//Get cities from local storage if they exist
if(localStorage.getItem("cities") == null){
    storecities();
}
else{
    getcities();
}
displayLocalCities();

//Display all cities from local storage as buttons
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
  
    if(tempCities !== null || tempCities !== undefined){
      cities = tempCities
    }
}

//Clear local storage and remove all cities from the array and all info from the screen
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
    currentDay.css("display", "none");

}

//Takes a city and uses the weather api to find weather info about it, and then displays it
function getWeather(city){
    fetch(root + "data/2.5/weather?q=" + city + "&appid=" + apiKey).then(function(response){
        if(response.status === 404 || response.status === 400){
            alert("Enter a real city");
        }else if(!cities.includes(city)){
            var addCity = $("<button class='isCity m-1'></button>").text(city);
            addCity.attr('id', city);
            leftCol.append(addCity);
            cities.push(city);
            storecities();
        }
        return response.json();
    })
    .then(function(data){
        //Get weather info for today
        currentDay.css("display", "block");
        var currentStat = $("<img></img>").attr("src", "http://openweathermap.org/img/wn/" + data.weather[0].icon + "@2x.png");
        cityDate.text( city + " " + moment().format("MM/DD/YYYY"));
        cityDate.append(currentStat);
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
        //Get weather information for the forecast and clear any forecast data present
        for(var i=0; i < 5; i++){
            var day = {
                dayNum: i,
                temp: ((data.list[i].main.temp -273.15) * (9/5 ) +32).toFixed(2),
                wind: data.list[i].wind.speed,
                humidity: data.list[i].main.humidity,
                weatherIcon: data.list[i].weather[0].icon
            }
            week.push(day);
            forecastRow.children().eq(i).empty();
        }
        
        //Place forecast info into forecast cards
        for(var i=0; i < 5; i++){
            var date = $("<h3></h3>").text((moment().add(i + 1,'days')).format("M/DD/YYYY"));
            var status = $("<img></img>").attr("src", "http://openweathermap.org/img/wn/" + week[i].weatherIcon + "@2x.png");
            var temp = $("<h3></h3>").text("Temp: " + week[i].temp);
            var wind = $("<h3></h3>").text("Wind: " + week[i].wind);
            var humidText = $("<h3></h3>").text("Humidity: " + week[i].humidity);
            forecastRow.children().eq(i).append(date, status, wind, temp, humidText);
        }
    })
}


//Listeners for buttons
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