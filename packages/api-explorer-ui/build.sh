browserify src/index.jsx \
  --extension jsx \
  --standalone ApiExplorer \
  -t [ babelify ] \
  -g [ envify --NODE_ENV production ] \
  -g uglifyify \
  | uglifyjs --compress --mangle > ./dist/index.js
