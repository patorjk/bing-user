

'use strict';

var BingUser = require('../lib/bing-user'),
    grunt = require('grunt'),
    async = require('async'),
    read = require('read');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.fbConnect = {
    setUp: function(done) {
        // setup here if necessary
        done();
    },

    /*
        Test logging into MS account and doing search
    */
    ms_login: function(test) {
        test.expect(1);
  
        var bingUser;

        async.waterfall([

            function(next) {
                bingUser = new BingUser(next);
            },

            // prompt for user
            function(next) {
                setTimeout(function() {
                    read({
                        prompt: 'Enter MS Email:'
                    }, function(err, opts) {
                        next(null, opts);
                    });
                }, 500);
            },

            // prompt for password
            function(email, next) {
                read({
                    prompt: 'Enter MS Password:',
                    silent: true,
                    replace: '*'
                }, function(err, opts) {
                    next(null, email, opts);
                })
            },

            function(email, passwd, next) {
                bingUser.connectToMicrosoftAccount({
                    email: email,
                    password: passwd
                }, next);
            },

            function(pageTitle, next) {
                var count = 0,
                    allResults = [],
                    numSearches = 2;

                console.log('-');
                console.log(pageTitle);
                console.log('-');

                async.whilst(
                    function() { return count < numSearches },
                    function(subNext) {
                        count++;
                        bingUser.search({
                            text: 'Random search #' + Math.floor(100 * Math.random())
                        }, function(err, results) {
                            allResults.push( results );
                            subNext(err);
                        });
                    },
                    function() {
                        next(null, pageTitle, allResults);
                    }
                )
            },

        ], function(err, pageTitle, results) {
            if (err) {
                console.log('there was an error...');
                console.dir(err);
            }
            bingUser.destroy();
            console.dir(results);
            console.log('all done!');
            test.equal(pageTitle, 'Microsoft account', 'Correctly logged in.');
            test.done();
        });

    },
};
