module.exports = function (grunt) {

  var docsetPath = 'ExpressJS.docset/Contents';
  var docsetPathPlist = docsetPath + '/Info.plist';
  var docsetPathDB    = docsetPath + '/Resources/docSet.dsidx';
  var docsetPathDocs  = docsetPath + '/Resources/Documents/';
  var srcPath = 'src/expressjs.com/';

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-dom-munger');

  var config = {
    clean: [docsetPath + '/*'],
    copy: {
      meta: {
        src: 'template/Info.plist',
        dest: docsetPathPlist
      },
      docs: {
        files: [
          {src: srcPath + 'style.css', dest: docsetPathDocs + 'style.css'},
          {
            expand: true,
            src: srcPath + 'images/*',
            dest: docsetPathDocs + 'images/',
            flatten: true
          }
        ]
      }
    },
    dom_munger: {
      api: {
        options: {
          remove: 'script, nav.clearfix, #menu',
          callback: function ($) {
            // Convert relative protocol links to explicit http
            $('link[href^="//"]').attr('href', function (i, oldHref) {
              return 'http:' + oldHref;
            });
          }
        },
        src: srcPath + 'api.html',
        dest: docsetPathDocs + 'api.html'
      }
    }
  };

  grunt.initConfig(config);

  // Update submodule for expressjs.com site
  grunt.loadNpmTasks('grunt-update-submodules');
  grunt.registerTask('update', ['update_submodules']);

  // Build docset index
  grunt.registerTask('index', function () {
    var gruntDone = this.async();

    var cheerio = require('cheerio'),
      Sequelize = require('sequelize'),
      _ = require('underscore');
      fs = require('fs');

    var reEndParens = /\(\)$/;
    var idxGroups;

    // Read the API file and get out the links we want
    var apiHtml = fs.readFileSync(srcPath + 'api.html');
    var $ = cheerio.load(apiHtml);
    idxGroups = $('#menu > li').map(function () {
      var $li = $(this);
      // Any top-level links are groups
      var $link = $li.children('a');
      var group = {
        type: 'Guide',
        name: $link.text(),
        link: '#' + $link.text().toLowerCase(), // The links point to a method anchor, use the group anchor instead
        children: []
      };

      // Find all methods in this group
      group.children = _.flatten($li.find('ul > li').map(function () {
        var $link = $(this).children('a');
        var name = $link.text();
        var isMethod = reEndParens.test(name);
        var type = isMethod ? 'Function' : 'Property';
        if (isMethod) {
          name = name.replace(reEndParens, '');
        }
        return {
          type: type,
          name: name,
          link: $link.attr('href')
        };
      }));

      return group;
    });

    // Create database file
    // Most of this section copied from https://github.com/exlee/d3-dash-gen
    var db = new Sequelize('database', 'username', 'password', {
      dialect: 'sqlite',
      storage: docsetPathDB
    });

    // Create the searchIndex table
    var table = db.define('searchIndex', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.TEXT
      },
      type: {
        type: Sequelize.TEXT
      },
      path: {
        type: Sequelize.TEXT
      }
    }, {
      freezeTableName: true,
      timestamps: false
    });

    var errorHandler = function () {
      gruntDone(false);
    };

    table.sync({force: true}).success(function () {
      // Add the data
      var buildRowData = function (data) {
        return {
          name: data.name,
          type: data.type,
          path: 'api.html' + data.link
        };
      };

      var rows = _.flatten(_.map(idxGroups, function (group) {
        return [group].concat(group.children);
      }));

      table.bulkCreate(_.map(rows, buildRowData))
        .success(gruntDone)
        .error(errorHandler);

    }).error(errorHandler);
  });

  // Main task
  grunt.registerTask('generate', ['update', 'copy:meta', 'copy:docs', 'dom_munger:api', 'index']);
  grunt.registerTask('default', ['generate']);

};
