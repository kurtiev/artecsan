'use strict';

module.exports = function (grunt) {

    // var plugins = [
    //     'js/jquery/jquery-2.1.1.min.js', 'js/plugins/jquery-ui/jquery-ui.js', 'js/bootstrap/bootstrap.min.js',
    //     'js/plugins/metisMenu/jquery.metisMenu.js', 'js/plugins/slimscroll/jquery.slimscroll.min.js', 'js/plugins/pace/pace.min.js',
    //     'js/inspinia.js', 'js/angular/angular.min.js', 'js/angular/angular-sanitize.min.js', 'js/plugins/oclazyload/dist/ocLazyLoad.min.js',
    //     'js/ui-router/angular-ui-router.min.js', 'js/bootstrap/ui-bootstrap-tpls-1.1.2.min.js', 'js/plugins/angular-idle/angular-idle.js', 'js/plugins/datetime-picker.js',
    //     'js/plugins/angular-local-storage.min.js', 'js/plugins/sweetalert/sweetalert.min.js', 'js/plugins/sweetalert/angular-sweetalert.min.js', 'js/controllers/homeMenuController.js'
    // ];

    // var styles = ['css/bootstrap.min.css', 'font-awesome/css/font-awesome.css', 'css/plugins/sweetalert/sweetalert.css', 'css/animate.css', 'css/style.css', 'css/Artecsan.css'];

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
        },
        uglify: {
            dist: {
                options: {
                    mangle: false,
                    sourceMap: false,
                    banner: '/* Artecsan */'
                },
                files: {
                    'dist/app.js': ['js/app.js', 'js/config.js', 'js/directives.js', 'js/controllers.js'],
                    'dist/components.js': ['js/components/**/*.js', 'js/components/**/*.*.js'],
                    'dist/directives.js': ['js/directives/**/*.js', 'js/directives/**/*.*.js'],
                    'dist/services.js': ['js/services/**/*.js', 'js/services/**/*.*.js'],
                    'dist/filters.js': ['js/filters/**/*.js', 'js/filters/**/*.*.js']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-replace');


    grunt.registerTask('default', ['uglify', 'replace']);

};
