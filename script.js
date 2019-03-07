'use strict'
//   fetch(url)
//     .then(response => {
//       if (response.ok) {
//         return response.json();
//       }
//       throw new Error(response.statusText);
//     })
//     .then(responseJson => displayResults(responseJson, maxResults))
//     .catch(err => {
//       $('#errorMessage').text(`Something went wrong: ${err.message}`);
//     });
// }
// //if responseJson.data === empty
// function displayResults(responseJson){
//   let item = responseJson.total; //// .data //// .total can actually have a state with no parks
//   if(item === 0){ //// item === null 
//     $('#errorMessage').text('Re-check state abbreviations and separate states with single spaces only');
//     console.log('hi');
//   }
//   console.log(responseJson);
//   responseJson.data.forEach(function(park){
//     $('#parksList').append(`<li class="parkName"><h2>${park.fullName}</h2><p class="parkDescription">${park.description}</p><a class="parkURL" href="${park.url}">${park.url}</a></li>`);
//   });
// }

function loadForm(){
    $('#quizStart').on('click', '#startButton', function(){
        console.log("hello");    
    });
}

loadForm();