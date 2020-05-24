// Gulp config
import gulp from "gulp";
import pkg from "./package.json";

/**  MISCS
 * - plugins for different processes
 */
// delete build folder every new build
import del from "del";
// make sure that file is updated before processing it
import newer from "gulp-newer";
// rename file with various options
import rename from "gulp-rename";
// stream size logger
import size from "gulp-size";

/**  HTML
 * - plugins for html proccessing
 */
// preprocessing html remove @excludes directives
import preprocess from "gulp-preprocess";
// HTML/SVG cleaner to minify without changing its structure
import htmlclean from "gulp-htmlclean";

/**  IMAGES
 * - plugins for image proccessing
 */
// minify images
import imagemin from "gulp-imagemin";

/**  STYLES
 * - plugins for style proccessing
 */
// compile sass to css
import sass from "gulp-sass";
// css cleanup
import cleanCSS from "gulp-clean-css";
// css prefixer
import pleeease from "gulp-pleeease";

/**  SCRIPTS
 * - plugins for scripts proccessing
 */
// transpile ES6 to legacy
import babel from "gulp-babel";
// concat files using os newLine
import concat from "gulp-concat";
// minify js
import uglify from "gulp-uglify";
// error reports
import jshint from "gulp-jshint";
// will reorder JavaScript or CSS files in the stream based on comments at the top of files
import deporder from "gulp-deporder";

const devBuild =
  (process.env.NODE_ENV || "development").trim().toLowerCase() !== "production";

const logger = () => {
  return console.log(
    `${pkg.name} ${pkg.version} build - ${
      devBuild ? "development" : "production"
    }`
  );
};

/**  PATHS - simple js object storing constats of our paths  */
const paths = {
  html: {
    src: "src/public/**/*.html",
    dest: "build/",
  },
  images: {
    src: "src/assets/**/*.{jpg,jpeg,png}",
    dest: "build/assets/",
  },
  styles: {
    src: "src/**/*.scss",
    dest: "build/",
  },
  scripts: {
    src: "src/**/*.js",
    dest: "build/",
  },
};

/**  HTML - html processing pipeline  */
export const html = () => {
  return devBuild
    ? gulp
        .src(paths.html.src)
        .pipe(
          size({
            title: "html - in",
            // gzip: true,
            // pretty: true,
            // showFiles: true,
            // showTotal: true,
          })
        )
        .pipe(newer(paths.images.dest))
        .pipe(
          preprocess({
            context: {
              NODE_ENV: devBuild ? "development" : "production",
              DEBUG: devBuild ? false : true,
              author: pkg.author,
              version: pkg.version,
            },
          })
        )
        .pipe(size({ title: "html - out" }))
        .pipe(gulp.dest(paths.html.dest))
    : gulp
        .src(paths.html.src)
        .pipe(size({ title: "html - in" }))
        .pipe(newer(paths.images.dest))
        .pipe(
          preprocess({
            context: {
              NODE_ENV: devBuild ? "development" : "production",
              DEBUG: devBuild ? false : true,
              author: pkg.author,
              version: pkg.version,
            },
          })
        )
        .pipe(htmlclean())
        .pipe(size({ title: "html - out" }))
        .pipe(gulp.dest(paths.html.dest));
};

/**  IMAGES - images processing pipeline  */
export const images = () => {
  return gulp
    .src(paths.images.src)
    .pipe(size({ title: "images - in" }))
    .pipe(newer(paths.images.dest))
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(size({ title: "images - out" }))
    .pipe(gulp.dest(paths.images.dest));
};

/**  STYLES - styles processing pipeline  */
export const styles = () => {
  return gulp
    .src(paths.styles.src)
    .pipe(size({ title: "styles - in" }))
    .pipe(newer(paths.images.dest))
    .pipe(
      sass({
        outputStyle: "compressed",
        imagePaths: "./assets",
        precision: 3,
      }).on("error", sass.logError)
    )
    .pipe(cleanCSS())
    .pipe(
      pleeease({
        autoprefixer: { browsers: ["last 2 versions", "> 2%"] },
        rem: ["16px"],
        pseudoElements: true,
        mqpacker: true,
        minifier: true,
      })
    )
    .pipe(
      rename({
        basename: "main",
        suffix: ".min",
      })
    )
    .pipe(size({ title: "styles - out" }))
    .pipe(gulp.dest(paths.styles.dest));
};

/**  SCRIPTS - scripts processing pipeline  */
export const scripts = () => {
  return gulp
    .src(paths.scripts.src, { sourcemaps: true })
    .pipe(size({ title: "scripts - in" }))
    .pipe(newer(paths.images.dest))
    .pipe(jshint())
    .pipe(babel())
    .pipe(uglify())
    .pipe(concat("main.min.js"))
    .pipe(size({ title: "scripts - in" }))
    .pipe(gulp.dest(paths.scripts.dest));
};

/**  WATCH - watch process automatization, if file changed -> run following func  */
const watchFiles = () => {
  // $ export NODE_ENV=production <-- bash windows
  // $ NODE_ENV=development       <-- bash windows with win-node-env
  logger();
  gulp.watch(paths.html.src, html);
  gulp.watch(paths.images.src, images);
  gulp.watch(paths.scripts.src, scripts);
  gulp.watch(paths.styles.src, styles);
};
export { watchFiles as watch };

/**  CLEANUP - delete certain folders and files  */
export const clean = () => {
  logger();
  return del(["build"]);
};

/**  BUILD - build process automatization  */
export const build = gulp.series(
  clean,
  gulp.parallel(html, images, styles, scripts)
);

// export default build;
