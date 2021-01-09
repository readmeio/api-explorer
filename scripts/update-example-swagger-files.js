const path = require('path');
const { readdirSync, writeFileSync } = require('fs');

const dir = path.join(__dirname, '/../example/swagger-files/');
const files = readdirSync(dir);

const directory = files
  .filter(file => file !== 'directory.json' && !file.startsWith('.'))
  .map(file => {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const definition = require(path.join(dir, file));

    if ('readmeManual' in definition) {
      return {
        [path.basename(file)]: {
          preferred: 'manual',
          versions: {
            manual: {
              swaggerUrl: path.join('swagger-files', file),
            },
          },
        },
      };
    }

    return {
      [path.basename(file)]: {
        preferred: definition.info.version,
        versions: {
          [definition.info.version]: {
            swaggerUrl: path.join('swagger-files', file),
          },
        },
      },
    };
  })
  .reduce((prev, next) => Object.assign(prev, next));

writeFileSync(path.join(__dirname, '../example/swagger-files/directory.json'), JSON.stringify(directory, null, 2));
