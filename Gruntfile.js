module.exports = function (grunt) {

  var docsetPath = 'ExpressJS.docset/Contents';
  var docsetPathPlist = docsetPath + '/Info.plist';
  var docsetPathDB    = docsetPath + '/Resources/docSet.dsidx';
  var docsetPathDocs  = docsetPath + '/Resources/Documents/';

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
          {src: 'src/expressjs.com/style.css', dest: docsetPathDocs + 'style.css'},
          {
            expand: true,
            src: 'src/expressjs.com/images/*',
            dest: docsetPathDocs + 'images/',
            flatten: true
          }
        ]
      }
    },
    dom_munger: {
      docs: {
        options: {
          remove: 'script, nav.clearfix, #menu'
        },
        src: 'src/expressjs.com/api.html',
        dest: docsetPathDocs + 'api.html'
      }
    }
  };

  grunt.initConfig(config);

  // Update submodule for expressjs.com site
  grunt.loadNpmTasks('grunt-update-submodules');
  grunt.registerTask('update', ['update_submodules']);

  // TODO: Build docset index
  // grunt.registerTask('index', function () {});

  // Main task
  grunt.registerTask('generate', ['update', 'copy:meta', 'copy:docs', 'dom_munger:docs']);
  grunt.registerTask('default', ['generate']);

};
