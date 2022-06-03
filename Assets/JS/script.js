
// load the dom elements
var searchInput = document.querySelector("#search-input");
var searchButton = document.querySelector("#search-button");
var confirmLocationModal = document.querySelector("#confirm-location-modal");
var searchHistoryItems = document.querySelector("#search-history-items");
var currentWeatherCity = document.querySelector("#current-weather-city");
var currentWeatherData = document.querySelector("#current-weather");
var forecastElement = document.querySelector("#forecast");

// define other variables
var displayName;
var searchTerms = [];
var searchHistory = [];

var defineDisplayName = function(location) {
    /* display the location as city, country */

    // define the location components
    var city = location.adminArea5;
    var country = location.adminArea1;

    // construct an array of the location components
    var tempDisplayName = [];
    if (city) {
        tempDisplayName.push(city);
    }
    if (country) {
        tempDisplayName.push(country);
    }

    // return the joined array so that we don't need to deal with extra commas
    return tempDisplayName.join(", ");
}

