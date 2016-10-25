/**
 * Created by jefferson.wu on 10/19/16.
 */

// ====================================
// Dependencies =======================
// ====================================

var chalk           = require('chalk');
var clear           = require('clear');
var CLI             = require('clui');
var figlet          = require('figlet');
var inquirer        = require('inquirer');
var Preferences     = require('preferences');
var Spinner         = CLI.Spinner;
var GitHubApi       = require('github');
var _               = require('lodash');
var git             = require('simple-git');
var touch           = require('touch');
var fs              = require('fs');

// ====================================
// Helper Methods =====================
// ====================================

var files           = require('./lib/files');
var github          = new GitHubApi({version: '3.0.0'});



// ====================================
// RUNTIME (baby!) ====================
// ====================================

// clear the screen
clear();

// write title using figlet and chalk.
console.log(
    chalk.yellow(figlet.textSync(getRandomAppName(), {horizontalLayout: 'full'})
    )
);

// check to see if current folder is a Git folder using our helper method.
// if (files.directoryExists('.git')){
//     console.log(chalk.red('Already a git repository!'));
//     process.exit();
//}

// prompt user for input using "Inquirer"
//TODO: Prompt user for folder project name and initialize a JWX folder structure.

//fake loading spinner
//spinMyWheels(process.argv[2]);

//run app
askQuestions(function(){console.log(arguments)});


// ====================================
// FUNCTIONS ==========================
// ====================================

/**
 * Loading Wheel Spinner
 * @param time How long in milliseconds to test the spinner.
 */
function spinMyWheels(time){

    var status = new Spinner('Loading some stuff...');
    status.start();

    var tickerTimer = setTimeout(function(){

        status.stop();
        console.log('\r\n' + chalk.green(time) + ' millisecond timer, timed out.');

    }, time);

}

/**
 * Generate a random app name from a private list of names.
 * @returns {string} Returns a name as a string value.
 */
function getRandomAppName(){

    //TODO: add a file reader
    var listONames = [
        'Ginit', 'Jeffit', 'Loco-it', 'Brunch Jog', 'MonoSpacer', 'JimboJones', '180LA'
    ];
    return listONames[Math.floor(Math.random() * listONames.length)];
}

/**
 * Ask input questions.
 * @param callback Function to run after all data is collected.
 */
function askQuestions(callback){

    //check for prefs

    var questions = [
        {
            name:'username',
            type:'input',
            message: 'Enter your username: ',
            validate: function(value){
                if(value.length){
                    return true;
                } else {
                    return 'Please enter your username. ';
                }
            }
        },
        {
            name:'password',
            type:'password',
            message:'Enter your password: ',
            validate:function(value){
                if(value.length){
                    return true;
                } else {
                    return 'Please enter your password';
                }
            }
        }
    ];

    inquirer.prompt(questions).then(callback);
}

function checkForExistingPrefs(){
    var prefs = new Preferences('ginit');

    if (prefs.github && prefs.github.token) {
        return callback(null, prefs.github.token);
        //TODO: study this method of setting up callbacks (param passed in to function that called this function?)
    }
}

// =============================================================
// ============= REFERENCE FUNCTIONS FROM TUTORIAL =============
// =============================================================
function getGithubCredentials(callback){

    // set of questions
    var questions = [
        {
            name: 'username',
            type: 'input',
            message: 'Enter your Github username or e-mail address:',
            validate: function (val) {
                if(val.length) {
                    return true;
                } else {
                    return 'Please enter your username or e-mail address';
                }
            }
        },
        {
            name: 'password',
            type: 'password',
            message: 'Enter your password: ',
            validate: function(val){
                if(value.length){
                    return true;
                } else {
                    return 'Please enter your password';
                }
            }
        }
    ];

    // ask the questions
    inquirer.prompt(questions).then(callback);
}

// get github OAuth token
function getGithubToken(callback){
    var prefs = new Preferences('ginit');

    if(prefs.github && prefs.github.token) {
        return callback(null, prefs.github.token);
    }

    // fetch token
    getGithubCredentials(function(credentials){
        var status = new Spinner('Authenticating you, please wait...');
        status.start();

        //authenticate with github
        github.authenticate(
            _.extend(
                {
                    type: 'basic'
                },
                credentials
            )
        );

        // github authorize create
        github.authorization.create({
            scopes: ['user', 'public_repo', 'repo', 'repo:status'],
            note: 'ginit, the command-line tool for initializing Git repos'
        }, function(err, res){
            status.stop();

            if(err){
                return callback(err);
            }
            if(res.token){
                prefs.github = {token: res.token};
                return callback(null, res.token);
            }
            return callback();
        });

    });
}