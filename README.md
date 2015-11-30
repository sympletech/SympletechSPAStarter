SympletechSPAStarter
====================

The SPA starter framework is a convention based starting point to make getting up to speed on your SInglepage application quick and easy.  
It is set up in a way that will make growing your application easy and maintainiable.



--Ajax Helpers
Set the root of your API endpoint in the app-settings.js environment section
{
    name: 'local',
    apiUrl: 'http://danlewis.sympletech.com/api/',
    hostnames: ['localhost', 'danlewis', 'danlewis.esri.com']
},

Then you can use the following helper methods:

Core.apiGet(endpoint, params, onSuccess, onFail);
Core.apiPost(endpoint, params, onSuccess, onFail);
Core.apiPostAsJson(endpoint, payloadObject, onSuccess, onFail);
Core.apiAjaxRequest(method, endpoint, params, onSuccess, onFail);

Benifits:
Adds current users token to request (if set)
Adds a z=ticks to each request to prevent caching
Automaticaly shows / hides loader.

blah 2 44 4654  fds
