watchify src/index.jsx \
  --extension jsx \
  --standalone ApiExplorer \
  --debug \
  --verbose \
  -t [ babelify ] \
  -o 'derequire > dist/index.js'
