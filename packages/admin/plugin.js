
K.Plugin({
	name: 'admin',
	templates: {
		//new placeholder
		panelAdmin: {},
		itemPlaceAdmin: {},
		pageAdminUser: {},
		pageAdminPlace: {},
		
		panelAdmin: 'panelAdmin_btns',	

		pageAdminPlace: {
			'pageAdmin_admin_map':{order:0},			
			'pageAdmin_admin_raw':{order:0},
			
			'pageAdminPlace_admin_owner':{order:0},
			
			'panelPlaceEdit':{order:10}
		},
		pageAdminUser: {
			'pageAdmin_admin_raw':{order:0},
			'itemUserAdmin_admin_btns':{order:0},
			'pageAdminUser_admin_contact':{order:0},
			'pageAdminUser_admin_logins':{order:0},
			'pageAdminUser_admin_friends':{order:0},

			'panelUser':{order:10}
		},
		itemUserAdmin: {
			'itemUserAdmin_admin_btns': {order:10}
		},
		itemPlaceAdmin: {
			'itemPlaceAdmin_admin_btns': {order:10}
		},

		panelUser: {'itemUser_admin': {order:-5}},
		panelPlace: {'itemPlace_admin': {order:-5}},
		//panelPlaceEdit: {'itemPlace_admin': {order:-5}},
		//panelPlace:'itemPlace_admin',
		
		panelProfile: {
			'panelProfile_admin': {order:10},
			//'panelUser_admin': {order:50},
		},
		//panelPlaceAdmin:'panelPlaceAdmin_admin_raw',
		//TODO move it in a special admin page
	},
	schemas: {
		user: {
			isAdmin: 0
		}
	},
	filters: {
		currentUser: {
			fields: {
				isAdmin: 1
			}
		},
		friendPanel: {
			fields: {
				isAdmin: 1
			}
		},
		userPanel: {
			fields: {
				isAdmin: 1
			}
		}
	},
	settings: {
		"admin": {
			"adminUsers": ["admin"],			
			"emailOnNewUser": true,
			"adminsAutoFriendship": true,	//add all admins in the user friends list
		}
	}
});
