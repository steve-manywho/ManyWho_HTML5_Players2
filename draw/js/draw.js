manywho.draw = (function() {

    return {

        initialize: function ()  {

            var drawKey = 'draw_draw_draw_main';

            var inputObject = {
                LoginUrl: 'https://flow.manywho.com/plugins/manywho/api/draw/1/authentication',
                Username: 'joao.moreira@joaomoreira.manywho.com',
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
                    execute: manywho.graph.initialize,
                    type: 'done',
                    args: []
                }
            ]);

        },

        hideModal: function () {

            var modalKey = manywho.model.getModalForFlow('draw_draw_draw_main');

            var modal = document.getElementById(modalKey);
            modal.parentNode.removeChild(modal);

        }

    }

})(manywho);