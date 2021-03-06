'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    uglify: {
      build: {
        files: {
          'dist/countries.min.js': ['dist/countries.js']
        }
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        'dist/countries.js'
      ]
    }
  });

  grunt.registerTask('generate-countries', 'Generate the countries script', function(arg1, arg2) {
    var inputfile = 'countries.yaml';
    var outputfile = 'dist/countries.js';

    var currenciesByISO = {};
    var countriesByISO = {};
    var lines = [];

    var countries = grunt.file.readYAML(inputfile);
    Object.keys(countries).forEach(function(key) {
      var country = countries[key],
        alpha2 = country.alpha2;
      if (alpha2) {
        var currency = country.currency;

        var obj = {
          value: country.alpha2,
          name: country.name,
          names: country.names,
          region: country.region,
          subregion: country.subregion,
          currency: country.currency,
          alpha2: country.alpha2,
          alpha3: country.alpha3,
          ioc: country.ioc,
          number: country.number,
          tel: country.country_code,
          latitude: country.latitude,
          longitude: country.longitude,
          un: country.un_locode
        };

        if(country.commonname) {
          obj.commonname = country.commonname;
        }

        countriesByISO[alpha2] = obj;

        if (!currenciesByISO[country.currency]) {
          currenciesByISO[country.currency] = {
            value:  country.currency,
            name: country.currency,
            countries: [obj.value]
          };
        } else {
          currenciesByISO[country.currency].countries.push(obj.value);
        }
      }

    });

    function loadTemplate(callback) {
      var template = grunt.file.read(__dirname + '/' + 'countries.js.template');
      callback(null, template.toString());
    }

    loadTemplate(function(err, template) {
      if(err || !template) {
        console.log('Failed to load template'.red);
        console.log(err);
      }
      template = template.replace('\'%%countries%%\'', JSON.stringify(countriesByISO, null, 2));
      template = template.replace('\'%%currencies%%\'', JSON.stringify(currenciesByISO, null, 2));
      
      grunt.file.write(outputfile, template);
    });


  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Default task(s).
  grunt.registerTask('default', [
    'generate-countries',
    'jshint',
    'uglify'
  ]);

};
