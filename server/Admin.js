/*
	DEBUGGING FUNCTIONS
*/

var userIsAdmin = function() {
	if(!Meteor.userId()) return false;
	console.log('userIsAdmin', Meteor.user().username)
	return _.contains(Meteor.settings.adminUsers, Meteor.user().username);
};

Meteor.methods({
	adminCreateUser: function(username) {
		
		if(!userIsAdmin()) return null;

		//TODO check User is Admin

		var userId = Accounts.createUser({
			username: username,
			password: username+username,
			email: username+'@gmail.com'			
		});

		console.log('adminCreateUser', username, userId);

		Meteor.call('friendConfirm', userId);
		
	},
	adminDeleteUser: function(username) {
		
		if(!userIsAdmin()) return null;

		var userData = Meteor.users.findOne({username: username}),
			userId = userData._id;

		Meteor.users.update({_id: {$in: userData.friends }}, {$pull: {friends: userId} });
		Meteor.users.remove(userId);

		console.log('adminDeleteUser', username);
	},
	adminDeleteAllUsers: function() {
		
		if(!userIsAdmin()) return null;

		//Mateor.call('adminDeleteUser', username);

		console.log('adminDeleteAllUsers');
	},
	adminCleanUserFriends: function(username) {
		
		if(!userIsAdmin()) return null;

		//TODO check User is Admin

		Meteor.users.update({username: username}, {
			$set: {
				friends: [],
				usersBlocked: [],			
				usersPending: [],
				usersReceive: []
			}
		});
		
		console.log('adminCleanUserFriends', username);
	}	
});