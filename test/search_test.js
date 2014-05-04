

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
    search: function(test) {
        test.expect(1);
  
        var bingUser;

        async.waterfall([

            function(next) {
                bingUser = new BingUser(next);
            },

            function(next) {
                var count = 0,
                    allResults = [],
                    numSearches = 1;

                async.whilst(
                    function() { return count < numSearches },
                    function(subNext) {
                        count++;
                        bingUser.search({
                            text: 'to bing or not to bing'
                        }, function(err, results) {
                            allResults.push( results );
                            subNext(err);
                        });
                    },
                    function() {
                        next(null, allResults);
                    }
                )
            },

        ], function(err, results) {
            if (err) {
                console.log('there was an error...');
                console.dir(err);
            }
            bingUser.destroy();
            console.dir(results);
            console.log('all done!');
            test.notEqual(results.length, 0, 'Ensure more than one result returned.');
            test.done();
        });

    },
};
