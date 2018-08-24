require("dotenv").config();
var keys = require('./keys');
var youSearch = require('youtube-search');
var request = require('request');
var Spotify = require('spotify-web-api-node');
var fs = require('fs');
var inquirer = require("inquirer");

//___________________________Youtube_________________________

//Setting up youtube constructor... Not really necessary but just trying to make it parallel to the twitter instructions 
function Youtube(key) {
    this.opts = {
        maxResults: 1,
        key: key
    };
    this.search = function (input) {
        youSearch(input, this.opts, function (err, results) {
            if (err) return console.log(err);
            for (var i in results) {
                var result = results[i]
                console.log("Here is a video titled: " + result.title + "\nLink: " + result.link + "\n")
                logThis("Here is a video titled: " + result.title + "\nLink: " + result.link + "\n")
                logThis("\n________________________________________________________________\n")
            }
        })
    }
}
var youtube = new Youtube(keys.youtube)


//___________________________Spotify_________________________


var SpotifyWebApi = require('spotify-web-api-node');
 
// credentials are optional
var spotifyApi = new SpotifyWebApi({
  clientId: 'e197c09b8ab74764afd7eedc0cd41fb8',
  clientSecret: 'd433912e4712447db26028a0bce83036',
  redirectUri: 'http://www.example.com/callback'
});
spotifyApi.searchTracks('Love')
  .then(function(data) {
    console.log('Search by "Love"', data.body);
  }, function(err) {
    console.error(err);
  });
//Doesn't work yet
// var spotify = new Spotify(keys.spotify)
// function SpotifyIt() {
//     spotify.searchTracks("Love").then(function (data) {
//         console.log('Search by "Love"', data.body);
//     }, function (err) {
//         console.log(err)
//     });
// }

//___________________________OMDB_________________________
var omdbParam = {
    apikey: "trilogy"
}
var movie = []

var ombdURL = "http://www.omdbapi.com/?"

function requestMovie(title) {
    var t = title || "Mr.Nobody"
    omdbParam.t = t
    request(ombdURL + "apikey=" + omdbParam.apikey + "&t=" + omdbParam.t, function (error, response, body) {
        if (error) {
            console.log(error)
        } else if (response && response.statusCode === 200) {
            var data = JSON.parse(body)
            if (!data.Title) {
                console.log("Sorry, I couldn't find this movie...")
                return
            } else {
                console.log("\nHere is some information I found about the movie " + data.Title + ":\n")
            }
            movie.push("Title: " + data.Title)
            movie.push("Year: " + data.Year)
            if (data.Ratings) {
                movie.push("IMDB Rating: " + data.Ratings[0].Value)
                movie.push("Rotten Tomatoes Rating: " + data.Ratings[1].Value)
            }
            movie.push("Country: " + data.Country)
            movie.push("Language: " + data.Language)
            movie.push("Plot: " + data.Plot)
            movie.push("Actors: " + data.Actors)
            movie.push("________________________________________________")
            console.log(movie.join("\n"))
            logThis(movie.join("\n"))
            logThis("\n________________________________________________________________\n")

        }
    })
}
//___________________________FS_________________________
function logThis(data) {
    fs.appendFile("log.txt", data, function (err) {
        if (err) {
            return console.log(err);
        }
    });

}
var readFromFile = new Promise(function (resolve, reject) {
    fs.readFile("random.txt", "utf8", function (error, data) {
        if (error) {
            return console.log(error)
        }
        fileData = data.split(',')
        resolve(data.split(','))
    })
})

//___________________________User Interaction_________________________
function commands(userInput) {
    var userAction = userInput[0]
    logThis(userInput + "\n")
    if (userAction === "search-youtube") {
        var searchInput = userInput.slice(1).join(' ') || "husky says I love you"
        youtube.search(searchInput)
    }
    if (userAction === "spotify-this-song") {
        console.log("This feature is not yet available")
    }
    if (userAction === "movie-this") {
        var movieTitle = userInput.slice(1).join(' ')
        requestMovie(movieTitle)
    }
    if (userAction === "do-what-it-says") {
        readFromFile.then(function (data) {
            commands(data)
        })
    }
    if (!userAction) {
        inquirer.prompt({
            type: "list",
            message: "What would you like me to do?",
            name: "action",
            choices: ["search-youtube", "spotify-this-song", "movie-this", "do-what-it-says"]
        }).then(function (response) {
            var action = [response.action]
            if (response.action === "search-youtube") {
                inquirer.prompt({
                    type: "input",
                    message: "What would you like me to search on youtube?",
                    name: "searchInput"
                }).then(function (response) {
                    action.push(response.searchInput)
                    commands(action)
                })
            }
            if (response.action === "movie-this") {
                inquirer.prompt({
                    type: "input",
                    message: "What movie would you like to get information about?",
                    name: "searchInput"
                }).then(function (response) {
                    action.push(response.searchInput)
                    commands(action)
                })
            }
            if (response.action === "spotify-this-song") {
                inquirer.prompt({
                    type: "input",
                    message: "What song would you like to Spotify?",
                    name: "searchInput"
                }).then(function (response) {
                    action.push(response.searchInput)
                    commands(action)
                })
            }
            if (response.action === "do-what-it-says") {
                commands(action)
            }
        })
    }
}
var userInput = process.argv.slice(2)
commands(userInput)