'use strict'
//////////Global Variables
const authKey = config.AUTH_KEY;
const secretKey = config.GOOGLE_API;
let imageFinal = [];
let locationInfo = [];
let markers = [];
let imageId;
let map;
let flightPath;
let filteredSTORE;

// Icon URLS
let flag = {
    url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
} 
let green = {
    url: 'https://www.google.com/mapfiles/arrow.png',
}
let rrn = {
    url: 'https://i.ibb.co/wpX8d1r/Webp-net-resizeimage-1.png',
}

// Array for future concert days
let STORE = [{
    date: 'May 3, 2022',
    venue: "High Watt",
    city: 'Nashville, TN',
    location: {lat: 36.1530, lng: -86.7806},
    link: 'https://www.eventbrite.com/e/run-river-north-tickets-55663808951?aff=aff0bandsintown&appId=wf_ubzr.ehaevireabegu.pbz&comeFrom=242&artist_event_id=100802634',
    image: 'https://media-cdn.tripadvisor.com/media/photo-s/0f/c8/b4/e9/the-high-watt-has-a-225.jpg'
    },{
    date: 'May 4, 2022',
    venue: "Neighborhood Theatre",
    city: "Charlotte, NC",
    location: {lat: 35.2474, lng: -80.804},
    link: 'https://www.ticketfly.com/purchase/event/1825144/tfly?utm_medium=%5BLjava.lang.String%3B%4057891044&skinName=tfly',
    image: 'https://photos.cinematreasures.org/production/photos/167026/1462716639/large.jpg?1462716639'
    },{
    date: 'May 7, 2022',
    venue: "Union Stage",
    city: 'Washington, DC',
    location: {lat: 38.8787,lng: -77.0241},
    link: 'https://www.ticketfly.com/purchase/event/1823442/tfly?utm_medium=%5BLjava.lang.String%3B%406d48ffee&skinName=tfly',
    image: 'https://cdn0.weddingwire.com/emp/fotos/1/6/6/7/8/9/1507555083412-union-stage-3.jpg'
}];

let concerts = [{
    city: "San Diego, CA",
    location: {lat: 33.035599, lng: -117.064537}
    },{
    city: "Los Angeles, CA",
    location: {lat: 34.052240, lng: -118.243340}
    },{
    city: "Portland, OR",
    location: {lat: 45.561150, lng: -122.676000}
    },{
    city: "New Orleans, LA",
    location: {lat: 30.128820, lng: -91.829770}
}];

// Function to remove concert dates if a certain date has passed using filter
function compareDates(arr){
    let today = new Date();
    today.setHours(0,0,0,0);
    filteredSTORE = STORE.filter(function(concert){
        if (new Date(concert.date) > today){
            return true;
        };
    });
}

function initMap() {
    // add map with center and zoom
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 39.8283, lng: -98.5795}, 
        zoom: 3
    });
    $('#mapKeys').html(`
        <ul id="mapIcons">
            <li>Past Dates = <img src=${flag.url} alt="Flag Icon" width="15" height="20"></li>
            <li>Current Location = <img src=${rrn.url} alt="Run River North Icon" width="15" height="20"></li>
            <li>Future Dates = <img src=${green.url} alt="Green Arrow Icon" width="15" height="20"</li>
        </ul>
    `)
}

// All the functions that are to occur when "track" is clicked
function drop() {
// Clear any previous markers
    clearMarkers();
    if (flightPath != undefined){
        clearFlight();
    }
    pastLocations(flag);
    setTimeout(function(){
        currentLocation(rrn);
    }, 500);
    setTimeout(function(){
        futureLocations(green);
        addListeners();
        // gives all images the id of "markerLayer" that can be called on CSS
        let myoverlay = new google.maps.OverlayView();
        myoverlay.draw = function() {
            this.getPanes().markerLayer.id='markerLayer';
        };
        myoverlay.setMap(map);
        makePath();
    }, 1000);
    setTimeout(function(){
        // gives accessilibity to markers by adding a tab index and 'enter' listener
        // google api does not create accessible markers
        for (let i = 0; i<markers.length; i++){
            $('#markerLayer img').eq(i).parent().attr('title',`${i}`).attr('tabindex','0').addClass('groupMarkers');
        }
        $('.groupMarkers').on('keypress', function(e){
            if(e.which==13) {
                let thisTitle = Number($(this).attr('title'));
                $(this).addClass('bounce').siblings().removeClass('bounce');
                $(`#markerLayer img[src='https://i.ibb.co/wpX8d1r/Webp-net-resizeimage-1.png']`).css('animation','none');
                imageId = thisTitle;
                uploadPicture(imageId);
                $('#infoContainer').slideDown();
            }
        });
    }, 1500);
    console.log(locationInfo);
}

//function for flight path    
function makePath(){
    flightPath = new google.maps.Polyline({
        path: locationInfo,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });
    flightPath.setMap(map);
}

//Creates a listeners for each marker
function addListeners(){
    for (let i = 0; i<markers.length; i++){
        markers[i].addListener('click', function(){
            let thisTitle = Number(this.title);
            $('#markerLayer img').eq(thisTitle).parent().addClass("bounce").siblings().removeClass("bounce");
            $(`#markerLayer img[src='https://i.ibb.co/wpX8d1r/Webp-net-resizeimage-1.png']`).css('animation','none');
            imageId = thisTitle;
            console.log(thisTitle);
            uploadPicture(imageId);
            $('#infoContainer').slideDown();
        });
    }
}

