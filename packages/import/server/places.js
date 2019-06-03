
Meteor.methods({

	importFile: function(fileObj, params) {

		if(!this.userId) return null;

		var geo = JSON.parse(fileObj.blob),
			importName = K.Util.sanitize.importName(params.importname) || K.Util.timeName(),
			placeIds = [];

		console.log('Import: file', fileObj.name, 'import name', importName);
		//TODO user params as importName
		
		if(geo && geo.features && geo.features.length>0) {

			_.each(geo.features, function(feature) {

				if(!feature) return null;

				//TODO check md5 of feature or loc if just imported

				var placeData = K.Import.geojsonToPlace(feature, importName),
					placeId = null;
				
				if(placeData) {
					placeId = Meteor.call('importPlace', placeData);
				}
				else {
					console.log('Import: error importing item', feature );
					return null;
				}

				if(placeId) {
					placeIds.push(placeId);
				}
			});

			console.log('Import: places imported ', placeIds.length);
		}
		else
			console.log('Import: error json parse');

		Users.update(this.userId, {
			$addToSet: {
				imports: importName
			}
		});

		return placeIds.length+' '+i18n('label_imported');
	},

	importPlace: function(obj) {

		if(!this.userId) return null;

		var place = _.deepExtend({}, K.schemas.place, obj);

		var placeId = Places.insert(place);

		console.log('Import: importPlace ', place.name || placeId);

		return placeId;
	},

	removeImport: function(name) {

		if(!this.userId) return null;

		var count = Places.remove({
			'import.name': name,
			'userId': this.userId
		});
		Users.update(this.userId, {
			$pull: {
				imports: name
			}
		});
		
		console.log('Import: removeImport ', name, this.userId);

		return count;
	}
});