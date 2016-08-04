'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
  console.log("app config file");

  // Init module configuration options
  var applicationModuleName = 'seanjs';
  var applicationModuleVendorDependencies = ['ngResource', 'ngAnimate', 'ngMessages', 'ui.router', 'ui.bootstrap', 'ui.utils', 'angularFileUpload'];

  // Add a new vertical module
  var registerModule = function(moduleName, dependencies) {
    console.log("registering", moduleName);

    // Create angular module
    angular.module(moduleName, dependencies || []);

    // Add the module to the AngularJS configuration file
    angular.module(applicationModuleName).requires.push(moduleName);
    console.log("end of registration");
  };

  return {
    applicationModuleName: applicationModuleName,
    applicationModuleVendorDependencies: applicationModuleVendorDependencies,
    registerModule: registerModule
  };
})();
