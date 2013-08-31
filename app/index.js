'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var brei = require('brei-junk');

var BreiAppGenerator = module.exports = function BreiAppGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  // Get our BREI utilities (if any)
  this.brei = brei;  

  // Read in the index file so we can append stuff to it later
  this.indexFile = this.readFileAsString(path.join(this.sourceRoot(), 'index.html'));

  // Install bower stuff
  this.on('end', function () {
    this.installDependencies({ skipInstall: options['skip-install'] });
  });

  // Set app version
  this.appversion = "0.0.0";

  // Read in package info
  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(BreiAppGenerator, yeoman.generators.Base);

BreiAppGenerator.prototype.askFor = function askFor() {
  var cb = this.async();

  // welcome message
  console.log(this.brei.logo());
  console.log(this.yeoman);
  console.log('Out of the box I include HTML5 Boilerplate, jQuery (1.x) and Modernizr.');

  var prompts = [{
    type: 'checkbox',
    name: 'features',
    message: 'What more would you like?',
    choices: [{
      name: 'Use SASS/Compass',
      value: 'includeSass',
      checked: false
    }, {
      name: 'Autoprefixer for your CSS',
      value: 'autoprefixer',
      checked: true
    }, {
      name: 'Sprite images in CSS folder (css/i)',
      value: 'spriteCSS',
      checked: true
    }]},
    {
      type: 'input',
      name: 'deployDirectory',
      message: 'Deploy directory (relative to current path)',
      default: "../../deploy"
    },
    {
      type: 'input',
      name: 'appVersion',
      message: 'App version',
      default: "0.0.0"
    }
  ];

  this.prompt(prompts, function (answers) {
    var features = answers.features;
    var deployDirectory = answers.deployDirectory;
    var appVersion = answers.appVersion;

    // manually deal with the response, get back and store the results.
    // we change a bit this way of doing to automatically do this in the self.prompt() method.
    this.includeSass = features.indexOf('includeSass') !== -1;
    this.autoprefixer = features.indexOf('autoprefixer') !== -1;
    this.spriteCSS = features.indexOf('spriteCSS') !== -1;
    this.deployDirectory = deployDirectory;
    this.appversion = appVersion;

    cb();
  }.bind(this));
};

BreiAppGenerator.prototype.gruntfile = function gruntfile() {
  this.template('Gruntfile.js');
};

BreiAppGenerator.prototype.packageJSON = function packageJSON() {
  this.template('_package.json', 'package.json');
};

BreiAppGenerator.prototype.bower = function bower() {
  this.copy('bowerrc', '.bowerrc');
  this.copy('_bower.json', 'bower.json');
};

BreiAppGenerator.prototype.jshint = function jshint() {
  this.copy('jshintrc', '.jshintrc');
};

BreiAppGenerator.prototype.addJQuery = function jshint() {
  
  this.indexFile = this.appendScripts(this.indexFile, 'js/main.js', [
    'bower_components/jquery/jquery.js'
  ]);

};

BreiAppGenerator.prototype.mainStylesheet = function mainStylesheet() {
  if (this.includeSass) {
    this.copy('main.scss', 'app/sass/main.scss');
    this.copy('normalize.css', 'app/sass/normalize.scss');
  } else {
    this.copy('main.css', 'app/css/main.css');
    this.copy('normalize.css', 'app/css/normalize.css');
  }
};

BreiAppGenerator.prototype.writeIndex = function writeIndex() {
  // prepare default content text
  var defaults = ['HTML5 Boilerplate'];
  var contentText = [
    '        <div class="container">',
    '            <h1>Hello World!</h1>'
  ];

  contentText = contentText.concat([
    '        </div>',
    ''
  ]);

  // append the default content
  this.indexFile = this.indexFile.replace('<body>', '<body>\n' + contentText.join('\n'));
};

BreiAppGenerator.prototype.app = function app() {
  this.mkdir('app');
  this.mkdir('app/js');
  this.mkdir('app/css');
  if (this.spriteCSS) {
    this.mkdir('app/css/i'); // Used for sprite images. Optional
  }

  // adds additional directories for sass
  if (this.includeSass) {
    this.mkdir('app/sass');
    this.mkdir('app/sass/modules');
    this.mkdir('app/sass/helpers');
  }

  this.mkdir('app/img');
  this.write('app/index.html', this.indexFile);

  this.write('app/js/main.js', '// Main JavaScript file');
  
};