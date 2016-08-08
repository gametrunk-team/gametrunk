'use strict';

module.exports = {
  client: {
    lib: {
      css: [
        'public/lib/bootstrap/dist/css/bootstrap.min.css',
        'public/lib/bootstrap/dist/css/bootstrap-theme.min.css',
        'public/lib/gridster/dist/jquery.gridster.css',
        'public/lib/decksterjs/dist/jquery.deckster.css',
        'public/lib/components-font-awesome/css/font-awesome.css'
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
        'public/lib/angular-timeago/dist/angular-timeago.js',
        'https://www.google.com/recaptcha/api.js',
        'public/lib/decksterjs/dist/jquery.deckster.js',
        'public/lib/ng-lodash/build/ng-lodash.js'
      ]
    },
    css: 'public/dist/application.min.css',
    js: 'public/dist/application.min.js',
    views: ['modules/*/client/views/**/*.html'],
    templates: ['build/templates.js']
  }
};
