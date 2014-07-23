if (!spa_dir) {
    var spa_dir = 'lib/sympletech-spa/';
}

(function () {
    var coreScripts = [
        "jquery-1.11.0.min.js",
        "jquery-migrate-1.2.1.min.js",
        "q.js",
        "jquery.cookie.js",
        "craydent-1.7.23.js",
        "underscore-min.js",
        "knockout-3.1.0.js"
    ];

    var coreIncludes = "";
    for (var i = 0; i < coreScripts.length; i++) {
        var script = coreScripts[i];
        coreIncludes += '<script type="text/javascript" src="' + spa_dir + script + '"></script>';
    }
    coreIncludes += '<script type="text/javascript" src="app-settings.js"></script>';
    coreIncludes += '<script type="text/javascript" src="' + spa_dir + 'spa_core.js"></script>';

    document.write(coreIncludes);
})();