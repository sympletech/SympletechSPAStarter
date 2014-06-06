var AppSettings = (function() {
    var self = this;

    self.applicationTitle = "Sympletech SPA Starter";

    self.defaultEnvironment = 'dev';
    self.environments = [
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
    
    self.defaultRoute = 'home';
    self.securedRedirect = 'login';
    self.appRoutes = [
        {
            path: 'home',
            title: 'Home Page'
        },
        {
            path: 'login',
            title: 'Login Page',
            templates: ['login-template']
        },
        {
            path: 'secure',
            title: 'Secure Page',
            secure : true
        }
    ];    

    return self;
})();