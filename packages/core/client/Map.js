/**
 * Kepler wrapper for Leaflet map
 * @module
 * @name  Map
 */
Kepler.Map = {
	/**
	 * Leflet map instance
	 * @type {L.Map}
	 */
	map: null,
	options: {},
	/**
	 * Leaflet layers
	 */
	layers: {},
	/**
	 * Leaflet controls
	 * @type {Object}
	 */
	controls: {},
	items: [],

	_deps: {
		ready: new ReactiveVar(false),
		bbox: new Tracker.Dependency()
	},
	/**
	 * return map rendering status
	 * @param  {Boolean} val [description]
	 * @return {Boolean}     [description]
	 */
	ready: function(val) {
		if(!_.isUndefined(val))
			this._deps.ready.set(val);
		return this._deps.ready.get();
	},
	/**
	 * initialization method
	 * @param  {String}   div  [description]
	 * @param  {Object}   opts [description]
	 * @param  {Function} cb   [description]
	 * @return {K.Map}        [description]
	 */
	init: function(div, opts, cb) {

		var self = this;

		if(self.ready())
			return this;
		else
			self.ready(true);

		self.sidebar = $('#sidebar');

		self.options = self.setOpts(opts);

		self.map = new L.Map(div, {
			center: self.options.center,
			zoom: self.options.zoom,
			minZoom: self.options.minZoom,
			maxBounds: self.options.maxBounds,
			attributionControl: false,
			doubleClickZoom: true,
			zoomControl: false			
		});

		self.layers = self._initLayers(self.map, self.options);
		self.controls = self._initControls(self.map, self.options);

		self._addComponents();

		//Fix only for Safari event resize! when shift to fullscreen
		$(window).on('orientationchange'+(K.Util.isMobile()?'':' resize'), _.debounce(function(e) {
			$(window).scrollTop(0);
			self.map.invalidateSize(false);
		}, 1000) );

		self.map.whenReady(function() {	
			self._deps.bbox.changed();

			for(var i in self.items)
				self.addItem(self.items[i]);

			if(_.isFunction(cb))
				cb.call(self);
		})
		.on('moveend zoomend', function(e) {
			self._deps.bbox.changed();
		});

		return this;
	},
	/**
	 * set map options ad runtime
	 * @param {Object} options [description]
	 */
	setOpts: function(options) {
		if(this.ready()) {
			var optsDef = K.settings.public.map,
				opts = _.deepExtend({}, optsDef, options);

			opts.popups.autoPanPaddingTopLeft = L.point(opts.popups.autoPanPaddingTopLeft);
			opts.popups.autoPanPaddingBottomRight = L.point(opts.popups.autoPanPaddingTopLeft);

			if(!K.Util.valid.loc(options.center)){
				opts.center = optsDef.center;
				opts.zoom = optsDef.zoom;
			}
			
			if(!opts.layers[opts.layer])
				opts.layer = optsDef.layer;

			if(opts.layer && this.layers && this.layers.baselayer){
				var u = optsDef.layers[opts.layer];
				if(u) {
					this.layers.baselayer.setUrl( u );
				}
			}
		}
		return opts;
	},
	/**
	 * destroy K.Map instance
	 * @return {K.Map} [description]
	 */
	destroy: function() {

		var l = this.layers,
			c = this.controls;

		if(this.ready()) {
			this.ready(false);

			this.items = [];

			for(var l in this.layers)
				this.map.removeLayer(this.layers[l])
			
			for(var c in this.controls)
				this.map.removeControl(this.controls[c])

			this.map.remove();	
		}
		return this;
	},
	_addComponents: function() {
		for(var l in this.layers) {
			if(this.layers[l])
				this.map.addLayer(this.layers[l]);
		}
		
		for(var c in this.controls) {
			if(this.controls[c])
				this.map.addControl(this.controls[c]);
		}
	},
	/**
	 * visible status of map under sidebar
	 * @return {Boolean} [description]
	 */
	isVisible: function() {
		if(!this.ready()) return false;

		var mapw = this.map.getSize().x,
			panelw = (this.sidebar.hasClass('expanded') && this.sidebar.width()) || 0,
			viewportW = mapw - panelw;

		return viewportW > 40;
	},
	/**
	 * setView of map considering the sidebar
	 * @param {Array} loc  [description]
	 * @param {K.Map} zoom [description]
	 */
	setView: function(loc, zoom) {
		if(this.ready()) {
			var sidebarW = (this.sidebar.hasClass('expanded') && this.sidebar.width()) || 0;
			
			this.map.setView(loc, zoom);/*, {
				//TODO Leaflet 1.2.0 not yet implement paddingTopLeft
				//only documented
				paddingTopLeft: L.point(sidebarW,0)
			});*/
		}
		return this;
	},
	/**
	 * fitBounds considering the sidebar
	 * @param  {Array} bbox [description]
	 * @return {K.Map}      [description]
	 */
	fitBounds: function(bbox) {
		if(this.ready() && bbox.isValid()) {
			var sidebarW = (this.sidebar.hasClass('expanded') && this.sidebar.width()) || 0;
			this.map.fitBounds(bbox, {
				paddingTopLeft: L.point(sidebarW,0)
			});
		}
		return this;
	},
	/**
	 * get current bounding box of map
	 * @return {Array} "[[sw.lat, sw.lng], [ne.lat, ne.lng]]"
	 */
	getBBox: function(pad) {
		if(this.ready()) {
			this._deps.bbox.depend();

			var bbox = this.map.getBounds(),
				sw = bbox.getSouthWest(),
				ne = bbox.getNorthEast();

			if(this.sidebar.hasClass('expanded')) {
				var p = this.map.latLngToContainerPoint(sw);
				p.x += this.sidebar.width();
				sw = this.map.containerPointToLatLng(p);
			}

			//TODO add pad

			return K.Util.geo.bboxRound([[sw.lat, sw.lng], [ne.lat, ne.lng]]);
		}
	},
	/**
	 * getCenter of the map
	 * @return {Array} location
	 */
	getCenter: function() {
		if(this.ready()){
			var ll = L.latLngBounds(this.getBBox()).getCenter();
			return [ll.lat, ll.lng];
		}
	},
	/**
	 * add instance of Place or User to map
	 * @param {Place|User} item [description]
	 */
	addItem: function(item) {
		if(this.ready() && item && item.marker) {
			if(item.type==='place')
				item.marker.addTo( this.layers.places );
			else if(item.type==='user')
				item.marker.addTo( this.layers.users );
		}
		else
			this.items.push(item);
		return this;
	},
	/**
	 * remove Kepler Users/Places from map
	 * @param  {K.User|K.Place} item [description]
	 * @return {K.Map}      [description]
	 */
	removeItem: function(item) {
		if(this.ready()) {
			if(item && item.marker) {
				//DO NOT REMOVE
				Meteor.defer(function() {
					item.marker.remove();
					if(item.geom)
						item.geom.remove();
				});
			}
		}
		return this;
	},
	/**
	 * show location on map
	 * @param  {Array}    loc location to show
	 * @param  {Function} cb  callback on location shown
	 * @return {K.Map}       [description]
	 */
	showLoc: function(loc, cb) {
		if(this.ready()) {

			if(!this.isVisible())
				Session.set('showSidebar', false);
			/*else
				Session.set('showSidebar', true);*/
			
			if(_.isFunction(cb))
				this.map.once("moveend zoomend", cb);
			
			if(loc && K.Util.valid.loc(loc))
				this.setView( L.latLng(loc) , this.options.showLocZoom);
		}
		return this;
	},
	/**
	 * clean Geojson layer
	 * @return {K.Map} [description]
	 */
	cleanGeojson: function() {
		this.layers.geojson.clearLayers();
		return this;
	},
	/**
	 * add data to Geojson layer
	 * @param {Object}   geoData [description]
	 * @param {Object}   opts    [description]
	 * @param {Function} cb      [description]
	 */
	addGeojson: function(geoData, opts, cb) {
		
		cb = _.isFunction(opts) ? opts : (cb || $.noop);

		opts = _.defaults(opts || {}, {
			clear: true,
			bbox: null,
			style: null,
			noFitBounds:false
		});

		var self = this;
		if(this.ready()) {

			geoData = _.isArray(geoData) ? geoData : [geoData];

			if(!this.isVisible())
				Session.set('showSidebar', false);

			this.map.closePopup();

			if(opts.clear)
				this.layers.geojson.clearLayers();

			for(var i in geoData) {
				if(geoData[i] && (geoData[i].features || geoData[i].feature))
					this.layers.geojson.addData(geoData[i]);
			}

			if(opts.style)
				this.layers.geojson.setStyle(opts.style);
			
			if(opts.noFitBounds) {
				cb();
			}
			else
			{
				this.map.once("moveend zoomend", cb);

				if(opts.bbox)
					self.fitBounds(bbox);
				else
					setTimeout(function() {
						self.fitBounds(self.layers.geojson.getBounds());
					},100);//geojson.addData() is slowly!
			}
			
		}
		return this;
	},
	/**
	 * hide cursor from map
	 * @return {K.Map} [description]
	 */
	hideCursor: function() {
		if(this.layers.cursor)
			this.layers.cursor.hide();
		return this;
	},
	/**
	 * show cursor on map
	 * @param  {Array} loc [description]
	 * @return {K.Map} [description]
	 */
	showCursor: function(loc) {
		if(this.layers.cursor)
			this.layers.cursor.setLoc(loc);
		return this;
	},
	/**
	 * return current location of map cursor or null if it's hidden
	 * @return {Array} location as array [lat,lng]
	 */
	getCursorLoc: function() {
		var loc;
		if(this.layers.cursor && this.map.hasLayer(this.layers.cursor.marker)) {
			var ll = this.layers.cursor.marker.getLatLng();	
			loc = [ll.lat, ll.lng];
		}
		return loc;
	}
};