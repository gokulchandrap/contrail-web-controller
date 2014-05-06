/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
/*jshint node:true */
module.exports = function( grunt ) {

    grunt.loadNpmTasks( "grunt-contrib-jshint" );
    grunt.loadNpmTasks( "grunt-contrib-qunit" );
    grunt.loadNpmTasks('grunt-qunit-junit');
    grunt.loadNpmTasks('grunt-blanket-qunit');
    grunt.loadNpmTasks('grunt-karma');

    grunt.initConfig({
        pkg: grunt.file.readJSON( "../../../../../contrail-web-core/package.json" ),
        karma: {
            unit:{
                configFile:'karma.conf.js'
            }
        },
        qunit_junit: {
            options: {
            // Task-specific options go here.
            }
        },
        blanket_qunit: {
            all: {
                options: {
                    urls: ['test/tenant_monitor_network_test.html?coverage=true'],
                    threshold: 20
                }
            }
        },

        jshint: {
            options: {
                jshintrc: ".jshintrc"
            },
            files: [ "Gruntfile.js"]
        },
        qunit: {
            'all': {
                options: {
                    urls: [
                        "tenant_monitor_network_test.html"
                    ]
                }
            },
            'tenant_monitor_network': {
                options: {
                    urls: [
                        "tenant_monitor_network_test.html"
                    ]
                }
            }
        }
    });

    grunt.registerTask( "test", [ "qunit_junit", "blanket_qunit","qunit" ] );
    grunt.registerTask( "default", [ "blanket_qunit", "jshint", "qunit" ] );

};
