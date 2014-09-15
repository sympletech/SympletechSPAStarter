if (!spa_dir) {
    var spa_dir = 'lib/sympletech-spa/';
}

(function () {
    var coreScripts = [
        "jquery-1.11.1.min.js",
        "jquery-migrate-1.2.1.min.js",
        "q.js",
        "jquery.cookie.js",
        "underscore-min.js",
        "knockout-3.1.0.js"
    ];

    var coreIncludes = "";
    for (var i = 0; i < coreScripts.length; i++) {
        var script = coreScripts[i];
        coreIncludes += '<script type="text/javascript" src="' + spa_dir + script + '"></script>';
    }
    document.write(coreIncludes);
    
    var appIncludes = '<script type="text/javascript" src="app-settings.js"></script>';
    appIncludes += '<script type="text/javascript" src="' + spa_dir + 'spa_core.js"></script>';

    document.write(appIncludes);
})();