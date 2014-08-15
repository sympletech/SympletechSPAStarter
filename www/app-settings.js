var AppSettings = (function() {
    var self = this;

    self.applicationTitle = "Sympletech SPA Starter";

    //************************************************
    // Environments
    //************************************************    
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
    
    //************************************************
    // Libraries
    //************************************************  
    self.libs = [
        "lib/bootstrap/js/bootstrap.min.js",
        "lib/greensock/TweenMax.min.js",
        "lib/greensock/jquery.gsap.min.js",
	    "lib/knockout-view-model/knockout.viewmodel.min.js"
    ];
    
    //************************************************
    // Routes
    //************************************************   
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
            scripts: ['app/view-models/login/extra-login-script.js'],
            templates: ['app/views/templates/login-template']
        },
        {
            path: 'secure',
            title: 'Secure Page',
            secure : true
        }
    ];    

    return self;
})();