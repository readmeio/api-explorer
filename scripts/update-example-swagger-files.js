const { join, basename } = require('path');
const { readdirSync, writeFileSync } = require('fs');

const dir = join(__dirname, '/../example/swagger-files/');
const files = readdirSync(dir);

const directory = files
  .filter(file => file !== 'directory.json' && !file.startsWith('.'))
  .map(file => {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const swagger = require(join(dir, file));

    return {
      [basename(file)]: {
        preferred: swagger.info.version,
        versions: {
          [swagger.info.version]: {
            swaggerUrl: join('swagger-files', file),
          },
        },
      },
    };
  })
  .reduce((prev, next) => Object.assign(prev, next));

writeFileSync(
  join(__dirname, '../example/swagger-files/directory.json'),
  JSON.stringify(directory, null, 2),
);
