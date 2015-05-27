module.exports = function (window) {
    "use strict";

    require('./css/i-chart-line.css'); // <-- define your own itag-name here

    var itagCore = require('itags.core')(window),
        pseudoName = 'line', // <-- define your own pseudo-name here
        itagName = 'i-chart#'+pseudoName, // <-- define your own itag-name here
        DOCUMENT = window.document,
        ITSA = window.ITSA,
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
                    series = element.model.series,
                    len = series.length,
                    content = '',
                    graphs = '',
                    markerDefs, i, serie, legend, data;

                var markerSize = 3;
                var refCorrection = markerSize/2;
                // IE has a buggy implementation of markers :(
                // therefore, IE gets all markers as separate rectancles...
                markerDefs = '<defs>'+
                                 '<marker id="i-graph_marker-1" markerWidth="'+markerSize+'" markerHeight="'+markerSize+'" refX="'+refCorrection+'" refY="'+refCorrection+'" markerUnits="strokeWidth">'+
                                     '<rect x="0" y="0" width="'+markerSize+'" height="'+markerSize+'" style="fill:#F00" />'+
                                 '</marker>'+
                             '</defs>';

                for (i=0; i<len; i++) {
                    serie = series[i];
                    legend = serie.legend;
                    data = serie.data;
                    graphs += '<polyline i-serie="'+legend+'" points="'+element.generatePoints(data)+'" fill="none" stroke="#000" stroke-width="3" marker-end="url(#i-graph_marker-1)" marker-start="url(#i-graph_marker-1)" marker-mid="url(#i-graph_marker-1)" />';
                }

                if (model['x-axis']) {
                    content += '<section is="x-axis">'+model['x-axis']+'</section>';
                }

                content += '<section is="grapharea">';
                if (model['y-axis']) {
                    content += '<section is="y-axis">'+model['y-axis']+'</section>';
                }
                content += '<svg>'+markerDefs+graphs+'</svg>';
                if (model['y2-axis']) {
                    content += '<section is="y2-axis">'+model['y2-axis']+'</section>';
                }
                content += '</section>';

                if (model['x2-axis']) {
                    content += '<section is="x2-axis">'+model['x-axis']+'</section>';
                }
                return content;
            },

            generatePoints: function(data) {
                var element = this,
                    len = data.length,
                    graphData = '',
                    index = 0,
                    i, point;
                for (i=0; i<len; i++) {
                    point = data[i];
                    if (point[0]) {
                        graphData += ' '+point[0]+','+point[1];
                    }
                    else {
                        graphData += ' '+index+','+point;
                        index += 25;
                    }
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
