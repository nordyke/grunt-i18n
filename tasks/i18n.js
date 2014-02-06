var defaultParser, parsers, path, transifexParser;

path = require('path');

"Just returns whatever it is given";

defaultParser = function(locale) {
  return locale;
};

"Locales from Transifex have one property to name the particular locale, with the\ntranslations all below that. E.G. { \"en\": {\"message\": \"Hello, world!\"} }";

transifexParser = function(locale) {
  var keys;
  keys = Object.keys(locale);
  if (keys.length === 1 && typeof locale[keys[0]] === 'object') {
    return locale[keys[0]];
  } else {
    return locale;
  }
};

parsers = {
  'default': defaultParser,
  transifex: transifexParser
};

module.exports = function(grunt) {
  var generateOutputPath, translateTemplate;
  grunt.registerMultiTask('i18n', 'Localize Grunt templates', function() {
    var localePath, localePaths, options, outputPath, template, templatePath, _i, _len, _ref, _results;
    options = this.options({
      locales: [],
      output: '.',
      base: '',
      format: 'default'
    });
    grunt.verbose.writeflags(options, 'Options');

    // Default Locale Path
    defaultLocalePath = grunt.file.expand(options.defaultLocale);

    _ref = this.filesSrc;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      templatePath = _ref[_i];
      if (grunt.file.isFile(templatePath)) {
        localePaths = grunt.file.expand(options.locales);
        grunt.log.writeln(localePaths);
        _results.push((function() {
          var _j, _len1, _results1;
          _results1 = [];
          for (_j = 0, _len1 = localePaths.length; _j < _len1; _j++) {
            localePath = localePaths[_j];
            outputPath = generateOutputPath(templatePath, localePath, options);
            template = translateTemplate(templatePath, localePath, defaultLocalePath, options);
            grunt.verbose.writeln("Translating '" + templatePath + "' with locale '" + localePath + "' to '" + outputPath + "'.");
            _results1.push(grunt.file.write(outputPath, template));
          }
          return _results1;
        })());
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  });
  translateTemplate = function(templatePath, localePath, defaultLocalePath, options) {
    var locale, localeFileContent, defaultLocaleFileContent, template, templateOptions;
    template = grunt.file.read(templatePath);
    if (/(\.yaml|\.yml)$/.test(localePath)) {
      localeFileContent = grunt.file.readYAML(localePath);
    } else {
      localeFileContent = grunt.file.readJSON(localePath);
      defaultLocaleFileContent = grunt.file.readJSON(defaultLocalePath);
    }

    // Merge default locale values.
    grunt.util._.defaults(localeFileContent,defaultLocaleFileContent);

    locale = parsers[options.format](localeFileContent);
    templateOptions = {
      data: locale
    };
    if (options.delimiters) {
      templateOptions.delimiters = options.delimiters;
    }
    return grunt.template.process(template, templateOptions);
  };
  generateOutputPath = function(templatePath, localePath, options) {
    var filePath, localeFolder, trimmedFilePath;
    localeFolder = path.basename(localePath, path.extname(localePath));
    if (grunt.util._.startsWith(templatePath, options.base)) {
      filePath = templatePath.slice(options.base.length);
    }
    trimmedFilePath = grunt.util._.trim(filePath, '/');
    return [options.output, localeFolder, trimmedFilePath].join('/');
  };
  return this;
};
