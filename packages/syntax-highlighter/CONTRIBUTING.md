# Contributing
For general contributing guidelines for this repository, consult the root [contributing guide](https://github.com/readmeio/api-explorer/blob/master/CONTRIBUTING.md).

## Adding support for a new language

To add a new language:

* Create a new directory in the fixtures directory for the language (for example): `__tests__/__fixtures__/js/`
* Add a `sample.js` file into `__tests__/__fixtures__/js/` containing a code snippet of the language you're targeting
    * https://github.com/leachim6/hello-world/ is a helpful resource covering most every language
* Add a `index.js` file in `__tests__/__fixtures__/js/` that matches the following structure:

```js
module.exports = {
  // This is the proper name of the language you're adding.
  language: 'JavaScript',

  mode: {
    // This is the primary language mode.
    primary: 'js',

    // This is a canonical, human-friendly, reference that can be used the entire language. You can omit this if it's
    // the same value as `primary`.
    canonical: 'javascript',

    aliases: {
      // Any additional extension modes that this language might utilize or be known under (SQL variantes for example).
      // Consult the CodeMirror meta file for this list.
      languageModeAlias: 'Language Name'
    },
  },
};
```

* Update `canonical.js` and add any mode aliases you've added into your test, mapping them back to the canonical version
  * `yml` → `yaml`, `ts` → `typescript`, etc.
* Update `uppercase.js` for any new language names, or aliases, you've added.
* Lastly, make sure that the README is updated! 🚀
