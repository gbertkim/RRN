'use strict'
//////////All things maps

const authKey = config.AUTH_KEY;
const secretKey = config.GOOGLE_API;
let imageFinal = [];
let locationInfo = [];
let markers = [];
let imageId;
let map;
let flightPath;

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

let STORE = [{
    date: 'May 3, 2019',
    venue: "High Watt",
    city: 'Nashville, TN',
    location: {lat: 36.1530, lng: -86.7806},
    link: 'https://www.eventbrite.com/e/run-river-north-tickets-55663808951?aff=aff0bandsintown&appId=wf_ubzr.ehaevireabegu.pbz&comeFrom=242&artist_event_id=100802634',
    image: 'https://media-cdn.tripadvisor.com/media/photo-s/0f/c8/b4/e9/the-high-watt-has-a-225.jpg'
    },{
    date: 'May 4, 2019',
    venue: "Neighborhood Theatre",
    city: "Charlotte, NC",
    location: {lat: 35.2474, lng: -80.804},
    link: 'https://www.ticketfly.com/purchase/event/1825144/tfly?utm_medium=%5BLjava.lang.String%3B%4057891044&skinName=tfly',
    image: 'http://photos.cinematreasures.org/production/photos/167026/1462716639/large.jpg?1462716639'
    },{
    date: 'May 7, 2019',
    venue: "Union Stage",
    city: 'Washington, DC',
    location: {lat: 38.8787,lng: -77.0241},
    link: 'https://www.ticketfly.com/purchase/event/1823442/tfly?utm_medium=%5BLjava.lang.String%3B%406d48ffee&skinName=tfly',
    image: 'https://cdn0.weddingwire.com/emp/fotos/1/6/6/7/8/9/1507555083412-union-stage-3.jpg'
}];

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
//Creates a way to target each marker
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
        addMarker(imageFinal[i].location, icon);
        locationInfo.push(imageFinal[i].location);
    }
}

// Create markers for where they last were
function currentLocation(icon){
    addMarker(imageFinal[imageFinal.length-1].location, icon)
    locationInfo.push(imageFinal[imageFinal.length-1].location);
}

// Create markers for future tour dates
function futureLocations(icon){
    for (let i =0; i < STORE.length; i++){
        addMarker(STORE[i].location, icon);
        locationInfo.push(STORE[i].location);
    }
}


function uploadPicture(num){
    if (num+1>imageFinal.length){
        let storeNum = num-imageFinal.length
        $('#imageRight').attr('src',`${STORE[storeNum].image}`);
        $('#imageDescription').html(`
            <div class="listBox">
                <ul class="list">
                    <li>Date: ${STORE[storeNum].date}</li>
                    <li>Venue: ${STORE[storeNum].venue}</li>
                    <li>Location: ${STORE[storeNum].city}</li>
                    <li>Ticket: <a class="tixLink" href="${STORE[storeNum].link}">Link</a></li>
                </ul>
            </div>
            <div class="arrowBox">
                <a href="#full">
                    <div id="arrow"></div>
                </a>
            </div>
        `)
        arrowMaker();
    } else {
        $('#imageRight').attr('src',`${imageFinal[num].url}`);
        $('#imageDescription').html(`
            <div class="listBox">
                <ul class="list">
                    <li>Date: ${imageFinal[num].time}</li>
                    <li>Location: ${imageFinal[num].city}</li>
                    <li>Description: ${imageFinal[num].text}</li>
                </ul>
            </div>
            <div class="arrowBox">
                <a href="#full">
                    <div id="arrow"></div>
                </a>
            </div>
        `)
        arrowMaker();
    }
}

function arrowMaker(){
    $('.arrowBox').on('click', function(event){
        event.preventDefault();
        console.log('Arrow Clicked');
        $('#infoContainer').slideUp();
    });
}

// Template for making markers
function addMarker(coords, icon){ 
    markers.push(new google.maps.Marker({
            position: coords,
            map: map,
            icon: icon,
            title: markers.length.toString(),
            optimized: false
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

function clearFlight(){
    flightPath.setMap(null);
}

// GET request to instagram 
function instagramAPI(){
    const instagramURL = 'https://api.instagram.com/v1/users/self/media/recent/?access_token=';
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
        return image.tags == 'faketour2019';
    });
    console.log(filtered);
    // Sort responses by date
    filtered.sort(function(a,b){
        return a.caption.created_time - b.caption.created_time;
    });

    // Create an array with only needed information
    for (let i=0; i<filtered.length; i++){
        imageFinal[i] = {
            url: filtered[i].images.standard_resolution.url,
            time: new Date(filtered[i].caption.created_time * 1000).toDateString(),
            text: filtered[i].caption.text,
            city: filtered[i].location.name,
            location: {
                lat: filtered[i].location.latitude,
                lng: filtered[i].location.longitude
            }
        };
    }
    var date = new Date(filtered[1].caption.created_time * 1000);
    console.log(filtered[1].caption.created_time);
    console.log(date);
    console.log(imageFinal);
    // Call map making function
    initMap();
}

///////////Form Load
function loadForm(){
    appendKeys();
    $('#infoContainer').hide();
    instagramAPI();
    $('#dropMarkers').on('click', '#drop', function(){
        console.log("Searching Instagram API");
        drop();    
    });
}

 // Appended on javascript side to hide key
function appendKeys(){
    $('body').append(`
    <script async defer src=https://maps.googleapis.com/maps/api/js?key=${secretKey}>
    </script>`
    );
}

loadForm();

// animation to drop pin in order
// set last pin a different color
// set a line that follows
// change picture on hover