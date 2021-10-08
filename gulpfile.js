const fs = require('fs');
const { series, src, dest, parallel, task } = require('gulp');
// // const sourcemaps = require('gulp-sourcemaps');
const ts = require('gulp-typescript');
const install = require('gulp-install');
const rollup = require('rollup-stream');
const clean = require('gulp-clean');
const rename = require('gulp-rename');
const minify = require('gulp-minify');
const vSrc = require('vinyl-source-stream');
const vBuf = require('vinyl-buffer');

function getBundleTasks() {
    const allTasks = [];

    fs.readdirSync('bundles').forEach(bundle => {
        const bundlePath = `bundles/${bundle}`;
        const bundleTasks = [];

        // check for a typescript config file
        // if it exists we compile it as a browser bundle
        if (fs.existsSync(`${bundlePath}/tsconfig.json`)) {
            // typescript bundles need to be transpiled
            task(`build:bundle:${bundle}:compile`, () => {
                const tsProject = ts.createProject(`${bundlePath}/tsconfig.json`);

                return src(`${bundlePath}/src/**/*.ts`)
                    .pipe(tsProject())
                    .pipe(dest(`build/${bundlePath}`));
            });

            // roll up the typescript bundle into a single package
            task(`build:bundle:${bundle}:package`, () => {
                return rollup({
                        input: `build/${bundlePath}/index.js`,
                        format: "iife",
                        globals: {
                            phaser: "Phaser"
                        },
                        output: {
                            minifyInternalExports: true
                        }
                    })
                    .pipe(vSrc(`build/${bundlePath}/index.js`))
                    .pipe(vBuf())
                    .pipe(rename(`${bundle}.bundle.js`))
                    .pipe(dest("dist/static/bundles/"));
            });

            // minify the code
            task(`build:bundle:${bundle}:minify`, () => {
                return src(`dist/static/bundles/${bundle}.bundle.js`)
                    .pipe(minify({ext:{min: '.min.js'}}))
                    .pipe(dest("dist/static/bundles/"));
            });

            // add tasks to queue
            bundleTasks.push(task(`build:bundle:${bundle}:compile`));
            bundleTasks.push(task(`build:bundle:${bundle}:package`));
            // bundleTasks.push(task(`build:bundle:${bundle}:minify`));
        }

        // static bundle is special because it produces static files
        // just copy these to the destination
        if (bundle === "static") {
            task(`build:bundle:${bundle}:copy`, () => {
                return src(`${bundlePath}/*`)
                    .pipe(dest(`dist/static`));
            })

            bundleTasks.push(task(`build:bundle:${bundle}:copy`));
        }

        // if we don't have any tasks, don't add any
        if (bundleTasks.length > 0) {
            task(`build:bundle:${bundle}`, series( bundleTasks ));
            allTasks.push(task(`build:bundle:${bundle}`));
        }
    })

    task("build:bundle", parallel( allTasks ));
    return parallel(task("build:bundle"));
}

function getServicesTasks() {
    const allTasks = [];

    fs.readdirSync('services').forEach(service => {
        const servicePath = `services/${service}`;
        const serviceTasks = [];

        // check for a typescript config file
        // if it exists we compile it as a node service
        if (fs.existsSync(`${servicePath}/tsconfig.json`)) {
            // typescript bundles need to be transpiled
            // we can send them directly to dist because we don't need to package them
            task(`build:service:${service}:compile`, () => {
                const tsProject = ts.createProject(`${servicePath}/tsconfig.json`);

                return src(`${servicePath}/src/**/*.ts`)
                    .pipe(tsProject())
                    .pipe(dest(`dist/${servicePath}`));
            });

            // copy the node package to the dist folder
            task(`build:service:${service}:install`, () => {
                return src(`${servicePath}/package.json`)
                    .pipe(dest(`dist/${servicePath}`))
                    .pipe(install());
            });

            // add task to queue
            serviceTasks.push(task(`build:service:${service}:compile`));
            serviceTasks.push(task(`build:service:${service}:install`));
        }

        // if we don't have any tasks, don't add any
        if (serviceTasks.length > 0) {
            task(`build:service:${service}`, parallel( serviceTasks ));
            allTasks.push(task(`build:service:${service}`));
        }
    })

    task("build:service", parallel( allTasks ));
    return task("build:service");
}

function preBuildCleanup() {
    return src('dist', { allowEmpty: true })
        .pipe(clean());
}

function postBuildCleanup() {
    return src('build', { allowEmpty: true })
        .pipe(clean());
}

// BUILD TASK
exports.clean = parallel( preBuildCleanup, postBuildCleanup );
exports.build = series( parallel( getBundleTasks(), getServicesTasks() ) );