#!/usr/bin/env node
'use strict';
var Cesium = require('cesium');
var path = require('path');
var Pipeline = require('../lib/Pipeline');

var defaultValue = Cesium.defaultValue;
var defined = Cesium.defined;
var processFileToDisk = Pipeline.processFileToDisk;

var argv = require('yargs')
    .usage('Usage: node $0 -i inputPath -o outputPath')
    .example('node $0 -i ./specs/data/boxTexturedUnoptimized/CesiumTexturedBoxTest.gltf -o output.gltf')
    .help('h')
    .alias('h', 'help')
    .options({
        'input': {
            alias: 'i',
            describe: 'input=PATH, Read unoptimized glTF from the specified file.',
            group: 'Options:', // make sure 'Options:' is listed first
            normalize: true,
            type: 'string'
        },
        'output': {
            alias: 'o',
            describe: 'output=PATH, Write optimized glTF to the specified file.',
            normalize: true,
            type: 'string'
        },
        'binary': {
            alias: 'b',
            describe: 'Write binary glTF file using KHR_binary_glTF extension.',
            type: 'boolean'
        },
        'separate': {
            alias: 's',
            describe: 'Write separate geometry/animation data files, shader files, and textures instead of embedding them in the glTF asset.',
            type: 'boolean'
        },
        'separateImage': {
            alias: 't',
            describe: 'Write out separate textures, but embeds geometry/animation data files and shader files in the glTF asset.',
            type: 'boolean'
        },
        'quantize': {
            alias: 'q',
            describe: 'Quantize the attributes of this glTF asset using the WEB3D_quantized_attributes extension.',
            type: 'boolean'
        },
        'encodeNormals': {
            alias: 'n',
            describe: 'Oct-encode the normals of this glTF asset.',
            type: 'boolean'
        },
        'compressTextureCoordinates': {
            alias: 'c',
            describe: 'Compress the testure coordinates of this glTF asset.',
            type: 'boolean'
        },
        'cesium': {
            describe: 'Optimize the glTF for Cesium by using the sun as a default light source.',
            type: 'boolean'
        },
        'ao.enable': {
            default: false,
            describe: 'Bake ambient occlusion (to vertex data by default). If other `ao` flags are enabled, this is implicitly true.',
            group: 'Options: Ambient Occlusion'
        },
        'ao.toTexture': {
            default: false,
            describe: 'Bake AO to existing diffuse textures instead of vertices. Does not modify shaders.',
            group: 'Options: Ambient Occlusion'
        },
        'ao.groundPlane': {
            default: false,
            describe: 'Simulate a ground plane at the lowest point of the model when baking AO.',
            group: 'Options: Ambient Occlusion'
        },
        'ao.ambientShadowContribution': {
            default: 0.5,
            describe: 'Amount of AO to show when blending shader computed lighting and AO. 1.0 is full AO, 0.5 is a 50/50 blend.',
            group: 'Options: Ambient Occlusion',
            nargs: 1,
            type: 'number'
        },
        'ao.quality': {
            choices: ['high', 'medium', 'low'],
            default: 'low',
            describe: 'Quality to use when baking AO. Valid settings are high, medium, and low.',
            group: 'Options: Ambient Occlusion',
            nargs: 1,
            type: 'string'
        }
    })
    .argv;

// If any raw ao parameters were specified, ao is enabled
var nargs = process.argv.length;
for (var i = 0; i < nargs; i++) {
    var arg = process.argv[i];
    if (arg.indexOf('ao') >= 0) {
        argv.ao.enable = true;
    }
}

var inputPath = defaultValue(argv.i, argv._[0]);
var outputPath = defaultValue(argv.o, argv._[1]);

var fileExtension = path.extname(inputPath);


if (!defined(outputPath)) {
    var outputFileExtension;
    if (argv.b) {
        outputFileExtension = '.glb';
    } else {
        outputFileExtension = '.gltf';
    }
    var fileExtension = path.extname(gltfPath);
    var fileName = path.basename(gltfPath, fileExtension);
    var filePath = path.dirname(gltfPath);
    // Default output.  For example, path/asset.gltf becomes path/asset-optimized.gltf
    outputPath = path.join(filePath, fileName + '-optimized' + outputFileExtension);
}

var options = {
    binary : argv.b,
    embed : !argv.s,
    embedImage : !argv.t,
    quantize : argv.q,
    encodeNormals : argv.n,
    compressTextureCoordinates : argv.c,
    aoOptions : argv.ao,
    optimizeForCesium : argv.cesium
};

console.time('optimize');
// Node automatically waits for all promises to terminate
processFileToDisk(gltfPath, outputPath, options)
    .then(function() {
        console.timeEnd('optimize');
    });
