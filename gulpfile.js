// gulp 配置

const
    gulp = require('gulp'),
    rev = require('gulp-rev'),
    revCollector = require('gulp-rev-collector'),
    minifycss = require('gulp-clean-css'),
    uglify = require('gulp-uglify'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    gulpif = require('gulp-if'),
    htmlmin = require('gulp-htmlmin'),
    bs = require('browser-sync').create()

const Src = 'src',
    Dest = 'dist'

//删除
gulp.task('clean', function () {
    return gulp.src([Dest, Src + '/rev']).pipe(clean())
})

gulp.task('supportjs', function () {
    return gulp
        .src(Src + '/support/js/*.js')
        .pipe(concat('custom.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(Src + '/js/link'))
        .pipe(bs.reload({stream: true}))
})

gulp.task('supportcss', function () {
    return gulp
        .src(Src + '/support/scss/*.scss')
        .pipe(concat('custom.min.css'))
        .pipe(minifycss())
        .pipe(gulp.dest(Src + '/css/link'))
        .pipe(bs.reload({stream: true}))
})

//js添加版本号
gulp.task('js', ['clean'], function () {
    return gulp
        .src(Src + '/js/**/*.js')
        .pipe(
            gulpif(function (file) {
                return !file.path.endsWith('.min.js')
            }, uglify())
        )
        .pipe(rev())
        .pipe(gulp.dest(Dest + '/js'))
        .pipe(rev.manifest())
        .pipe(gulp.dest(Src + '/rev/js'))
})

//css添加版本号
gulp.task('css', ['clean'], function () {
    return gulp
        .src(Src + '/css/**/*.css')
        .pipe(minifycss())
        .pipe(rev())
        .pipe(gulp.dest(Dest + '/css'))
        .pipe(rev.manifest())
        .pipe(gulp.dest(Src + '/rev/css'))
})

gulp.task('copy', ['clean'], function () {
    return gulp
        .src([Src + '/fonts/**', Src + '/i18n/**', Src + '/images/**'], {
            base: Src
        })
        .pipe(gulp.dest(Dest))
})

//页面
gulp.task('recHtml', ['clean', 'css', 'js'], function () {
    return gulp
        .src([Src + '/rev/**/*.json', Src + '/*.html'])
        .pipe(
            revCollector({
                replaceReved: true,
                dirReplacements: {
                    css: 'css',
                    js: 'js'
                }
            })
        )
        .pipe(
            gulpif(function (file) {
                return file.path.endsWith('.html')
            }, htmlmin())
        )
        .pipe(gulp.dest(Dest))
})

gulp.task('server', function () {
    bs.init({
        server: {
            baseDir: Src,
            index: './index.html'
        }
    })

    gulp.watch(Src + '/support/js/*.js', ['supportjs'])
    gulp.watch(Src + '/support/scss/*.scss', ['supportcss'])
    gulp.watch(Src + '/**/*.css').on('change', bs.reload)
    gulp.watch(Src + '/**/*.js').on('change', bs.reload)
    gulp.watch(Src + '/*.html').on('change', bs.reload)
})

// 开发
gulp.task('default', ['server'], function () {
    console.log('开发模式下，页面监听中...')
})

// 生产
gulp.task('build', ['clean', 'js', 'css', 'copy', 'recHtml'], function () {
    console.log('项目打包完成, 目录为 【' + Dest + '】')
})
