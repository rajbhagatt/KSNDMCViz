	var geojson;
	var nd,pd,cd,ndd,pdd,ndm,pdm,ndy,pdy;
	$(window).ready(function() {
    $('#loaddiv').hide();
	});
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();
	if(dd<10){
        dd='0'+dd
    } 
    if(mm<10){
        mm='0'+mm
    } 
	today = yyyy+'-'+mm+'-'+dd;
	document.getElementById("datebox").setAttribute("max", today);
	var dayselected="25"
	var monthselected="07";
	var yearselected="2018";
	var hourselected="00";
	var minuteselected="00";
	var tval;
	jsonconverter = esriConverter();
	var classgrades=[];
	var finalresult;
	var retrievedvalues=[];
	var calcprecip=[];
	var results=[];
	var hourlist=["00","01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23"];
	var minutelistcomplete=["00","15","30","45"];
	var minutelist=["00"];
	var hourtext=['12 AM','1 AM','2 AM','3 AM','4 AM','5 AM','6 AM','7 AM','8 AM','9 AM','10 AM','11 AM','12 PM','1 PM','2 PM','3 PM','4 PM','5 PM','6 PM','7 PM','8 PM','9 PM','10 PM','11 PM'];
	
	var urlhourlist=["09","10","11","12","13","14","15","16","17","18","19","20","21","22","23","00","01","02","03","04","05","06","07","08"];
	var urlhourtext=['9 AM','10 AM','11 AM','12 PM','1 PM','2 PM','3 PM','4 PM','5 PM','6 PM','7 PM','8 PM','9 PM','10 PM','11 PM','12 AM','1 AM','2 AM','3 AM','4 AM','5 AM','6 AM','7 AM','8 AM'];
	var marker = new Array();
	var parameter;
	var zoom=7;
	var jsonfile;
	var latstart=14.95;
	var longstart=76.42;
	var opacity=0.6;
	var colourset=["red","orange","yellow","cyan","blue"];
	colourset=colourcreation();
	info = L.control({position: "topright"});
	info.update = function (props) { 	
    this._div.innerHTML =  (props ? 'Acc.Rainfall at '+tval.split('_')[0]+':'+tval.split('_')[1]+' is <b>' + props["GRIDCODE"] + ' mm  </b>': ' ');
	};
	info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'hover'); // create a div with a class "info"
    this.update();
    return this._div;
	};
	var colbreaks=210;
	function colourcreation()
	{
	var numberOfItems = 210;
	var rainbow = new Rainbow(); 
	rainbow.setNumberRange(1, numberOfItems);
	rainbow.setSpectrum('#FFFFFF', '#0000FF','#00AA00','#FFFF00','#FF0000','#800000','#7703FF','#000000');
	var s = [];
	for (var i = 1; i <= numberOfItems; i++) {
		var hexColour = rainbow.colourAt(i);
		s[i-1]='#' + hexColour;
	}
	return s;
	}
	function getColor(d) {
	//for the colours inside the map area
	if (d>=colbreaks)
		var v=parseInt(colbreaks-1)
	else
		var v=parseInt(d)
	return colourset[v]
	}
	
	var legend = L.control({position: 'bottomleft'});
	legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend'),
        
        labels = ['<strong> Legend</strong><br> Accumulated Rainfall <br>'],
		from, to;
	labels+='<i style="height: 15px;background:' + getColor(0) + '"></i> 0 mm<br>';
	labels+='<i style="height: 15px;background:' + getColor(30) + '"></i> 30 mm<br>'; 
	labels+='<i style="height: 15px;background:' + getColor(60) + '"></i> 60 mm<br>'; 
	labels+='<i style="height: 15px;background:' + getColor(90) + '"></i> 90 mm<br>'; 
	labels+='<i style="height: 15px;background:' + getColor(120) + '"></i> 120 mm<br>'; 
	labels+='<i style="height: 15px;background:' + getColor(150) + '"></i> 150 mm<br>'; 
	labels+='<i style="height: 15px;background:' + getColor(180) + '"></i> 180 mm<br>'; 
	labels+='<i style="height: 15px;background:' + getColor(210) + '"></i> 210 mm<br>'; 
	div.innerHTML= labels;
	return div;
	};
	
	map = L.map('map').setView([latstart, longstart], zoom);
	info.addTo(map);
	legend.addTo(map);
	var layerlabel = new Array();
	var tbx=document.getElementById("timebox");
	var opslider=document.getElementById("OPslider");
	var dater=document.getElementById("datebox");
	
	tbx.oninput = function() {
	tval = this.value;
	dateval=dater.value;
	yearselected=dateval.split('-')[0];
	monthselected=dateval.split('-')[1];
	dayselected=dateval.split('-')[2];
	hourselected=tval.split('_')[0];
	minuteselected=tval.split('_')[1];
	$('#loaddiv').show();
	fetchdata();
	}
	
	opslider.oninput = function() {
	opacity = this.value/100;
	$('#loaddiv').show();
	fetchdata();
	}
	
	dater.oninput = function() {
	dateval = this.value;
	console.log(dateval);
	yearselected=dateval.split('-')[0];
	monthselected=dateval.split('-')[1];
	dayselected=dateval.split('-')[2];
	tval=tbx.value;
	hourselected=tval.split('_')[0];
	minuteselected=tval.split('_')[1];
	$('#loaddiv').show();
	fetchdata();
	}
	
	
	
	function fetchdata()
	{
		
	var ksndmcurlFH="https://ksndmc.org:6443/arcgis/rest/services/KSNDMC/DailyRF_15Min/MapServer/dynamicLayer?f=json&layer=%7B%22source%22%3A%7B%22type%22%3A%22dataLayer%22%2C%22dataSource%22%3A%7B%22type%22%3A%22table%22%2C%22workspaceId%22%3A%22drf15%22%2C%22dataSourceName%22%3A%22DR_DailyMap_";
	

	var ksndmcurlSH="%22%7D%7D%7D";
	var urllist=[];
	
	urlreq=ksndmcurlFH+dayselected+monthselected+yearselected+"_"+tval+ksndmcurlSH;
	console.log(urlreq);
	finalresults=[];
	$.when(
	$.getJSON(urlreq)
	).done( function(d0){finalresult=d0;
	
		$('#loaddiv').hide();
		drawmap();
	});	
	
	}
	
	
	
	
	function drawmap()
	{
	
    //L.tileLayer(OSM_URL, {attribution: OSM_ATTRIB,id: 'examples.map-20v6611k', opacity:0.7}).addTo(map);
	var googleLayer = new L.Google('ROADMAP');
	map.addLayer(googleLayer,true);
	gcFeats = jsonconverter.toGeoJson(finalresult);
	if (geojson)
	{
		map.removeLayer(geojson);
	}
	geojson=L.geoJson(gcFeats, {style: vizstyle, onEachFeature: onEachFeature }).addTo(map);
	
	}
	
	function highlightFeature(e) {
	//When the users hover over the polygons, they are highlighted
    var layer = e.target;
    info.update(layer.feature.properties);
	}

	function resetHighlight(e) {
	//When the users hover out of the polygon,the highlight is removed
	info.update();
	}
	
	function onEachFeature(feature,layer) {
	layer.on({	
        mouseover: highlightFeature,
        mouseout: resetHighlight
	});
	}
	
	
	
	
	
	function vizstyle(feature) {
	
	return {
	    fillColor: getColor(feature.properties["GRIDCODE"]),
		weight: 0,
        opacity: opacity,
		stroke: false,
		smoothFactor:0,
        color: getColor(feature.properties["GRIDCODE"]),
        dashArray: '0',
        fillOpacity: opacity,
		zindex: 99
		};
	
	}
	function drawchart()
	{
	if (hourselected<9)
	{
	var labtext='Acc Rainfall in mm ('+pdd+'-'+pdm+'-'+pdy+' 9 AM and '+dayselected+'-'+monthselected+'-'+yearselected+' 8 AM)';
	}
	else
	{
	var labtext='Acc Rainfall in mm ('+dayselected+'-'+monthselected+'-'+yearselected+' 9 AM and '+ndd+'-'+ndm+'-'+ndy+' 8 AM)';
	}
	$('#loaddiv').hide();
	var ctx = document.getElementById("AccChart").getContext('2d');
	var AccChart = new Chart(ctx, {
		type: 'line',
		data: {
			labels: urlhourtext,
			datasets: [{
				label: labtext,
				data: calcprecip,
				backgroundColor: [
                'rgba(132, 99, 255, 0.2)',
                'rgba(255, 162, 54 0.2)',
                'rgba(86, 206, 255, 0.2)',
                'rgba(192, 192, 75, 0.2)',
                'rgba(255, 102, 153, 0.2)',
                'rgba(64, 159, 255, 0.2)'
            ],
				borderColor: [
                'rgba(0,0,255,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(0, 206, 255, 1)',
                'rgba(192, 192, 75, 1)',
                'rgba(255, 102, 102, 1)',
                'rgba(64, 159, 255, 1)'
            ],
				borderWidth: 1
			}]
		},
		options: {
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero:true
					}
				}]
			}
		}
	});
	}
	
	map.on('click', function(e)
	{
	$('#loaddiv').show();
	if (marker)
	{
		map.removeLayer(marker);
	}
	clickedpoint=[e.latlng.lng,e.latlng.lat];
	marker=new L.Marker(e.latlng).addTo(map);    
	var res='<canvas id="AccChart" width="400" height="200"></canvas>';
	
	marker.bindPopup(res,{maxWidth : 560, maxHeight: 400}).openPopup();
    var lmin=String(e.latlng.lng-0.0000001);
	var lmax=String(e.latlng.lng+0.0000001);
	var mmin=String(e.latlng.lat-0.0000001);
	var mmax=String(e.latlng.lat+0.0000001);
	var bbx=lmin+","+mmin+","+lmax+","+mmax;
	
	var urllist=[];
	var cd = new Date(yearselected, monthselected, dayselected);
	
	var prevdate = new Date(cd);
	var nextdate = new Date(cd);
	prevdate.setDate(prevdate.getDate() - 1); // minus the date
	nextdate.setDate(nextdate.getDate() + 1); // plus the date
	pd = new Date(prevdate);
	nd = new Date(nextdate);
	
	pdm=("0" + (pd.getMonth())).slice(-2);
	ndm=("0" + (nd.getMonth())).slice(-2);
	pdd=("0" + pd.getDate()).slice(-2);
	ndd=("0" + nd.getDate()).slice(-2);
	pdy=String(pd.getFullYear());
	ndy=String(nd.getFullYear());
	
	if (hourselected<9)
	{
		for(var urli=0;urli<15;urli++)
		{
		urlidentify="https://ksndmc.org:6443/arcgis/rest/services/KSNDMC/DailyRF_15Min/MapServer/identify?geometry="+String(e.latlng.lng)+"%2C"+String(e.latlng.lat)+"&geometryType=esriGeometryPoint&sr=4326&layers=%22DR_DailyMap_"+pdd+pdm+pdy+"_"+urlhourlist[urli]+"_"+"00"+"%22&layerDefs=&time=&layerTimeOptions=&tolerance=0.00001&mapExtent="+bbx+"&imageDisplay=600%2C550%2C96&returnGeometry=false&maxAllowableOffset=&geometryPrecision=&dynamicLayers=%5B%7B%22source%22%3A%7B%22type%22%3A%22dataLayer%22%2C%22dataSource%22%3A%7B%22type%22%3A%22table%22%2C%22workspaceId%22%3A%22drf15%22%2C%22dataSourceName%22%3A%22DR_DailyMap_"+pdd+pdm+pdy+"_"+urlhourlist[urli]+"_"+"00"+"%22%7D%7D%7D%5D&returnZ=false&returnM=false&gdbVersion=&f=pjson"
		urllist[urli]=urlidentify;
		}	
		for(urli=15;urli<24;urli++)
		{
		urlidentify="https://ksndmc.org:6443/arcgis/rest/services/KSNDMC/DailyRF_15Min/MapServer/identify?geometry="+String(e.latlng.lng)+"%2C"+String(e.latlng.lat)+"&geometryType=esriGeometryPoint&sr=4326&layers=%22DR_DailyMap_"+dayselected+monthselected+yearselected+"_"+urlhourlist[urli]+"_"+"00"+"%22&layerDefs=&time=&layerTimeOptions=&tolerance=0.00001&mapExtent="+bbx+"&imageDisplay=600%2C550%2C96&returnGeometry=false&maxAllowableOffset=&geometryPrecision=&dynamicLayers=%5B%7B%22source%22%3A%7B%22type%22%3A%22dataLayer%22%2C%22dataSource%22%3A%7B%22type%22%3A%22table%22%2C%22workspaceId%22%3A%22drf15%22%2C%22dataSourceName%22%3A%22DR_DailyMap_"+dayselected+monthselected+yearselected+"_"+urlhourlist[urli]+"_"+"00"+"%22%7D%7D%7D%5D&returnZ=false&returnM=false&gdbVersion=&f=pjson"
		urllist[urli]=urlidentify;
		}	
		console.log(urllist);
	}
	else
	{
		for(urli=0;urli<15;urli++)
		{
		urlidentify="https://ksndmc.org:6443/arcgis/rest/services/KSNDMC/DailyRF_15Min/MapServer/identify?geometry="+String(e.latlng.lng)+"%2C"+String(e.latlng.lat)+"&geometryType=esriGeometryPoint&sr=4326&layers=%22DR_DailyMap_"+dayselected+monthselected+yearselected+"_"+urlhourlist[urli]+"_"+"00"+"%22&layerDefs=&time=&layerTimeOptions=&tolerance=0.00001&mapExtent="+bbx+"&imageDisplay=600%2C550%2C96&returnGeometry=false&maxAllowableOffset=&geometryPrecision=&dynamicLayers=%5B%7B%22source%22%3A%7B%22type%22%3A%22dataLayer%22%2C%22dataSource%22%3A%7B%22type%22%3A%22table%22%2C%22workspaceId%22%3A%22drf15%22%2C%22dataSourceName%22%3A%22DR_DailyMap_"+dayselected+monthselected+yearselected+"_"+urlhourlist[urli]+"_"+"00"+"%22%7D%7D%7D%5D&returnZ=false&returnM=false&gdbVersion=&f=pjson"
		urllist[urli]=urlidentify;
		}
		for(urli=15;urli<24;urli++)
		{
		urlidentify="https://ksndmc.org:6443/arcgis/rest/services/KSNDMC/DailyRF_15Min/MapServer/identify?geometry="+String(e.latlng.lng)+"%2C"+String(e.latlng.lat)+"&geometryType=esriGeometryPoint&sr=4326&layers=%22DR_DailyMap_"+ndd+ndm+ndy+"_"+urlhourlist[urli]+"_"+"00"+"%22&layerDefs=&time=&layerTimeOptions=&tolerance=0.00001&mapExtent="+bbx+"&imageDisplay=600%2C550%2C96&returnGeometry=false&maxAllowableOffset=&geometryPrecision=&dynamicLayers=%5B%7B%22source%22%3A%7B%22type%22%3A%22dataLayer%22%2C%22dataSource%22%3A%7B%22type%22%3A%22table%22%2C%22workspaceId%22%3A%22drf15%22%2C%22dataSourceName%22%3A%22DR_DailyMap_"+ndd+ndm+ndy+"_"+urlhourlist[urli]+"_"+"00"+"%22%7D%7D%7D%5D&returnZ=false&returnM=false&gdbVersion=&f=pjson"
		urllist[urli]=urlidentify;
		}	
	
	}	
		
	
	
	
	$.when(
	$.getJSON(urllist[0]),$.getJSON(urllist[1]),$.getJSON(urllist[2]),$.getJSON(urllist[3]),$.getJSON(urllist[4]),$.getJSON(urllist[5]),$.getJSON(urllist[6]),$.getJSON(urllist[7]),$.getJSON(urllist[8]),$.getJSON(urllist[9]),$.getJSON(urllist[10]),$.getJSON(urllist[11]),$.getJSON(urllist[12]),$.getJSON(urllist[13]),$.getJSON(urllist[14]),$.getJSON(urllist[15]),$.getJSON(urllist[16]),$.getJSON(urllist[17]),$.getJSON(urllist[18]),$.getJSON(urllist[19]),$.getJSON(urllist[20]),$.getJSON(urllist[21]),$.getJSON(urllist[22]),$.getJSON(urllist[23])
	).done( function(d0,d1,d2,d3,d4,d5,d6,d7,d8,d9,d10,d11,d12,d13,d14,d15,d16,d17,d18,d19,d20,d21,d22,d23){
		ii=0;
		while (ii<24)
		{
			dstring="d"+String(ii);
			
			try
			{calcprecip[ii]=parseInt(eval(dstring)[0]["results"][0]["attributes"]["GRIDCODE"]);}
			catch(err)
			{
				calcprecip[ii]=null;
			}
			ii++;
		}
		
	
	$('#loaddiv').hide();
	
	
	
	drawchart();
	});	

	
	});