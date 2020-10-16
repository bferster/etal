CKEDITOR.editorConfig = function( config ) {
	config.resize_dir='both';
	config.width="100%";
	config.skin = 'moono-lisa';
	config.removePlugins = "elementspath";
	config.resize_enabled = false;

	config.toolbar =[
		{ name: 'clipboard', items : ['Source', 'Undo', 'Redo' ] },
		{ name: 'insert', items : ['Table','SpecialChar','HorizontalRule','CreateDiv','Image','Link'] },
		{ name: 'basicstyles', items : [ 'Bold','Italic','Underline','Superscript','Subscript','RemoveFormat',
			'-','NumberedList','BulletedList','-','Outdent','Indent',
			'JustifyLeft','JustifyCenter','JustifyRight', ] },
		{ name: 'styles', items : ['TextColor','Font','FontSize'] },
		]
		config.extraPlugins = 'pastefromword';	
	};
