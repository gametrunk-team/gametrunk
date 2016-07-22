/**
 * Created by jmertens on 7/19/16.
 */
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('challenge', ['core']);
ApplicationConfiguration.registerModule('challenge', ['core.admin']);
ApplicationConfiguration.registerModule('core.admin.routes', ['ui.router']);
