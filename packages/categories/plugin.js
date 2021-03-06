
K.Plugin({
	name: 'categories',
	templates: {
		//TODO refact using inputtags using panelSettings: 'panelSettings_cats',
		panelUser: 'panelUser_cats',
		tabPlace: {
			'panelPlace_cats': {order: -5 } //render after info
		},
		
		panelPlaceEdit: {
			'panelPlaceEdit_cats': {order:0},
			'panelPlaceEdit_cats_latest': {order:0},

			//TODO split this template in two
			//
			//'panelPlaceEdit_cats_input': {order:0}
			//'panelPlaceEdit_cats_last': {order:0}

		},		
		panelAdmin: 'panelAdmin_cats',
		//pageAdminPlace: 'panelPlaceEdit_cats',
		pageAdminUser: 'pageAdminUser_cats',
	},
	settings: {
		"public": {
			"categories": {
				//TODO "editable": false,
				"freeInput": false,
				"catsHistLength": 5,
				"catsMax": 10,
				"cats": {
					"place": {
						"bus": false,
						"car": false,
						"house": false,
						"parking": false,
					},
					"user": {
						"person": false,
						"animal": false,
						"robot": false,
					}
				}
			}
		}
	},
	schemas: {
		place: {
			cats: []
		},
		user: {
			cats: [],
			catshist: []
		},
		cat: {
			name: '',
			type: 'all',//user, place, all
			active: true,
			rank: 0,
			parent: ''
		}
	},
	filters: {
		currentUser: {
			fields: {
				cats: 1,
				catshist: 1
			}
		},
		friendPanel: {
			fields: {
				cats: 1
			}
		},	
		userPanel: {
			fields: {
				cats: 1
			}
		},		
		userItem: {
			fields: {
				cats: 1
			}
		},
		userSearch: {
			fields: {
				cats: 1
			}
		},		
		placePanel: {
			fields: {
				cats: 1
			}
		},
		placeItem: {
			fields: {
				cats: 1
			}
		},
		placeSearch: {
			fields: {
				cats: 1
			}
		}
	}
});