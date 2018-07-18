window.WebSocket = window.WebSocket || window.MozWebSocket;
$(function () {
    'use strict';
    const conn = new ReconnectingWebSocket('ws://192.168.1.6:9486');
    let username = null;
    let msgArea = $('#messages');

    conn.onopen = () => {
        console.log('Connection open...');

        // Wait to show the app until we have connection
        $('#chatapp').show()
        $('#loader').hide();

        username = localStorage.getItem('username');

        username = toggleLogin(username);
    }

    conn.onerror = () => {
        console.log('Oh no! There was an error...');
    }

    conn.onmessage = (result) => {
        if (result) {
            result = JSON.parse(result.data);
            if (result.wsOn) {
                console.log('all messages')
                result.messages.forEach(msg => {
                    updateChat(msg);
                });
            } else {
                console.log('latest message');
                updateChat(result[result.length - 1]);
            }
        }
    }

    $('#chatapp').submit(function (e) {
        e.preventDefault();

        var obj = {};

        // Get the form values
        var usernameInput = e.target['username'];
        var messageInput = e.target['message'];

        // Update the object
        obj.user = username || usernameInput.value;
        obj.message = messageInput.value;
        obj.created = new Date();

        if (!obj.user) {
            $('#login .alert').show();
        } else {
            $('#login .alert').hide();

            localStorage.setItem('username', obj.user);
            username = toggleLogin(obj.user);

            if (obj.message) {
                // Send to the server
                conn.send(JSON.stringify(obj));
            }
        }

        // Reset the values
        usernameInput.value = '';
        messageInput.value = '';
    });

    $('#btnSignOut').click(function (e) {
        localStorage.removeItem('username');
        username = toggleLogin();
    });

    function updateChat(data) {
        msgArea.prepend(`
            <div class='row'>        
                <div class='col-3 datecreated'>${(new Date(data.created)).toLocaleString()}</div>
                <div class='col-3 username'>${data.user}</div>
                <div class='col-6 message'>${data.message}</div>                
            </div>
        `);
    }

    function toggleLogin(name) {
        // if we have the data, we have the user
        if (name) {
            // Logged in
            $('#login').hide();
            $('#chat').show();
            $('#greeting').text(`Hi, ${name}`);
            return name;
        } else {
            // Logged out
            $('#login').show();
            $('#chat').hide();
            return null;
        }
    }
});