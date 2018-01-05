rm -rf example/dist
mkdir example/dist

browserify example/index.jsx \
  --extension jsx \
  -t [ babelify ] \
  -g [ envify --NODE_ENV production ] \
  -g uglifyify \
  | uglifyjs --compress --mangle > ./example/dist/bundle.js

cp example/index.prod.html example/dist/index.html
cp example/*.css example/dist
cp -R example/fonts example/dist
cp -R example/img example/dist
cp -R example/swagger-files example/dist

# Need to copy over the circleci config so that
# it picks up we want to ignore the gh-pages branch
cp -R .circleci example/dist
