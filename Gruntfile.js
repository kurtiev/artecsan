'use strict';

module.exports = function (grunt) {

    var server = function () {
        var express = require('express');
        var app = express();
        var path = require('path');
        app.get('/', function(req, res) {
            app.use("/dist",express.static(__dirname + "/dist"));
            app.use("/build",express.static(__dirname + "/build"));
            app.use("/app",express.static(__dirname + "/app"));
            app.use("/views",express.static(__dirname + "/views"));
            res.sendFile(path.join(__dirname + '/index.html'));
        });

        app.listen(3001);
    };

    //Main App
    var appJS = ['js/components/**/*.js'];

    grunt.initConfig({
        uglify: {
            options: {
                mangle: false
            },
            app_files: {
                files: {
                    'build/js/components.min.js': appJS
                }
            }
        },
        cssmin: {
            target: {
                files: {
                    'build/css/styles.min.css': ['build/css/styles.min.css']
                }
            }
        },
        replace: {
            build_replace: {
                options: {
                    variables: {
                        // Generate a truly random number by concatenating the current date with a random number
                        // The variable name corresponds with the same in our HTML file
                        'hash': '<%= ((new Date()).valueOf().toString()) + (Math.floor((Math.random()*1000000)+1).toString()) %>'
                    }
                },
                // Source and destination files
                files: [
                    {
                        src: ['index.production'],
                        dest: 'index.html'
                    }
                ]
            }
        },
        watch: {
            devState: {
                files: appJS,
                tasks: 'default',
                options: {}
            }
        },
        express: {
            options: {
                background: true,
                port: 3000
            },
            dev: {
                options: {
                    script: 'server.js'
                }
            }
        }
    });


    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-express-server');


    grunt.registerTask('default', ['uglify', 'replace']);
    grunt.registerTask('dev', ['express:dev', 'watch']);

};
