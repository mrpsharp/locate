module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // Clean the dist directory
        clean: {
            dist: ['dist']
        },

        // Minify JavaScript files
        uglify: {
            dist: {
                files: {
                    'script.min.js': ['script.js'],
                    'os-transform.min.js': ['os-transform.js'],
                    'sw.min.js': ['sw.js']
                }
            }
        },

        // Minify CSS files
        cssmin: {
            dist: {
                files: {
                    'style.min.css': ['style.css']
                }
            }
        },

        // Minify HTML files
        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {
                    'dist/index.html': 'index.html',
                    'dist/readme.html': 'readme.html'
                }
            }
        },

        // Copy all other files to the dist directory
        copy: {
            dist: {
                files: [
                    // Copy all files except HTML, CSS, JS, and excluded files
                    {
                        expand: true,
                        src: [
                            '**',
                            '!Gruntfile.js',
                            '!package.json',
                            '!package-lock.json',
                            '!style.css',
                            '!script.js',
                            '!os-transform.js',
                            '!index.html',
                            '!readme.html',
                            '!dist/**',
                            '!node_modules/**'
                        ],
                        dest: 'dist/'
                    }
                ]
            }
        },

        // Shell commands to deploy to GitHub Pages
        shell: {
            deploy: {
                command: 'git subtree push --prefix dist origin gh-pages'
            }
        },

        // Watch task
        watch: {
            dist: {
                files: ['*.html', '*.js', '*.css'],
                tasks: ['default']
            }
        }
    });

    // Load the plugins
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-watch');


    // Default task(s).
    grunt.registerTask('default', ['clean', 'uglify', 'cssmin', 'htmlmin', 'copy']);
    // Deploy task
    grunt.registerTask('deploy', ['default', 'shell:deploy']);
};
