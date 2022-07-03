import fetch from 'node-fetch'
(function () {
    fetch('https://ruarrokrab.execute-api.us-east-1.amazonaws.com/default/interviewTest', {
        method: 'post',
    })
        .then(response => response.text())
        .then(data => {
            console.log(data);
            //use keys
        });
}) ();