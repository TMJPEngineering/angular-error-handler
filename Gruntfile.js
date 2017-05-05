module.exports = function(grunt) {
    grunt.initConfig({
        browserify: {
            dev: {
                src: ['src/error-handler.js'],
                dest: 'angular-error-handler.js'
            }
        },
        uglify: {
            prod: {
                options: { mangle: true, compress: true },
                src: 'angular-error-handler.js',
                dest: 'angular-error-handler.min.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.registerTask('default', ['browserify', 'uglify']);
};
