manywho.draw = ( function(manywho) {

    return {

        initialize: function ()  {

            manywho.graph.initialize();

            this.registerNavClickEvent('flow');
            this.registerNavClickEvent('page_layout');
            this.registerNavClickEvent('variable');
            this.registerNavClickEvent('type');
            this.registerNavClickEvent('service');

            this.registerRunClickEvent();

            this.registerActivateClickEvent();

            this.registerSaveClickEvent();

            var drawKey = 'draw_draw_draw_main';

            var inputObject = {
                LoginUrl: 'https://flow.manywho.com/plugins/manywho/api/draw/1/authentication',
                Username: '',
                DirectoryName: 'ManyWho Platform'
            };

            manywho.engine.initializeSystemFlow('draw_authentication', drawKey, manywho.json.generateFlowInputs(inputObject), [
                {
                    execute: manywho.authorization.setAuthenticationToken,
                    type: 'done',
                    args: [drawKey]
                },
                {
                    execute: manywho.draw.hideModal,
                    type: 'done',
                    args: [drawKey]
                },
                {
                    execute: manywho.draw.ajax.getTenantData,
                    type: 'done',
                    args: []
                }
            ]);

        },

        registerNavClickEvent: function (name) {

            document.getElementById(name).addEventListener('click', function(event) {

                var inputs = [{
                        contentType: "ContentString",
                        contentValue: null,
                        developerName: "Id",
                        objectData: null,
                        typeElementDeveloperName: null
                    },
                    {
                        developerName: 'AuthenticationToken',
                        contentValue: manywho.state.getAuthenticationToken('draw_draw_draw_main'),
                        contentType: 'ContentString',
                        objectData: null,
                        typeElementDeveloperName: null
                    },
                    {
                        contentType: "ContentString",
                        contentValue: "",
                        developerName: "FlowId",
                        objectData: null,
                        typeElementDeveloperName: null
                    }];

                if (name.toLowerCase() != 'flow') {

                    inputs.push({
                        contentType: 'ContentString',
                        contentValue: name.toUpperCase(),
                        developerName: 'ElementType',
                        objectData: null,
                        typeElementDeveloperName: null
                    })

                }

                manywho.engine.initializeSystemFlow(name.toUpperCase(), 'draw_draw_draw_main', inputs, [
                    {
                        execute: manywho.draw.ajax.getFlowGraph,
                        type: 'done',
                        args: []
                    },
                    {
                        execute: manywho.draw.hideModal,
                        type: 'done',
                        args: ['draw_draw_draw_main']
                    }]);


            });

        },

        registerRunClickEvent: function () {

            var generate = document.getElementById('run-flow');

            generate.addEventListener('click', function(event) {

                manywho.draw.ajax.getFlowVersion().then(function(data) {

                    manywho.draw.ajax.getFlowSnapshot(data.id.versionId).then(function (metadata) {

                        manywho.draw.ajax.convertLua(metadata).then(function (code) {

                            if (code.errors) {

                                alert(code.errors);

                            }

                            if (code.luaCode) {

                                manywho.draw.model.setLuaCode(code);

                                manywho.model.setModal('draw_draw_draw_main', 'build_build_build_modal');

                                manywho.draw.renderLuaCode();

                            }

                        })

                    });

                });

            });
        },

        registerActivateClickEvent: function () {

            var generate = document.getElementById('activate-flow');

            generate.addEventListener('click', function(event) {

                manywho.draw.ajax.getFlowVersion().then(function(data) {

                    manywho.draw.ajax.getFlowSnapshot(data.id.versionId).then(function (metadata) {



                    });

                });

            });
        },

        registerSaveClickEvent: function () {

            var save = document.getElementById('save-flow');

            save.addEventListener('click', function (event) {

                var flowId = manywho.draw.model.getFlowId();

                if (flowId && flowId.length > 0) {

                    manywho.draw.model.setFlowId(null);
                    document.getElementById('draw-tool').classList.add('hidden');

                }

            })

        },

        hideModal: function (callback, drawKey) {

            var modalKey = manywho.model.getModalForFlow(drawKey);

            var modal = document.getElementById(modalKey);

            if (modal) {

                modal.parentNode.classList.add('hidden');
                modal.parentNode.removeChild(modal);

            }

        }

    }

})(manywho);
