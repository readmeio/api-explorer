rm -rf example/dist
mkdir example/dist
mkdir example/dist/reference

webpack --config webpack.prod.js

# webpack-dev-server requires you to give an exact path match to it's
# bundle otherwise you'll actually be loading the regular built webpack
# file and wont get any auto-reloading, and you have to run webpack -w
sed 's/example\/demo-bundle.js/demo-bundle.js/g' example/index.html > example/dist/index.html
sed 's/example\/reference-bundle.js/reference-bundle.js/g' example/reference/index.html > example/dist/reference/index.html

cp example/*.css example/dist
cp -R example/fonts example/dist
cp -R example/img example/dist
cp -R example/swagger-files example/dist

# # Copy over CNAME for gh-pages custom domain
# cp example/CNAME example/dist
