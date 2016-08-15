'use strict';

module.exports = {
  client: {
    lib: {
      css: [
        'public/lib/bootstrap/dist/css/bootstrap.css',
        'public/lib/bootstrap/dist/css/bootstrap-theme.css',
        'public/lib/gridster/dist/jquery.gridster.css',
        'public/lib/decksterjs/dist/jquery.deckster.css',
        'public/lib/components-font-awesome/css/font-awesome.css',
        'public/lib/nvd3/build/nv.d3.min.css'
      ],
      js: [
        'public/lib/jquery/dist/jquery.min.js',
        'public/lib/spin.js/spin.js',
        'public/lib/spin.js/jquery.spin.js',
        'public/lib/gridster/dist/jquery.gridster.min.js',
        'public/lib/angular/angular.js',
        'public/lib/angular-resource/angular-resource.js',
        'public/lib/angular-animate/angular-animate.js',
        'public/lib/angular-messages/angular-messages.js',
        'public/lib/angular-ui-router/release/angular-ui-router.js',
        'public/lib/angular-ui-utils/ui-utils.js',
        'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
        'public/lib/angular-file-upload/angular-file-upload.js',
        'public/lib/owasp-password-strength-test/owasp-password-strength-test.js',
        'public/lib/angular-timeago/dist/angular-timeago.js',
        'public/lib/moment/moment.js',
        'public/lib/moment/locale/*.js',
        'public/lib/moment/min/moment-with-locales.js',
        'https://www.google.com/recaptcha/api.js',
        'public/lib/decksterjs/dist/jquery.deckster.js',
        'public/lib/ng-lodash/build/ng-lodash.js',
        'public/lib/Chart.js/dist/Chart.min.js',
        'public/lib/angular-chart.js/dist/angular-chart.min.js',
          'public/lib/d3/d3.min.js',
          'public/lib/nvd3/build/nv.d3.min.js',
          'public/lib/angular-nvd3/dist/angular-nvd3.min.js'

      ],
      tests: ['public/lib/angular-mocks/angular-mocks.js']
    },
    css: [
      'modules/*/client/css/*.css'
    ],
    less: [
      'modules/*/client/less/*.less'
    ],
    sass: [
      'modules/*/client/scss/*.scss'
    ],
    js: [
      'modules/core/client/app/config.js',
      'modules/core/client/app/init.js',
      'modules/*/client/*.js',
      'modules/*/client/**/*.js'
    ],
    views: ['modules/*/client/views/**/*.html'],
    templates: ['build/templates.js']
  },
  server: {
    gruntConfig: 'gruntfile.js',
    gulpConfig: 'gulpfile.js',
    allJS: ['server.js', 'config/**/*.js', 'modules/*/server/**/*.js', 'modules/core/server/controllers/core.server.controller.js'],
    models: 'modules/*/server/models/**/*.js',
    routes: ['modules/!(core)/server/routes/**/*.js', 'modules/core/server/routes/**/*.js', 'modules/core/server/routes/core.server.routes.js'],
    sockets: 'modules/*/server/sockets/**/*.js',
    config: 'modules/*/server/config/*.js',
    policies: 'modules/*/server/policies/*.js',
    views: 'modules/*/server/views/*.html'
  }
};
