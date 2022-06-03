
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

var confirmLocation = function(locationsArray) {
    /* handle situtations where there are multiple results by surfacing a modal and prompting the user to choose a location */

    // get the form body element and clear its contents
    var formBody = confirmLocationModal.querySelector("#confirm-location-form-body");
    formBody.innerHTML = "";

    // set up the modal
    for (let i=0; i < locationsArray.length; i++) {

        // create the container
        var searchResultContainer = document.createElement("div");
        searchResultContainer.classList.add("search-result-item", "uk-form-controls", "uk-margin");

        // create the radio button
        var searchResultInput = document.createElement("input");
        searchResultInput.setAttribute("type", "radio");
        searchResultInput.setAttribute("name", "search-result");
        searchResultInput.setAttribute("id", "search-result-" + i);
        searchResultInput.setAttribute("data-location", JSON.stringify(locationsArray[i]));
        searchResultContainer.appendChild(searchResultInput);

        // create the label
        var modalDisplayName = defineDisplayName(locationsArray[i]);
        var searchResultLabel = document.createElement("label");
        searchResultLabel.innerText = modalDisplayName;
        searchResultLabel.setAttribute("for", "search-result-" + i);
        searchResultContainer.appendChild(searchResultLabel);

        // add the container to the form
        formBody.appendChild(searchResultContainer);
    }

    // display the modal
    UIkit.modal("#confirm-location-modal").show();
}

var saveLocation = function(location) {
    /* add the display names and coordinates for each search to localStorage */

    // set the displayName value
    displayName = defineDisplayName(location);

    // if the term is already in the search history, remove it from the arrays and DOM
    if (searchTerms.includes(displayName)) {

        // remove the display name from the search arrays
        var index = searchTerms.indexOf(displayName);
        searchTerms.splice(index, 1);
        searchHistory.splice(index, 1);

        // remove the element
        var dataLocationName = displayName.split(" ").join("+");
        var searchHistoryItem = searchHistoryItems.querySelector("[data-location-name='" + dataLocationName + "']");
        searchHistoryItems.removeChild(searchHistoryItem);
    }

    // define the object to save
    var cityData = {
        displayName: displayName,
        coords: location.latLng
    };

    // update the search history arrays
    if (searchTerms.length == 5) {

        // remove the last element if the array has 5 items
        searchTerms.splice(0, 1);
        searchHistory.splice(0, 1);

        // also remove it from the DOM
        var fifthChild = searchHistoryItems.childNodes[4];
        searchHistoryItems.removeChild(fifthChild);
    }
    searchTerms.push(displayName);
    searchHistory.push(cityData);

    // update localStorage
    localStorageHistory = {
        searchTerms: searchTerms,
        searchHistory: searchHistory
    }
    localStorage.setItem("searchHistory", JSON.stringify(localStorageHistory));

    // update the search history
    createSearchHistoryElement(cityData);
}

var getCoordinates = function(searchTerm) {
    /* use the mapquest API to geocode the location based on the search terms */

    searchTerm = searchTerm.split(" ").join("+");
    var geocodingApiUrl = "https://www.mapquestapi.com/geocoding/v1/address?key=ZJUiXdZZzhsEe05eUGvmmAsIoTPvQOHn&location=" + searchTerm;
    fetch(geocodingApiUrl).then(function(res) {
        if (res.ok) {
            res.json().then(function(data) {

                // find one location to use to generate the weather
                var locations = data.results[0].locations;
                if (locations.length == 1) {
                    saveLocation(locations[0]);
                    getWeather(locations[0].latLng);
                } else {
                    confirmLocation(locations);  // prompt the user to confirm the location
                }
            })
        } else {
            console.log("Couldn't get the coordinates from the mapquest API: ", res.text);
        }
    });
}

var getWeather = function(coords) {
    /* make the api call to get the weather based on a set of coordinates {lat: x, lng: y} */

    var weatherApiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + coords.lat + "&lon=" + coords.lng + "&units=imperial&exclude=minutely,hourly&appid=1ca21b13300483dc1e57d37215dcac93";
    fetch(weatherApiUrl).then(function(res){
        if (res.ok) {
            res.json().then(function(data){
                displayWeather(data);  // display the current weather and forecast
            })
        } else {
            console.log("Couldn't get the weather data from the openweathermap API: ", res.text);
        }
    })
}

var createSearchHistoryElement = function(searchHistoryData) {
    /* helper function to create search history card */
    
    // display the header
    var searchHistoryHeader = document.querySelector("#search-history-title");
    searchHistoryHeader.style.display = "block";

    // create the card for the location
    var newCard = document.createElement("div");
    newCard.classList = "uk-card-default uk-card uk-card-body uk-card-hover uk-card-small uk-text-center search-history-item";
    newCard.textContent = searchHistoryData.displayName;
    newCard.setAttribute("data-location-name", searchHistoryData.displayName.split(" ").join("+"));
    searchHistoryItems.insertBefore(newCard, searchHistoryItems.firstChild);
}

var displaySearchHistory = function() {
    /* display search history cards if there's a search history in localStorage */

    var loadedSearchHistory = JSON.parse(localStorage.getItem("searchHistory"));
    if(loadedSearchHistory) {
        searchTerms = loadedSearchHistory.searchTerms;
        searchHistory = loadedSearchHistory.searchHistory;
        for (var i=0; i < searchTerms.length; i++) {
            if (!searchTerms.includes(searchHistory[i])) {
                createSearchHistoryElement(searchHistory[i]);  // add a search term to the search history panel
            }
        }
    }
}
