var AppSettings = (function() {
    var defaultEnvironment = 'dev';

    var environments = [
        {
            name: 'local',
            apiUrl: location.hostname + '/api/',
            hostnames : ['localhost', 'myHostName']
        },
        {
            name: 'dev',
            apiUrl: 'http://my.devserver.com/api/',
            hostnames: ['my.devserver.com']
        },
        {
            name: 'prd',
            apiUrl: 'http://my.prdserver.com/api/',
            hostnames: ['my.prdserver.com']
        }
    ];


    var activeEnvironment = _.find(environments, function (env) {
        return env.hostnames.contains(location.hostname);
    });

    var env = $GET('env');
    if (env) {
        defaultEnvironment = env;
    }

    if (activeEnvironment == null || env) {
        activeEnvironment = _.findWhere(environments, { name: defaultEnvironment });
    }

    return activeEnvironment;
})();