var DGauge = function(screen)
{

	// Graph area
	this.screen = screen;

	// Lines
	this.lines = [];
	this.needles = [];

	// Creation of the structure
	var createInfo = function(id)
	{
		var info = newDom('div');
		info.className = 'info';
		info.id = id;
		var data_info = newDom('div');
		data_info.appendChild(document.createTextNode(''));
		info.appendChild(data_info);
		screen.appendChild(info);
		return info;
	};

	this.infoMin = createInfo('info_min');
	this.infoMinMedium = createInfo('info_min_medium');
	this.infoMedium = createInfo('info_medium');
	this.infoMediumMax = createInfo('info_medium_max');
	this.infoMax = createInfo('info_max');

	var n = 0;
	for (var i = -2; i < 158; i+= 1.6)
	{
		var line = newDom('div');
		var classname = i < 125 ? 'line' : 'line last';
		line.className = (n++ % 5 === 0) ? classname + ' big' : classname;
		line.style.webkitTransform = 'rotate('+i+'deg)';
		screen.appendChild(line);
		this.lines.push(line);
	}

	this.database = {};
	EventBus.addListeners(this.listeners, this);
};

DGauge.prototype.listeners = {
	bounds: function(d, obj) {
		obj.min_value = Number.MAX_VALUE;
		obj.max_value = -Number.MAX_VALUE;

		for (var local_statement in obj.database)
			if (local_statement in d)
				for (var type in d[local_statement])
				{
					var name = type.slice(0, -3);
					if (name !== 'time_t')
					{
						var side = type.slice(-3);
						if (side === 'Max' && obj.max_value < d[local_statement][type])
							obj.max_value = d[local_statement][type];
						else if (side === 'Min' && obj.min_value > d[local_statement][type])
							obj.min_value = d[local_statement][type];
					}
				}

		var medium = (obj.max_value - obj.min_value) * 0.5 + obj.min_value;
		var minMedium = (medium - obj.min_value) * 0.5 + obj.min_value;
		var mediumMax = (obj.max_value - medium) * 0.5 + medium;

		obj.infoMin.firstChild.firstChild.data = obj.min_value;
		obj.infoMinMedium.firstChild.firstChild.data = minMedium;
		obj.infoMedium.firstChild.firstChild.data = medium;
		obj.infoMediumMax.firstChild.firstChild.data = mediumMax;
		obj.infoMax.firstChild.firstChild.data = obj.max_value;

	},

	tuples: function(detail, obj) {
		var updated_needle = [];

		for (var statement_name in detail) {
			if (!(statement_name in obj.database)) continue;
			var data = detail[statement_name];

			for (var k in data)
				if (k != 'time_t')
				{
					// première valeur pour l'instant, car bon voila quoi,
					// faut faire d'autres évènements
					var id = "needle_"+(statement_name+k).hashCode();
					var box = byId(id);
					if (!box) {
						box = newDom('div');
						box.className = 'needle';
						box.id = id;
						box.style.webkitTransformOriginX = obj.px_height;
						box.style.width = obj.px_height;
						box.appendChild(document.createTextNode(''));
						obj.screen.appendChild(box);
						obj.needles.push(box);
					}
					// If no values, min values
					var value = data[k].length > 0 ? data[k][0] : obj.min_value;

					var ratio = (value - obj.min_value) / (obj.max_value - obj.min_value);

					var angle = -2 + 160 * ratio;

					box.style.webkitTransform = 'rotate('+angle+'deg)';
					updated_needle.push(box);
				}
		}

		var ni = obj.needles.length;
		for (var i = 0; i < ni; ++i)
			if (updated_needle.indexOf(obj.needles[i]) === -1)
			{
				obj.needles.splice(i, 1);
				obj.screen.removeChild(obj.needles[i]);
			}

	},

	add_statement: function(e, obj) {
		if (e.box_name != self.name) return;

		if (!(e.statement_name in obj.database))
			obj.database[e.statement_name] = true;
	},
	del_statement: function(e, obj) {
		if (e.box_name != self.name) return;

		if (e.statement_name in obj.database)
			delete obj.database[e.statement_name];
	},
	size_change: function(e, obj)
	{
		var width = $(obj.screen).width();
		var height = $(obj.screen).height();
		var screen_height = height;

		if (height * 2 > width) height = width * 0.5;

		var px_height = height - 30 + 'px';

		var ni = obj.lines.length;
		for (var i = 0; i < ni; ++i)
			obj.lines[i].style.webkitTransformOriginX = px_height;

		var ni = obj.needles.length;
		for (var i = 0; i < ni; ++i)
		{
			obj.needles[i].style.webkitTransformOriginX = px_height;
			obj.needles[i].style.width = px_height;
		}

		obj.px_height = px_height;

		var px_height = height - 75 + 'px';
		obj.infoMin.style.webkitTransformOriginX = px_height;
		obj.infoMinMedium.style.webkitTransformOriginX = px_height;
		obj.infoMedium.style.webkitTransformOriginX = px_height;
		obj.infoMediumMax.style.webkitTransformOriginX = px_height;
		obj.infoMax.style.webkitTransformOriginX = px_height;

		var marge = (width - 2 * height + 150) / 2;
		obj.screen.style.left = marge + 'px';
		marge = (screen_height - height + 30) / 2;
		obj.screen.style.bottom = marge + 'px';
	}
};