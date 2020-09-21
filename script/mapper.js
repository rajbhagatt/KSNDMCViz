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
	var colbreaks=400;
	function colourcreation()
	{
	var numberOfItems = 400;
	var rainbow = new Rainbow(); 
	rainbow.setNumberRange(1, numberOfItems);
	//'#FFFFFF','#EFF0FB','#C1C9F9','#A3AFF7','#8499F2','#6682EF','#4270EA','#005BE5','#3360A8','#3A6670','#386D3F','#267200','#669E00','#ADCC00','#FFFF00','#FF9300','#FF0000','#CC0000','#9B0000','#720000','#3F0000','#000000','#4C4C4C'

	//'#FFFFFF', '#0000FF','#00AA00','#FFFF00','#FF0000','#800000','#7703FF','#000000'
	
	//
	
	rainbow.setSpectrum('#FFFFFF','#5555FF','#0000FF','#008800','#FFFF00','#FF6600','#FF0000','#AA0000','#770000','#330000','#000000','#0C0C0C','#191919','#262626','323232','#3F3F3F','#4C4C4C');
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
	labels+='<i style="height: 15px;background:' + getColor(10) + '"></i> 10 mm<br>'; 
	labels+='<i style="height: 15px;background:' + getColor(20) + '"></i> 20 mm<br>'; 
	labels+='<i style="height: 15px;background:' + getColor(50) + '"></i> 50 mm<br>'; 
	labels+='<i style="height: 15px;background:' + getColor(75) + '"></i> 75 mm<br>'; 
	labels+='<i style="height: 15px;background:' + getColor(100) + '"></i> 100 mm<br>'; 
	labels+='<i style="height: 15px;background:' + getColor(150) + '"></i> 150 mm<br>'; 
	labels+='<i style="height: 15px;background:' + getColor(250) + '"></i> 200 mm<br>'; 
	labels+='<i style="height: 15px;background:' + getColor(400) + '"></i> 400 mm<br>'; 
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
		
		
	var ksndmcurlFH="https://ksndmc.org:6443/arcgis/rest/services/KSNDMC/DailyRF_15Min/MapServer/dynamicLayer/query?f=json&outsr=4326&returnGeometry=true&spatialRel=esriSpatialRelIntersects&objectIds=1%2C2%2C3%2C4%2C5%2C6%2C7%2C8%2C9%2C10%2C11%2C12%2C13%2C14%2C15%2C16%2C17%2C18%2C19%2C20%2C21%2C22%2C23%2C24%2C25%2C26%2C27%2C28%2C29%2C30%2C31%2C32%2C33%2C34%2C35%2C36%2C37%2C38%2C39%2C40%2C41%2C42%2C43%2C44%2C45%2C46%2C47%2C48%2C49%2C50%2C51%2C52%2C53%2C54%2C55%2C56%2C57%2C58%2C59%2C60%2C61%2C62%2C63%2C64%2C65%2C66%2C67%2C68%2C69%2C70%2C71%2C72%2C73%2C74%2C75%2C76%2C77%2C78%2C79%2C80%2C81%2C82%2C83%2C84%2C85%2C86%2C87%2C88%2C89%2C90%2C91%2C92%2C93%2C94%2C95%2C96%2C97%2C98%2C99%2C100%2C101%2C102%2C103%2C104%2C105%2C106%2C107%2C108%2C109%2C110%2C111%2C112%2C113%2C114%2C115%2C116%2C117%2C118%2C119%2C120%2C121%2C122%2C123%2C124%2C125%2C126%2C127%2C128%2C129%2C130%2C131%2C132%2C133%2C134%2C135%2C136%2C137%2C138%2C139%2C140%2C141%2C142%2C143%2C144%2C145%2C146%2C147%2C148%2C149%2C150%2C151%2C152%2C153%2C154%2C155%2C156%2C157%2C158%2C159%2C160%2C161%2C162%2C163%2C164%2C165%2C166%2C167%2C168%2C169%2C170%2C171%2C172%2C173%2C174%2C175%2C176%2C177%2C178%2C179%2C180%2C181%2C182%2C183%2C184%2C185%2C186%2C187%2C188%2C189%2C190%2C191%2C192%2C193%2C194%2C195%2C196%2C197%2C198%2C199%2C200%2C201%2C202%2C203%2C204%2C205%2C206%2C207%2C208%2C209%2C210%2C211%2C212%2C213%2C214%2C215%2C216%2C217%2C218%2C219%2C220%2C221%2C222%2C223%2C224%2C225%2C226%2C227%2C228%2C229%2C230%2C231%2C232%2C233%2C234%2C235%2C236%2C237%2C238%2C239%2C240%2C241%2C242%2C243%2C244%2C245%2C246%2C247%2C248%2C249&outFields=*&layer=%7B%22source%22%3A%7B%22type%22%3A%22dataLayer%22%2C%22dataSource%22%3A%7B%22type%22%3A%22table%22%2C%22workspaceId%22%3A%22drf15%22%2C%22dataSourceName%22%3A%22DR_DailyMap_";
	
	
	ksndmcurlFH="https://ksndmc.org:6443/arcgis/rest/services/KSNDMC/DailyRF_15Min/MapServer/dynamicLayer/query?f=json&outsr=4326&returnGeometry=true&spatialRel=esriSpatialRelIntersects&objectIds=1%2C2%2C3%2C4%2C5%2C6%2C7%2C8%2C9%2C10%2C11%2C12%2C13%2C14%2C15%2C16%2C17%2C18%2C19%2C20%2C21%2C22%2C23%2C24%2C25%2C26%2C27%2C28%2C29%2C30%2C31%2C32%2C33%2C34%2C35%2C36%2C37%2C38%2C39%2C40%2C41%2C42%2C43%2C44%2C45%2C46%2C47%2C48%2C49%2C50%2C51%2C52%2C53%2C54%2C55%2C56%2C57%2C58%2C59%2C60%2C61%2C62%2C63%2C64%2C65%2C66%2C67%2C68%2C69%2C70%2C71%2C72%2C73%2C74%2C75%2C76%2C77%2C78%2C79%2C80%2C81%2C82%2C83%2C84%2C85%2C86%2C87%2C88%2C89%2C90%2C91%2C92%2C93%2C94%2C95%2C96%2C97%2C98%2C99%2C100%2C101%2C102%2C103%2C104%2C105%2C106%2C107%2C108%2C109%2C110%2C111%2C112%2C113%2C114%2C115%2C116%2C117%2C118%2C119%2C120%2C121%2C122%2C123%2C124%2C125%2C126%2C127%2C128%2C129%2C130%2C131%2C132%2C133%2C134%2C135%2C136%2C137%2C138%2C139%2C140%2C141%2C142%2C143%2C144%2C145%2C146%2C147%2C148%2C149%2C150%2C151%2C152%2C153%2C154%2C155%2C156%2C157%2C158%2C159%2C160%2C161%2C162%2C163%2C164%2C165%2C166%2C167%2C168%2C169%2C170%2C171%2C172%2C173%2C174%2C175%2C176%2C177%2C178%2C179%2C180%2C181%2C182%2C183%2C184%2C185%2C186%2C187%2C188%2C189%2C190%2C191%2C192%2C193%2C194%2C195%2C196%2C197%2C198%2C199%2C200%2C201%2C202%2C203%2C204%2C205%2C206%2C207%2C208%2C209%2C210%2C211%2C212%2C213%2C214%2C215%2C216%2C217%2C218%2C219%2C220%2C221%2C222%2C223%2C224%2C225%2C226%2C227%2C228%2C229%2C230%2C231%2C232%2C233%2C234%2C235%2C236%2C237%2C238%2C239%2C240%2C241%2C242%2C243%2C244%2C245%2C246%2C247%2C248%2C249%2C250%2C251%2C252%2C253%2C254%2C255%2C256%2C257%2C258%2C259%2C260%2C261%2C262%2C263%2C264%2C265%2C266%2C267%2C268%2C269%2C270%2C271%2C272%2C273%2C274%2C275%2C276%2C277%2C278%2C279%2C280%2C281%2C282%2C283%2C284%2C285%2C286%2C287%2C288%2C289%2C290%2C291%2C292%2C293%2C294%2C295%2C296%2C297%2C298%2C299%2C300%2C301%2C302%2C303%2C304%2C305%2C306%2C307%2C308%2C309%2C310%2C311%2C312%2C313%2C314%2C315%2C316%2C317%2C318%2C319%2C320%2C321%2C322%2C323%2C324%2C325%2C326%2C327%2C328%2C329%2C330%2C331%2C332%2C333%2C334%2C335%2C336%2C337%2C338%2C339%2C340%2C341%2C342%2C343%2C344%2C345%2C346%2C347%2C348%2C349%2C350%2C351%2C352%2C353%2C354%2C355%2C356%2C357%2C358%2C359%2C360%2C361%2C362%2C363%2C364%2C365%2C366%2C367%2C368%2C369%2C370%2C371%2C372%2C373%2C374%2C375%2C376%2C377%2C378%2C379%2C380%2C381%2C382%2C383%2C384%2C385%2C386%2C387%2C388%2C389%2C390%2C391%2C392%2C393%2C394%2C395%2C396%2C397%2C398%2C399%2C400%2C401%2C402%2C403%2C404%2C405%2C406%2C407%2C408%2C409%2C410%2C411%2C412%2C413%2C414%2C415%2C416%2C417%2C418%2C419%2C420%2C421%2C422%2C423%2C424%2C425%2C426%2C427%2C428%2C429%2C430%2C431%2C432%2C433%2C434%2C435%2C436%2C437%2C438%2C439%2C440%2C441%2C442%2C443%2C444%2C445%2C446%2C447%2C448%2C449%2C450%2C451%2C452%2C453%2C454%2C455%2C456%2C457%2C458%2C459%2C460%2C461%2C462%2C463%2C464%2C465%2C466%2C467%2C468%2C469%2C470%2C471%2C472%2C473%2C474%2C475%2C476%2C477%2C478%2C479%2C480%2C481%2C482%2C483%2C484%2C485%2C486%2C487%2C488%2C489%2C490%2C491%2C492%2C493%2C494%2C495%2C496%2C497%2C498%2C499%2C500&outFields=*&layer=%7B%22source%22%3A%7B%22type%22%3A%22dataLayer%22%2C%22dataSource%22%3A%7B%22type%22%3A%22table%22%2C%22workspaceId%22%3A%22drf15%22%2C%22dataSourceName%22%3A%22DR_DailyMap_";
	

	var ksndmcurlSH="%22%7D%7D%7D";
	var urllist=[];
	
	urlreq=ksndmcurlFH+dayselected+monthselected+yearselected+"_"+tval+ksndmcurlSH;
	
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