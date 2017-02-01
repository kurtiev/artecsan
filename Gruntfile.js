'use strict';

module.exports = function (grunt) {

    grunt.initConfig({
        replace: {
            build_replace: {
                options: {
                    variables: {
                        // Generate a truly random number by concatenating the current date with a random number
                        // The variable name corresponds with the same in our HTML file
                        'hash': '<%= ((new Date()).getTime()) %>'
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
        }
    });

    grunt.loadNpmTasks('grunt-replace');


    grunt.registerTask('default', ['replace']);

};
