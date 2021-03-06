(function (manywho) {

    var newIndex = 0;

    function getChildIndex(parent, child) {

        for (var i=0; i<parent.childNodes.length; i++) {

            if (child.id == parent.childNodes[i].id) {

                return i;

            }

        }

    }

    manywho.builder = React.createClass({

        getInitialState: function () {

            return {
                currentDragItem: null,
                currentSelectedItem: null,
                hover: false,
                dragging: false,
                enteredDroppable: false,
                pageName: this.props.pageName || '',
                element: this.props.cell || {},
                canvasItems: this.props.data || []
            }

        },

        componentDidUpdate: function () {



        },

        componentDidMount: function () {

            var self = this;

            document.getElementById('canvas').addEventListener('click', function (event) {

                event.preventDefault();

                var newState = self.clearSelectedComponents();

                self.setState(newState);

            });

        },

        changePageName: function (event) {

            var newPageName = event.target.value;

            this.setState({ pageName: newPageName });

        },

        clearSelectedComponents: function () {

            var self = this;

            return {

                canvasItems: this.state.canvasItems.map(function (item) {

                    item.active = false;

                    if (self.state.currentSelectedItem){

                        item.saved = self.state.currentSelectedItem.saved;

                    } else {
                        item.saved = true;
                    }
                    return item;

                }),
                currentSelectedItem: null

            };

        },

        isHovering: function () {

            return this.state.hover && this.state.dragging ? 'active-canvas' : '';

        },

        clearDummys: function () {

            return this.state.canvasItems.filter(function (item) {

                return item.type != 'Dummy';

            });

        },

        onComponentClick: function (event) {

            var newState = {};

            event.preventDefault();

            event.nativeEvent.stopImmediatePropagation();

            newState.canvasItems = this.state.canvasItems.map(function (item) {

                item.active = false;

                if (event.currentTarget.id == item.id) {

                    item.active = true;

                    newState.currentSelectedItem = $.extend(true, {}, item);

                }

                return item;

            });

            this.setState(newState);

        },

        onSave: function (event) {

            var self = this;

            var newState = {};

            newState.canvasItems = self.state.canvasItems.map(function (item) {

                if (self.state.currentSelectedItem.id == item.id) {

                    item = $.extend(true, {}, self.state.currentSelectedItem);

                    item.saved = true;

                }

                return item;

            });

            this.setState(newState);

            var name = document.getElementById('page-name').value;

            return newState.canvasItems;

        },

        onNewComponentDragStart: function (event) {

            var newState = this.clearSelectedComponents();

            var data = {
                name: event.currentTarget.innerHTML,
                type: event.currentTarget.innerHTML.toLowerCase(),
                id: 'new' + newIndex,
                attributes: {}
            };

            newIndex++;

            newState.dragging = true;
            newState.currentDragItem = data;

            this.setState(newState);

        },

        onNewComponentDragEnd: function (event) {

            var newState = {};

            if(!this.state.hover) {

                newState.canvasItems = this.state.canvasItems.filter(function (item) {

                    return item.type.toLowerCase() != 'dummy';

                });

                newState.currentDragItem = null;

            }

            newState.dragging = false;
            newState.enteredDroppable = false;

            this.setState(newState);

        },

        onComponentDragStart: function (event) {

            event.dataTransfer.effectAllowed = 'move';

            var newState = this.clearSelectedComponents();

            newState.dragging = true;

            newState.currentDragItem = $.extend({}, this.state.canvasItems.filter(function (item) {

                return event.currentTarget.id == item.id;

            })[0]);

            newState.canvasItems = this.state.canvasItems.map(function (item) {

                if (event.currentTarget.id == item.id) {

                    item.name = '';
                    item.text = '';
                    item.type = 'Dummy';
                    item.active = false;
                    item.saved = false;
                    item.id = null;

                }

                return item;

            });

            this.setState(newState);

        },

        onComponentDragEnd: function (event) {

            var self = this;

            var newState = {};

            if(!this.state.hover) {

                newState.canvasItems = this.state.canvasItems.map(function (item) {

                    if (item.type.toLowerCase() == 'dummy') {
                        item.name = self.state.currentDragItem.name || '';
                        item.text = self.state.currentDragItem.attributes || {};
                        item.type = self.state.currentDragItem.type.toLowerCase() || '';
                        item.active = true;
                        item.saved = self.state.currentDragItem.saved || false;
                        item.id = self.state.currentDragItem.id;
                        item.order = self.state.currentDragItem.order;
                        item.attributes = self.state.currentDragItem.attributes;
                        item.content = self.state.currentDragItem.content || '';

                        newState.currentSelectedItem = $.extend(true, {}, item);
                    }

                    return item;

                });

                newState.currentDragItem = null;

            }

            newState.enteredDroppable = false;
            newState.dragging = false;

            this.setState(newState);

        },

        onComponentOver: function (event) {

            event.nativeEvent.stopImmediatePropagation();

            if (this.state.dragging) {

                var newState = {};

                newState.canvasItems = this.clearDummys();

                var index = getChildIndex(event.target.parentNode, event.target);

                newState.canvasItems.splice(index, 0, {

                    name: '',
                    text: '',
                    type: 'Dummy',
                    active: false,
                    saved: false,
                    id: null,
                    order: index

                });

                this.setState(newState);

            }

        },

        onClickComponentDelete: function (event) {

            event.stopPropagation();

            var newState = {};

            newState.canvasItems = this.state.canvasItems.filter(function (item) {

                return item.id.toLowerCase() != event.target.parentNode.parentNode.id && item.id.toLowerCase() != 'dummy';

            });

            newState.currentSelectedItem = null;

            this.setState(newState);

        },

        onComponentDelete: function (event) {

            var newState = {}, self = this;

            newState.canvasItems = this.state.canvasItems.filter(function (item) {

                return item.id.toLowerCase() != self.state.currentDragItem.id.toLowerCase() && item.id.toLowerCase() != 'dummy';

            });

            newState.enteredDroppable = false;

            event.target.className = 'glyphicon glyphicon-trash';

            this.setState(newState);

        },

        onBinOver: function (event) {

            event.target.className += ' orange-background';

        },

        onBinLeave: function (event) {

            event.target.className = 'glyphicon glyphicon-trash';

        },

        onBinDragOver: function (event) {

            event.preventDefault();

        },

        onDroppableEnter: function (event) {

            event.preventDefault();

            event.nativeEvent.stopImmediatePropagation();

            var newState = {};

            if(!this.state.enteredDroppable) {

                if (this.state.dragging && !this.state.hover) {

                    newState.canvasItems = this.clearDummys();

                    newState.canvasItems.splice(newState.canvasItems.length, 0, {

                        name: '',
                        text: '',
                        type: 'Dummy',
                        active: false,
                        saved: false,
                        id: null,
                        order: newState.canvasItems.length

                    });

                }

                newState.enteredDroppable = true;
            }

            newState.hover = true;

            this.setState(newState);

        },

        onDroppableLeave: function (event) {

            event.preventDefault();

            var newState = {};

            if (this.state.dragging && !this.state.hover) {

                newState.canvasItems = this.clearDummys();

                newState.canvasItems.splice(newState.canvasItems.length, 0, {

                    name: '',
                    text: '',
                    type: 'Dummy',
                    active: false,
                    saved: false,
                    id: null,
                    order: newState.canvasItems.length

                });

            }

            newState.hover = false;

            this.setState(newState);

        },

        onDrop: function (event) {

            var self = this;

            var newState = {};

            var currentIndex = getChildIndex(event.target.parentNode, event.target);

            newState.canvasItems = this.state.canvasItems.map(function (item, index) {

                if (item.type.toLowerCase() == 'dummy') {
                    item.name = self.state.currentDragItem.name || '';
                    item.type = self.state.currentDragItem.type.toLowerCase() || '';
                    item.active = true;
                    item.saved = self.state.currentDragItem.saved || false;
                    item.id = self.state.currentDragItem.id;
                    item.attributes = self.state.currentDragItem.attributes;
                    item.order = getChildIndex(event.target.parentNode, event.target);
                    item.content = self.state.currentDragItem.content || '';

                    newState.currentSelectedItem = $.extend(true, {}, item);
                }

                if (index > currentIndex) {

                    item.order++;

                }

                return item;

            });

            newState.currentDragItem = null;
            newState.dragging = false;
            newState.hover = false;

            this.setState(newState);

        },

        onPageSave: function (event) {

            var self = this, pageId = null, pageName = document.getElementById('page-name'), pageNameText = pageName.value;

            if (pageName.value != null && pageName.value.length > 0) {

                pageName.parentNode.classList.remove('has-error');

                if (this.state.element && this.state.element.value) {

                    pageId = this.state.element.value.pageId;

                }

                var metadata = manywho.draw.json.buildPageMetadata(pageName.value, this.state.canvasItems, pageId);

                manywho.draw.ajax.savePageLayout(metadata).then(function (data) {

                    if(metadata.id == null) {

                        manywho.draw.ajax.addElementToFlow(manywho.draw.model.getFlowId(), data.id, 'page').then(function (response) {

                            var model = manywho.draw.model.getModel();

                            var mapElementCoords = manywho.draw.model.getMapElementCoordinates();

                            var mapElement = {

                                "developerName": pageNameText,
                                "developerSummary": "",
                                "elementType": "input",
                                "groupElementId": null,
                                "id": null,
                                "outcomes": null,
                                "pageElementId": data.id,
                                "x": mapElementCoords.x,
                                "y": mapElementCoords.y

                            };

                            manywho.draw.model.setMapElementCoordinates(0, 0);

                            manywho.draw.ajax.createMapElement(mapElement, manywho.draw.model.getFlowId(), model.editingToken);

                        });

                    } else {

                        manywho.draw.ajax.getFlowGraph(null, null)

                    }

                    self.state.canvasItems.forEach(function (item) {

                        if (item.type.toLowerCase() == 'gather' && pageId == null) {

                            var value = manywho.draw.json.buildValueMetadata(item.name, 'number');

                            manywho.draw.ajax.saveValue(value).then(function (response) {

                                if(value.id == null) {

                                    manywho.draw.ajax.addElementToFlow(manywho.draw.model.getFlowId(), response.id, 'value');

                                }

                            });

                        }

                    });

                    manywho.draw.hideModal(null, 'draw_draw_draw_main');

                });

            } else {

                pageName.parentNode.classList.add('has-error');

                return false;

            }

        },

        onPageCancel: function (event) {

            manywho.draw.hideModal(null, 'draw_draw_draw_main');

        },

        setUnsaved: function () {

            var newState = this.state;

            newState.canvasItems = this.state.canvasItems.map(function (item) {

                if (item.id == newState.currentSelectedItem.id) {

                    item.saved = false;

                }

                return item;

            });

            this.setState(newState);

        },

        renderConfiguration: function () {

            if (this.state.currentSelectedItem) {

                return React.DOM.div({}, [
                    React.DOM.form({}, [
                        React.createElement(manywho.layout.getComponentByName(this.state.currentSelectedItem.type.toLowerCase()), { ref: 'configuration', setUnsaved: this.setUnsaved, saveCallback: this.onSave, item: this.state.currentSelectedItem })
                    ])

                ])

            }

            return [];

        },

        render: function () {

            var configuration = this.renderConfiguration();

            return React.DOM.div({ className: 'modal-container', id: 'build_build_build_modal'}, [
                React.DOM.div({ className: 'modal-backdrop in full-height' }, null),
                React.DOM.div({ className: 'modal show' }, [
                    React.DOM.div({ className: 'modal-dialog', onKeyUp: this.onEnter }, [
                        React.DOM.div({ className: 'modal-content' }, [
                            React.DOM.div({ className: 'modal-header' }, [
                                React.DOM.div({ className: 'form-group' }, [
                                    React.DOM.label({ htmlFor: 'page-name' }, [
                                        'Page Name',
                                        React.DOM.span({ className: 'input-required' }, ' *')
                                    ]),
                                    React.DOM.input({ type: 'text', id: 'page-name', className: 'input-large form-control', placeholder: 'Enter page name here', value: this.state.pageName, onChange: this.changePageName })
                                ])
                            ]),
                            React.DOM.div({ className: 'modal-body' }, [
                                React.DOM.div({ id: 'page-builder'}, [
                                    React.DOM.div({ className: 'row' }, [
                                        React.DOM.div({ className: 'col-md-1' }, [
                                            React.DOM.div({ className: 'section-header' }, [
                                                React.DOM.h5({}, 'Components')
                                            ]),
                                            React.DOM.div({ id: 'component-buttons' }, [
                                                React.createElement(manywho.list, {
                                                    onNewComponentDragStart: this.onNewComponentDragStart,
                                                    onNewComponentDragEnd: this.onNewComponentDragEnd,
                                                    onComponentDelete: this.onComponentDelete,
                                                    onBinOver: this.onBinOver,
                                                    onBinLeave: this.onBinLeave,
                                                    onBinDragOver: this.onBinDragOver
                                                })
                                            ])
                                        ]),
                                        React.DOM.div({ className: 'col-md-8' }, [
                                            React.DOM.div({ className: 'section-header' }, [
                                                React.DOM.h5({}, 'Canvas')
                                            ]),
                                            React.createElement(manywho.canvas, {
                                                isHovering: this.isHovering,
                                                canvasItems: this.state.canvasItems,
                                                onComponentDragStart: this.onComponentDragStart,
                                                onComponentDragEnd: this.onComponentDragEnd,
                                                onComponentClick: this.onComponentClick,
                                                onComponentOver: this.onComponentOver,
                                                onDrop: this.onDrop,
                                                onDroppableEnter: this.onDroppableEnter,
                                                onDroppableLeave: this.onDroppableLeave,
                                                onClickComponentDelete: this.onClickComponentDelete
                                            })
                                        ]),React.DOM.div({ className: 'col-md-3' }, [
                                            React.DOM.div({ className: 'section-header' }, [
                                                React.DOM.h5({}, 'Configuration')
                                            ]),
                                            React.DOM.div({ id: 'configuration' }, configuration)
                                        ])
                                    ])
                                ])
                            ]),
                            React.DOM.div({ className: 'modal-footer' }, [
                                React.DOM.button({ className: 'btn btn-primary', id: 'save-page', onClick: this.onPageSave }, 'Save'),
                                React.DOM.button({ className: 'btn btn-default', id: 'cancel-page', onClick: this.onPageCancel }, 'Cancel')
                            ])
                        ])
                    ])
                ])
            ]);

        }

    });

})(manywho);