module.exports = function (window) {
    "use strict";

    require('./css/i-chart-line.css'); // <-- define your own itag-name here

    var itagCore = require('itags.core')(window),
        pseudoName = 'line', // <-- define your own pseudo-name here
        itagName = 'i-chart#'+pseudoName, // <-- define your own itag-name here
        DOCUMENT = window.document,
        ITSA = window.ITSA,
        EXTRA_SPACE_Y = 0.15, // fraction of the canvas to keep some breath in the y-direction when maxy isn't defined
        Itag, IChart;

    if (!window.ITAGS[itagName]) {

        IChart = require('i-chart')(window);
        Itag = IChart.pseudoClass(pseudoName, {
            attrs: {
                'x2-axis-label': 'string',
                'y2-axis-label': 'string',
                'x-raster': 'string',
                'x-raster-secondary': 'string',
                'y-raster': 'string',
                'y-raster-secondary': 'string',
                'x-axis-min': 'number',
                'x-axis-max': 'number',
                'y-axis-min': 'number',
                'y-axis-max': 'number',
                'x2-axis-min': 'number',
                'x2-axis-max': 'number',
                'y2-axis-min': 'number',
                'y2-axis-max': 'number'
            },

            init: function() {
            },

            renderGraph: function() {
                var element = this,
                    model = element.model,
                    content = '',
                    svgNode;

                if (model['x-axis']) {
                    content += '<section is="x-axis">'+model['x-axis']+'</section>';
                }
                content += '<section is="grapharea">';
                if (model['y-axis']) {
                    content += '<section is="y-axis">'+model['y-axis']+'</section>';
                }
                // at this stage, we must retain the current content of the svg-element
                // it will be updated by `createSeries`, but we need to pass through the current values, to prevent
                // the vdom from clearing and resetting, which basicly would mean no diffing-advangage
                svgNode = element.getData('_svgNode');
                content += svgNode ? svgNode.outerHTML() : '<svg></svg>';
                if (model['y2-axis']) {
                    content += '<section is="y2-axis">'+model['y2-axis']+'</section>';
                }
                content += '</section>';

                if (model['x2-axis']) {
                    content += '<section is="x2-axis">'+model['x-axis']+'</section>';
                }
                return content;
            },

            createSeries: function() {
                // needs to be done AFTER the dom has the svg-area, because some types need to calculate its sizes
                // in oder to be able to set the series at the right position
                var element = this,
                    model = element.model,
                    series = element.model.series,
                    minx = model['x-axis-min'],
                    maxx = model['x-axis-max'],
                    miny = model['y-axis-min'],
                    maxy = model['y-axis-max'],
                    minx2 = model['x2-axis-min'],
                    maxx2 = model['x2-axis-max'],
                    miny2 = model['y2-axis-min'],
                    maxy2 = model['y2-axis-max'],
                    xminDefined = (minx!==undefined),
                    xmaxDefined = (maxx!==undefined),
                    yminDefined = (miny!==undefined),
                    ymaxDefined = (maxy!==undefined),
                    x2minDefined = (minx2!==undefined),
                    x2maxDefined = (maxx2!==undefined),
                    y2minDefined = (miny2!==undefined),
                    y2maxDefined = (maxy2!==undefined),
                    len = series.length,
                    graphs = '',
                    markerDefs, i, serie, legend, svgNode, boundaries, useX2, useY2, serieBoundaries, extra;

                if (!element.hasData('_svgNode')) {
                    element.setData('_svgNode', element.getElement('svg'));
                }
                svgNode = element.getData('_svgNode');

                var markerSize = 3;
                var refCorrection = markerSize/2;
                // IE has a buggy implementation of markers :(
                // therefore, IE gets all markers as separate rectancles...
                markerDefs = '<defs>'+
                                 '<marker id="i-graph_marker-1" markerWidth="'+markerSize+'" markerHeight="'+markerSize+'" refX="'+refCorrection+'" refY="'+refCorrection+'" markerUnits="strokeWidth">'+
                                     '<rect x="0" y="0" width="'+markerSize+'" height="'+markerSize+'" style="fill:#F00" />'+
                                 '</marker>'+
                             '</defs>';

                // first of all, we need to determine the axis's minimum and maximum values
                // because this will effect the positions of the drawn points

                // start with determine whether we are using x2 or y2 axis:

                for (i=0; (i<len) && !useX2 && !useY2; i++) {
                    serie = series[i];
                    useX2 = useX2 || serie['x2-axis'];
                    useY2 = useY2 || serie['y2-axis'];
                }

                xminDefined || (minx=0);
                x2minDefined || (minx2=0);
                yminDefined || (miny=0);
                y2minDefined || (miny2=0);
                for (i=0; i<len; i++) {
                    serie = series[i];
                    legend = serie.legend;
                    serieBoundaries = element.getSeriesBoundaries(serie.data);
                    if (!serie['x2-axis']) {
                        // check x-axis
                        if (!xminDefined && ((serieBoundaries.minx<minx) || (minx===undefined))) {
                            minx = serieBoundaries.minx;
                        }
                        if (!xmaxDefined  && ((serieBoundaries.maxx>maxx) || (maxx===undefined))) {
                            maxx = serieBoundaries.maxx;
                        }
                    }
                    else {
                        // check x2-axis
                        if (!x2minDefined && ((serieBoundaries.minx<minx2) || (minx2===undefined))) {
                            minx2 = serieBoundaries.minx;
                        }
                        if (!x2maxDefined  && ((serieBoundaries.maxx>maxx2) || (maxx2===undefined))) {
                            maxx2 = serieBoundaries.maxx;
                        }
                    }
                    if (!serie['y2-axis']) {
                        // check y-axis
                        if (!yminDefined && ((serieBoundaries.miny<miny) || (miny===undefined))) {
                            miny = serieBoundaries.miny;
                        }
                        if (!ymaxDefined  && ((serieBoundaries.maxy>maxy) || (maxy===undefined))) {
                            maxy = serieBoundaries.maxy;
                        }
                    }
                    else {
                        // check y2-axis
                        if (!y2minDefined && ((serieBoundaries.miny<miny2) || (miny2===undefined))) {
                            miny2 = serieBoundaries.miny;
                        }
                        if (!y2maxDefined  && ((serieBoundaries.maxy>maxy2) || (maxy2===undefined))) {
                            maxy2 = serieBoundaries.maxy;
                        }
                    }
                }
                // now: minx, maxx, miny, maxy, minx2, maxx2, miny2, maxy2 are known
                // we might need some extra space arround y:
                if (!ymaxDefined) {
                    extra = EXTRA_SPACE_Y*(maxy-miny);
                    maxy += extra;
                }
                if (!yminDefined && (miny<0)) {
                    extra = EXTRA_SPACE_Y*(maxy-miny);
                    miny -= extra;
                }
                if (!y2maxDefined && (maxy2!==undefined)) {
                    extra = EXTRA_SPACE_Y*(maxy2-miny2);
                    maxy2 += extra;
                }
                if (!y2minDefined && (maxy2!==undefined) && (miny2<0)) {
                    extra = EXTRA_SPACE_Y*(maxy2-miny2);
                    miny2 -= extra;
                }
                boundaries = {
                    minx: minx,
                    maxx: maxx,
                    miny: miny,
                    maxy: maxy,
                    minx2: minx2,
                    maxx2: maxx2,
                    miny2: miny2,
                    maxy2: maxy2
                };

                // next: create series
                for (i=0; (i<len); i++) {
                    serie = series[i];
                    legend = serie.legend;
                    graphs += '<polyline i-serie="'+legend+'" points="'+element.generateSerieData(serie, boundaries)+'" fill="none" stroke="#000" stroke-width="3" marker-end="url(#i-graph_marker-1)" marker-start="url(#i-graph_marker-1)" marker-mid="url(#i-graph_marker-1)" />';
                }

                svgNode.setHTML(markerDefs+graphs);
            },

            getSeriesBoundaries: function(data) {
                var len = data.length,
                    index = 0,
                    minx = 0,
                    maxx = 0,
                    miny = 0,
                    maxy = 0,
                    i, point, isArrayPos, x, y;
                for (i=0; i<len; i++) {
                    point = data[i];
                    isArrayPos = (typeof point!=='number');
                    if (isArrayPos) {
                        x = point[0];
                        y = point[1];
                    }
                    else {
                        x = index;
                        y = point;
                    }
                    if (x>maxx) {
                        maxx = x;
                    }
                    else if (x<minx) {
                        minx = x;
                    }
                    if (y>maxy) {
                        maxy = y;
                    }
                    else if (y<miny) {
                        miny = y;
                    }
                    isArrayPos && (index += 25);
                }
                return {
                    minx: minx,
                    maxx: maxx,
                    miny: miny,
                    maxy: maxy
                };
            },


            generateSerieData: function(serie, boundaries) {
                var element = this,
                    serieData = serie.data,
                    len = serieData.length,
                    graphData = '',
                    index = 0,
                    svgNode = element.getData('_svgNode'),
                    svgWidth = svgNode.offsetWidth, // cannot use node.width, for svg-elements have their own definition of `width`
                    svgHeight = svgNode.offsetHeight, // cannot use node.height, for svg-elements have their own definition of `height`
                    serieIsArray = (len>0) && Array.isArray(serieData[0]),
                    indent, i, point, x, y, yShift,
                    minx, maxx, miny, maxy, scaleX, scaleY;
                if (len===0) {
                    return '';
                }
console.warn('generateSerieData');
console.warn(boundaries);
console.warn('svgWidth '+svgWidth);
                if (serie['x2-axis']) {
                    minx = boundaries.minx2;
                    maxx = boundaries.maxx2;
                }
                else {
                    minx = boundaries.minx;
                    maxx = boundaries.maxx;
                }
                if (serie['y2-axis']) {
                    miny = boundaries.miny2;
                    maxy = boundaries.maxy2;
                }
                else {
                    miny = boundaries.miny;
                    maxy = boundaries.maxy;
                }

// console.warn('minx '+minx);
// console.warn('maxx '+maxx);
// console.warn('miny '+miny);
// console.warn('maxy '+maxy);
// console.warn('scaleX '+scaleX);
// console.warn('scaleY '+scaleY);

                if (!serieIsArray) {
                    index = 0;
                    indent = (len>1) ? Math.round(svgWidth/(len-1)) : 0;
                }
                else {
                    // now we calculate a scalecorrection because of the size of the svg-canvas:
                    scaleX = svgWidth/(maxx-minx);
                }
console.warn('scaleX '+scaleX);
                scaleY = svgHeight/(maxy-miny);
                yShift = scaleY*(maxy-miny);
                for (i=0; i<len; i++) {
                    point = serieData[i];
                    if (serieIsArray) {
                        x = scaleX*(point[0] - minx);
console.warn('x: '+point[0]+' --> '+x);
                        y = yShift - (scaleY*point[1]);
                    }
                    else {
                        x = index;
                        y = yShift - (scaleY*point);
                    }
                    graphData += ' '+x+','+y;
                    serieIsArray || (index += indent);
                }
                // remove starting space when there is data:
                (len>0) && (graphData=graphData.substr(1));
                return graphData;
            },

            destroy: function() {
            }
        });

        window.ITAGS[itagName] = Itag;
    }

    return window.ITAGS[itagName];
};
