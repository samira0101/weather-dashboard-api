
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

