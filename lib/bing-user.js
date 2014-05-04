/*
    Bing User

    This script allows you to search Bing with a headless web browser from a node.js script. 
    It's built on top of SpookyJS, a library which allows you to connect to CasperJS. 
    CasperJS is built on PhantomJS. 

    This was just an experiment to see if I could automate the actions of a web browser through node.js.
    I used Bing as my use case since it was simple to play around with. 

    The tests show how the script can be used.
*/

var xtend = require('xtend'),
    Spooky = require('spooky');

module.exports = function(opts, next) {
    var spooky = null,
        me = this,
        cbQueue = {};

    /*
        Private Methods
    */

    /*
        addCallback and popCallback allow callbacks to be kept track of
    */

    var addCallback = function(next) {
        var ii = 0;
        while (typeof cbQueue[ii] !== 'undefined') {
            ii++;
        }
        cbQueue[ii] = next || '';
        return ii;
    };

    var popCallback = function(idx) {
        var cb = cbQueue[idx];
        delete cbQueue[idx];
        return cb;
    }

    /*
        Public Methods
    */

    me.connectToMicrosoftAccount = function(opts, next) {

        if (typeof opts === 'function' && arguments.length === 1) {
            next = opts;
        } else if (typeof opts !== 'object' && typeof next !== 'function') {
            throw new Error('connectToMicrosoftAccount takes in an object and a function.');
        }

        var idx = addCallback(next);

        spooky.then(function() {
            this.open('https://login.live.com/login.srf');
        });

        spooky.waitUntilVisible('form[name="f1"]', function() {});

        /*
           We're now on the login page. Fill in the login form and submit.
        */
        spooky.then([{
            email: opts.email,
            password: opts.password
        }, function() {
            this.echo('Page Title:'+this.getTitle());
            this.echo('email = '+email);
            this.fill('form[name="f1"]', {
                'login': email,
                'passwd': password
            }, false);
            this.click('#idSIButton9');

        }]);

        /*
            Alert box?
        */
        spooky.then(function() {
            this.echo('Page Title:'+this.getTitle());

        });

        /*
           We're now at the homepage
        */
        spooky.then([{
            index: idx
        }, function() {
            var pageTitle = this.getTitle(); // should equal 'Bing Rewards - Dashboard'
           this.echo(pageTitle);
           this.echo('callback:'+index+':'+pageTitle);
        }]);

        spooky.run();
    };

    me.connectToFacebook = function(opts, next) {

        if (typeof opts === 'function' && arguments.length === 1) {
            next = opts;
        } else if (typeof opts !== 'object' && typeof next !== 'function') {
            throw new Error('connectToFacebook takes in an object and a function.');
        }

        var idx = addCallback(next);

        spooky.then(function() {
            this.open('http://www.bing.com/rewards/signin');
        });

        spooky.then(function() {
            this.echo('Page Title:'+this.getTitle());
            this.click('#FBSignin');
        })

        /*
           We're now on the login page. Fill in the login form and submit.
        */
        spooky.then([{
            email: opts.email,
            password: opts.password
        }, function() {
           this.echo('Page Title:'+this.getTitle());
           this.echo('email = '+email);
           this.fill('form#login_form', {
               'email': email,
               'pass': password
           }, true);
        }]);

        /*
           We're now at the Intelink homepage
        */
        spooky.then([{
            index: idx
        }, function() {           
           var pageTitle = this.getTitle(); // should equal 'Bing Rewards - Dashboard'
           this.echo(pageTitle);
           this.echo('callback:'+index+':'+pageTitle);
        }]);

        spooky.run();
    };

    /*
        opts: {
            text: what to search for
        }
    */
    me.search = function(opts, next) {

        if (typeof opts !== 'object' && typeof next !== 'function') {
            throw new Error('search takes in an object and a function.');
        }

        var idx = addCallback(function(err, results) {
            if (err) {
                next(err)
            } else {
                next(err, JSON.parse(results));
            }
        });

        spooky.then(function() {
            this.open('http://www.bing.com/');
        });

        spooky.then([{
            text: opts.text
        }, function() {
           this.fill('form#sb_form', {
               'q': text
           }, true);
        }]);

        spooky.then([{
            index: idx
        }, function() {

            var getLinks = this.evaluate(function() {
                var links = document.querySelectorAll('#b_results h2 > a');
                return Array.prototype.map.call(links, function(e) {
                    return {
                        href: e.getAttribute('href'),
                        title: e.innerText
                    };
                });
            });

            this.echo('callback:'+index+':'+ JSON.stringify(getLinks));
        }]);

        spooky.run();
    };

    me.destroy = function() {
        spooky.then(function() {
            this.exit();
        });
        spooky.run();
    };

    /*
        Init

        opts: {
            spooky
        }

    */

    (function(opts, next) {
        if (typeof opts === 'function' && typeof next === 'undefined') {
            next = opts;
            opts = {};
        } else if (typeof opts !== 'object' && typeof next !== 'function') {
            throw new Error('Constructor takes in an object and a function.');
        }

        var spookyOpts = {
            child: {
                port: 8081
            },
            casper: {
                onRunComplete: function() {},
                logLevel: 'debug' //info
            }
        };
        spookyOpts = xtend(spookyOpts, opts.spooky || {});

        spooky = new Spooky(config = spookyOpts, function(err, res) {
            spooky.on('console', function(line) {
                var args = line.match(/callback:([0-9]*):(.*)/) || line.match(/callback:([0-9]*)/);
                if ( args ) {
                    var cb = popCallback(args[1]); 

                    // execute callback commands
                    if (cb) {
                        if (args[2]) {
                            cb(null, args[2]);
                        } else {
                            cb(null);
                        }
                    }
                } else {
                    console.log(line);
                }
            });

            spooky.on('run.complete', function(){
                //console.log("run.complete");
            })

            var idx = addCallback(next);

            spooky.start();
            spooky.then([{
                index: idx
            }, function () {
                console.log('callback:' + index);
            }]);

            return spooky.run();
        });
    })(opts, next);
};