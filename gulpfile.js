var gulp = require('gulp');
var pkg = require('./package.json');
var plugins = require("gulp-load-plugins")();
var concat = require('gulp-concat-util');
var options = {
    src: "./src/*.js",
    dest: "./dist",
    jshint: {
        reporter: "jshint-stylish",
        options: {
            "lookup": false,
            "boss": true,
            "curly": true,
            "eqeqeq": true,
            "eqnull": true,
            "expr": true,
            "immed": true,
            "noarg": true,
            "quotmark": "single",
            "onevar": false,
            "smarttabs": true,
            "trailing": true,
            "unused": true,
            "strict": true,
            "node": false,
            "predef": ["window", "jQuery"]
        }},
    "/src./*.js": "",
    header: "/*!\n" +
            " *  " + pkg.name + " by @GuruDigital - http://www.gurudigital.nz\n" +
            " *  Copyright Guru Digital Media. \n" +
            " */\n"
};
gulp.task('default', function () {
    return gulp.src(options.src)
            .pipe(plugins.jshint(options.jshint.options))
            .pipe(plugins.jshint.reporter(options.jshint.reporter))
            .pipe(concat('lib.js'))
            .pipe(concat.header(options.header))
            .pipe(concat.footer('\n// end\n'))
            .pipe(gulp.dest(options.dest))
            .pipe(plugins.rename({suffix: ".min"}))
            .pipe(plugins.uglify({preserveComments: "license"}))
            .pipe(plugins.sourcemaps.write(options.dest))
            .pipe(gulp.dest(options.dest))
            ;
});
