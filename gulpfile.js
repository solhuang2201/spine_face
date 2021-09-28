const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const minimist = require('minimist');
const connectPhp = require('gulp-connect-php');
const browserSync = require('browser-sync').create();

const envOption = { string: 'env', default: { env: 'develop' } }
const options = minimist(process.argv.slice(2), envOption);
console.log(options);

const src = './source/';
const dest = './public/';
const node = './node_modules/';

const paths = {
    html: {
        src: src + '*.{php,html}',
        dest: dest
    },
    node: {
        src: [
            node + 'pixi.js/dist/browser/pixi.js',
            node + 'pixi-spine/dist/pixi-spine.umd.js',
            src + 'pixi-spine-debug-master/pixi-spine-debug.js',
            node + 'pixi-dragonbones/dragonBones.js'
        ],
        dest: dest + 'js'
    },
    json: {
        src: src + '/json/*.*',
        dest: dest + 'json'
    }, 
    clear: {
        src: dest
    }
}

function html() {
    const htmlOpt = {
        removeComments: true, // 清除HTML註釋
        collapseWhitespace: false, // 壓縮HTML
        collapseBooleanAttributes: true, // 省略預設屬性的值 <input checked="true"/> ==> <input checked />
        removeEmptyAttributes: true, // 刪除所有空格作屬性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true, // 刪除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: false, // 刪除<style>和<link>的type="text/css"
        decodeEntities: true, // 盡可能使用直接Unicode字符
        sortAttributes: true, // 按頻率對屬性進行排序
        sortClassName: true, // 按頻率對樣式進行排序
        minifyJS: true, // 壓縮頁面JS
        minifyCSS: false // 壓縮頁面CSS
        // 使用忽略 <!-- htmlmin:ignore --><!-- htmlmin:ignore -->
    };
    return gulp.src(paths.html.src)
        .pipe(gulp.dest(paths.html.dest))
        .pipe($.if(options.env === 'production', $.htmlmin(htmlOpt)))
        .pipe(browserSync.stream());
}

function js() {
    return gulp.src(paths.node.src)
        .pipe(gulp.dest(paths.node.dest))
}

function json() {
    return gulp.src(paths.json.src)
        .pipe(gulp.dest(paths.json.dest))
}

function watch() {
    gulp.watch(paths.html.src, html);
};

function sync() {
    // connectPhp.server({base: './public/', port: 3000, keepalive: true}, function () {browserSync.init({proxy: 'localhost:1999',watch: true,open: true,notify: false});});
    connectPhp.server({ base: 'spine_face/public', port: 3000, keepalive: true }, function () { browserSync.init({ proxy: 'localhost/spine_face/public', watch: true, open: true, notify: false }); });
};

// 清除資料夾指令
function clean() {
    return gulp.src(paths.clear.src, { read: false })
        .pipe($.clean());
}

const build = gulp.series(clean, gulp.parallel(js, json), html);
gulp.task('build', build);

const walking = gulp.series(html, js, json, gulp.parallel(sync, watch));
gulp.task('default', walking);

exports.js = js;
exports.json = json;
exports.html = html;
exports.clean = clean;
exports.build = build;