// Create markers for past dates
function pastLocations(icon){
    for (let i = 0; i < imageFinal.length-1; i++) {
        addMarker(imageFinal[i].location, icon, i);
        locationInfo.push(imageFinal[i].location);
    }
}

// Create marker for where they last were
function currentLocation(icon){
    addMarker(imageFinal[imageFinal.length-1].location, icon, 100);
    locationInfo.push(imageFinal[imageFinal.length-1].location);
}

// Create markers for future tour dates
function futureLocations(icon){
    for (let i =0; i < filteredSTORE.length; i++){
        addMarker(filteredSTORE[i].location, icon, i);
        locationInfo.push(filteredSTORE[i].location);
    }
}

// Function to upload pictures using jquery
function uploadPicture(num){
    if (num+1>imageFinal.length){
        let storeNum = num-imageFinal.length
        $('#imageRight').attr('src',`${filteredSTORE[storeNum].image}`);
        $('#imageDescription').html(`
            <div class="listBox">
                <ul class="list">
                    <li class="listCat">Date:<p class="imageDetails">${filteredSTORE[storeNum].date}</p></li>
                    <li class="listCat">Venue:<p class="imageDetails">${filteredSTORE[storeNum].venue}</p></li>
                    <li class="listCat">Location:<p class="imageDetails">${filteredSTORE[storeNum].city}</p></li>
                    <li class="listCat">Ticket:<p class="imageDetails"><a class="tixLink" href="${filteredSTORE[storeNum].link}" target="_blank">Link</a></p></li>
                </ul>
            </div>
            <div class="arrowBox">
                <div id="clickArrow">
                    <a href='#' id="arrow"></a>
                </div>
            </div>
        `)
        arrowMaker();
    } else {
        $('#imageRight').attr('src',`${imageFinal[num].url}`);
        $('#imageDescription').html(`
            <div class="listBox">
                <ul class="list">
                    <li class="listCat">Date:<p class="imageDetails"> ${imageFinal[num].time}</p></li>
                    <li class="listCat">Location:<p class="imageDetails">${imageFinal[num].city}</p></li>
                    <li class="listCat">Description: <p class="imageDetails">${imageFinal[num].text}</p></li>
                </ul>
            </div>
            <div class="arrowBox">
                <div id="clickArrow">
                    <a href='#' id="arrow"></a>
                </div>
            </div>
        `)
        arrowMaker();
    }
}

function arrowMaker(){
    $('#arrow').on('click', function(event){
        event.preventDefault();
        console.log('Arrow Clicked');
        $('#infoContainer').slideUp();
    });
}

// Template for making markers
function addMarker(coords, icon, num){ 
    markers.push(new google.maps.Marker({
            position: coords,
            map: map,
            icon: icon,
            title: markers.length.toString(),
            optimized: false,
            zIndex: num
    }));
    console.log(markers.length.toString());
}


// Function to clear previous markers
function clearMarkers(){
    for (let i=0; i<markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
    locationInfo = [];
}

// Function to clear flight paths
function clearFlight(){
    flightPath.setMap(null);
}

// GET request to instagram 
function instagramAPI(){
    const instagramURL = 'https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&access_token=';
    const url = instagramURL + authKey;
    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => displayResults(responseJson))
        .catch(err => {
        $('#errorMessage').text(`Something went wrong: ${err.message}`);
        });
}

// Filter the results from GET request
function displayResults(responseJson){
    // Filter reponse from instagram to responses with the correct hashtag
    console.log(responseJson);
    let filtered = responseJson.data.filter(function(image){
        return image.caption == '#faketour2019';
    });
    // Sort responses by date
    filtered.sort(function(a,b){
        return a.timestamp - b.timestamp;
    });
    // Create an array with only needed information
    for (let i=0; i<filtered.length; i++){
        imageFinal[i] = {
            url: filtered[i].media_url,
            time: new Date(filtered[i].timestamp).toDateString(),
            text: filtered[i].caption,
            city: concerts[i].city,
            location: {
                lat: concerts[i].location.lat,
                lng: concerts[i].location.lng
            }
            // OLD INSTGRAM API - DEPRECATED
            // city: filtered[i].location.name,
            // location: {
            //     lat: filtered[i].location.latitude,
            //     lng: filtered[i].location.longitude
            // }
        };
    }
    console.log(imageFinal);
    // Call map making function
    initMap();
}

// Appended on javascript side to hide key
function appendKeys(){
    $(`<script async defer src=https://maps.googleapis.com/maps/api/js?key=${secretKey}>
    </script>`).insertBefore($('#configScript'));
}

///////////Form Load
function loadForm(){
    appendKeys();
    compareDates(STORE);
    $('#infoContainer').hide();
    instagramAPI();
    $('#dropMarkers').on('click', '#drop', function(){
        console.log("Searching Instagram API");
        $('#track').fadeOut(1500);
        drop();    
    });
    $('#logo').on('click', function(){
        clearMarkers();
        clearFlight();
        $('#infoContainer').slideUp();
        $('#track').fadeIn(1000);
    })
}

loadForm();