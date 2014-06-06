module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		
		watch:{
			sass:{
				files:['../www/css/scss/**/*.scss'],
				tasks: ['compass']
			}
		},
		
		compass: {
		  sass: {
			options: {
				sassDir: '../www/css/scss/',
				cssDir: '../www/css/',
				//environment: 'production',
				//outputStyle: 'compressed'
			}
		  }
		}

	});
  
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-exec');
	grunt.loadNpmTasks('grunt-contrib-copy');

	// Default task(s).
	grunt.registerTask('default', ['watch']);
};