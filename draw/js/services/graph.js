manywho.graph = (function() {

    var editor = new mxEditor();
    var graph = editor.graph;
    var rubberband = new mxRubberband(graph);

    function setDefaultGraphSettings() {

        var options = {};

        graph.maximumContainerSize = new mxRectangle(0, 0, document.getElementById('graph').clientWidth, document.getElementById('graph').clientHeight);
        graph.minimumContainerSize = new mxRectangle(0, 0, document.getElementById('graph').clientWidth, document.getElementById('graph').clientHeight);

        graph.setCellsResizable(true);
        graph.setAutoSizeCells(true);
        graph.setCellsEditable(false);
        graph.setEdgeLabelsMovable(false);
        graph.setConnectable(true);
        graph.setAllowDanglingEdges(false);
        graph.setTooltips(false);
        graph.setAllowLoops(false);
        graph.edgeLabelsMovable = false;
        graph.htmlLabels = true;
        graph.keepEdgesInBackground = true;

        graph.cellLabelChanged = function (cell, newValue, autoSize) {

            autoSize = true;

            this.apply(this, arguments);

        };

        graph.isCellsDisconnectable = function (cell) {

            if (cell && cell.isEdge()) {

                return false;

            }

            return true;

        };


        graph.convertValueToString = function (cell) {

            return cell.value.name;

        };

        graph.getTooltipForCell = function (cell) {

            return cell.value.summary;

        };

        mxConstants.MIN_HOTSPOT_SIZE = 16;
        mxConstants.DEFAULT_HOTSPOT = 1;

        options.HIGHLIGHT_COLOR = '#99CC00';
        options.VERTEX_SELECTION_COLOR = '#DFF0D8';
        options.EDGE_SELECTION_COLOR = '#DFF0D8';
        options.SHADOWCOLOR = '#C0C0C0';

        mxGraphHandler.prototype.guidesEnabled = true;
        //mxPanningHandler.prototype.useLeftButtonForPanning = true;

        $.extend(mxConstants, options);

    }

    return {

        initialize: function (data) {

            var container = document.getElementById('graph');
            var outline = document.getElementById('graph-outline');

            setDefaultGraphSettings();

            manywho.graph.events.initialize();

            manywho.graph.style.initialize(graph);

            manywho.graph.element.initialize();

            editor.setGraphContainer(container);

            var outln = new mxOutline(graph, outline);

            document.getElementById('draw-tool').classList.add('hidden');

        },

        clearGraph: function () {

            graph.removeCells(graph.getChildVertices(graph.getDefaultParent()));

        },

        addElement: function (id, value, x, y, width, height, style) {

            var cell;
            var parent = graph.getDefaultParent();
            graph.getModel().beginUpdate();

            try {

                cell = graph.insertVertex(parent, id, null, x, y, width, height, style.toLowerCase());

                cell.value = value;

            }
            finally
            {

                graph.getModel().endUpdate();

            }

            return cell;

        },

        deleteElement: function (cell) {

            var drawKey = 'draw_draw_draw_main';

            var inputObject = {
                Id: cell.id,
                AuthenticationToken: manywho.state.getAuthenticationToken(drawKey),
                EditingToken: manywho.draw.model.getEditingToken(),
                FlowId: manywho.draw.model.getFlowId(),
                ElementType: "input",
                X: cell.geometry.x,
                Y: cell.geometry.y,
                Command: "delete",
                GroupElementId: ""

            };

            manywho.engine.initializeSystemFlow(cell.style, drawKey, manywho.json.generateFlowInputs(inputObject), [
                {
                    execute: manywho.draw.hideModal,
                    type: 'done',
                    args: [drawKey]
                },
                {
                    execute: manywho.draw.ajax.getFlowGraph,
                    type: 'done',
                    args: []
                }
            ]);

        },

        createOutcomeFlow: function (source, target) {

            var drawKey = 'draw_draw_draw_main';

            var inputObject = {
                Id: source,
                AuthenticationToken: manywho.state.getAuthenticationToken(drawKey),
                EditingToken: manywho.draw.model.getEditingToken(),
                FlowId: manywho.draw.model.getFlowId(),
                NextMapElementId: target,
                Command: "edit",
                OutcomeId: '',
                GroupElementId: ""

            };

            manywho.engine.initializeSystemFlow('outcome', drawKey, manywho.json.generateFlowInputs(inputObject), [
                {
                    execute: manywho.draw.hideModal,
                    type: 'done',
                    args: [drawKey]
                },
                {
                    execute: manywho.draw.ajax.getFlowGraph,
                    type: 'done',
                    args: []
                }
            ]);

        },

        createOutcome: function (id, value, origin, target, style) {

            var outcome;

            graph.getModel().beginUpdate();
            try {

                outcome = graph.insertEdge(graph.getDefaultParent(), id, value, origin, target, style);

            }
            finally
            {

                graph.getModel().endUpdate();

            }

            return outcome;

        },

        deleteOutcome: function (outcome) {

            var drawKey = 'draw_draw_draw_main';

            var inputObject = {
                Id: outcome.source.id,
                AuthenticationToken: manywho.state.getAuthenticationToken(drawKey),
                EditingToken: manywho.draw.model.getEditingToken(),
                FlowId: manywho.draw.model.getFlowId(),
                OutcomeId: outcome.id,
                Command: "delete"
            };

            manywho.engine.initializeSystemFlow('outcome', drawKey, manywho.json.generateFlowInputs(inputObject), [
                {
                    execute: manywho.draw.hideModal,
                    type: 'done',
                    args: [drawKey]
                },
                {
                    execute: manywho.draw.ajax.getFlowGraph,
                    type: 'done',
                    args: []
                }
            ]);

        },

        getElementById: function (id) {

            return graph.getModel().getCell(id);

        },

        getGraphObject: function () {

            return editor;

        },

        render: function () {

            var self = this;

            self.clearGraph();

            var model = manywho.draw.model.getModel();

            var parent = graph.getDefaultParent();
            graph.getModel().beginUpdate();
            
            try {

                var mapElements =  model.mapElements.map(function (mapElement) {

                    mapElement.elementType = mapElement.elementType.toLowerCase();

                    return self.addElement(mapElement.id, {
                            name: mapElement.developerName,
                            summary: mapElement.developerSummary,
                            pageId: mapElement.pageElementId
                        }, mapElement.x, mapElement.y, manywho.utils.isEqual(mapElement.elementType, 'start', true) ? 60 : 120, 60, self.style.getElementStyleByName(mapElement.elementType) ? mapElement.elementType : 'base');

                });

                model.mapElements.forEach(function (mapElement) {

                    if (mapElement.outcomes && mapElement.outcomes.length > 0) {

                        mapElement.outcomes.forEach(function (outcome) {

                            self.createOutcome(outcome.id, {
                                name: outcome.developerName,
                                label: outcome.label
                            }, self.getElementById(mapElement.id), self.getElementById(outcome.nextMapElementId), 'outcome');

                        })

                    }

                });

            }
            finally
            {
                graph.getModel().endUpdate();
            }

        }

    }

})(manywho);
