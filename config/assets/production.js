'use strict';

module.exports = {
  client: {
    lib: {
      css: [
        'public/lib/bootstrap/dist/css/bootstrap.min.css',
        'public/lib/bootstrap/dist/css/bootstrap-theme.min.css',
        'public/lib/gridster/dist/jquery.gridster.min.css',
        'public/lib/decksterjs/dist/jquery.deckster.min.css',
        'public/lib/components-font-awesome/css/font-awesome.min.css',
        'public/lib/nvd3/build/nv.d3.min.css'
      ],
      js: [
        'public/lib/jquery/dist/jquery.min.js',
        'public/lib/spin.js/spin.js',
        'public/lib/spin.js/jquery.spin.js',
        'public/lib/gridster/dist/jquery.gridster.min.js',
        'public/lib/angular/angular.min.js',
        'public/lib/angular-resource/angular-resource.min.js',
        'public/lib/angular-animate/angular-animate.min.js',
        'public/lib/angular-messages/angular-messages.min.js',
        'public/lib/angular-ui-router/release/angular-ui-router.min.js',
        'public/lib/angular-ui-utils/ui-utils.min.js',
        'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
        'public/lib/angular-file-upload/angular-file-upload.min.js',
        'public/lib/owasp-password-strength-test/owasp-password-strength-test.js',
        'public/lib/angular-timeago/dist/angular-timeago.min.js',
        'https://www.google.com/recaptcha/api.js',
        'public/lib/angulartics/dist/angulartics.min.js',
        'public/lib/angulartics-google-analytics/dist/angulartics-ga.min.js',
        'public/lib/decksterjs/dist/jquery.deckster.min.js',
        'public/lib/ng-lodash/build/ng-lodash.min.js',
        'public/lib/d3/d3.min.js',
        'public/lib/nvd3/build/nv.d3.min.js',
        'public/lib/angular-nvd3/dist/angular-nvd3.min.js'
      ]
    },
    css: 'public/dist/application.min.css',
    js: 'public/dist/application.min.js',
    views: ['modules/*/client/views/**/*.html'],
    templates: ['build/templates.js']
  }
};
