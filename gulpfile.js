const { src, dest, watch, series, parallel } = require('gulp');
const sass         = require('gulp-sass')(require('sass'));
const postcss      = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano      = require('cssnano');
const concat       = require('gulp-concat');
const terser       = require('gulp-terser');
const imagemin     = require('gulp-imagemin');
const browsersync  = require('browser-sync').create();
const plumber      = require('gulp-plumber');

// ─── RUTAS ─────────────────────────────────────────────────
const paths = {
  scss: {
    src:   'src/scss/app.scss',
    watch: 'src/scss/**/*.scss',
    dest:  'build/css',
  },
  js: {
    src:   ['src/js/app.js', 'src/js/formulario.js'],
    dest:  'build/js',
  },
  img: {
    src:   'src/img/**/*',
    dest:  'build/img',
  },
  html: 'index.html',
};

// ─── SCSS ──────────────────────────────────────────────────
function css() {
  return src(paths.scss.src)
    .pipe(plumber())
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(dest(paths.scss.dest))
    .pipe(browsersync.stream());
}

// ─── JAVASCRIPT ────────────────────────────────────────────
function js() {
  return src(paths.js.src)
    .pipe(plumber())
    .pipe(concat('app.js'))
    .pipe(terser())
    .pipe(dest(paths.js.dest))
    .pipe(browsersync.stream());
}

// ─── IMÁGENES ──────────────────────────────────────────────
function imagenes() {
  return src(paths.img.src)
    .pipe(imagemin())
    .pipe(dest(paths.img.dest));
}

// ─── BROWSER SYNC ──────────────────────────────────────────
function servidor(done) {
  browsersync.init({
    server: { baseDir: './' },
    port: 3000,
    open: true,
    notify: false,
  });
  done();
}

function reload(done) {
  browsersync.reload();
  done();
}

// ─── WATCH ─────────────────────────────────────────────────
function watchArchivos() {
  watch(paths.scss.watch, css);
  watch(paths.js.src,     series(js));
  watch(paths.img.src,    series(imagenes, reload));
  watch(paths.html,       reload);
}

// ─── EXPORTS ───────────────────────────────────────────────
exports.css      = css;
exports.js       = js;
exports.imagenes = imagenes;
exports.build    = parallel(css, js, imagenes);
exports.default  = series(
  parallel(css, js, imagenes),
  servidor,
  watchArchivos
);