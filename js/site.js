function loadData(url){
	$.ajax({ 
	    type: 'GET', 
	    url: url, 
	    dataType: 'json',
	    success:function(response){
	        let data = hxlProxyToJSON(response);
	        init(data);
	    }
	});
}

function hxlProxyToJSON(input){
    var output = [];
    var keys=[]
    input.forEach(function(e,i){
        if(i==0){
            e.forEach(function(e2,i2){
                var parts = e2.split('+');
                var key = parts[0]
                if(parts.length>1){
                    var atts = parts.splice(1,parts.length);
                    atts.sort();                    
                    atts.forEach(function(att){
                        key +='+'+att
                    });
                }
                keys.push(key);
            });
        } else {
            var row = {};
            e.forEach(function(e2,i2){
                row[keys[i2]] = e2;
            });
            output.push(row);
        }
    });
    return output;
}

function createTimeline(id,data,crises){

	crises.forEach(function(c){
		c["Start date"] = new Date(c["Start date"]);
	})

	var margin = {top: 20, right: 20, bottom: 20, left: 20},
	    width = $(id).width() - margin.left - margin.right,
	    height = 600 - margin.top - margin.bottom;

	var svg = d3.select(id)
	  .append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform",
	          "translate(" + margin.left + "," + margin.top + ")");

	let startDate = new Date('01/01/14');
	let endDate = new Date('01/01/20');

    var x = d3.time.scale()
      .domain([startDate,endDate])
      .range([ 0, width ]);

  	var xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom")
	    .tickFormat(d3.time.format("%Y"));

    svg.append("g")
      	.attr("transform", "translate(0," + (height/2) + ")")
      	.attr("class","axis")
      	.call(xAxis);

    let lines = svg.append("g");

    lines.selectAll("lines")
    	.data(crises)
    	.enter()
    	.append("line")
		.attr("x1", function(d){
			console.log(d['Start date']);
			return x(d['Start date'])
		})
		.attr("y1", function(d,i){
			if(i % 2 ==0){
				return height/2-d.count
			} else {
				return height/2
			}
		})
		.attr("x2", function(d){
			return x(d['Start date'])
		})
		.attr("y2", function(d,i){
			if(i % 2 ==0){
				return height/2
			} else {
				return height/2+d.count
			}
		})
		.attr("stroke-width", 2)
		.attr("stroke", "black");

	let texts = svg.append("g");

	texts.selectAll("text")
		.data(crises)
    	.enter()
    	.append("text")
    	.text(function(d){
    		return d['Crisis name'];
    	})
    	.attr("transform", function(d,i){
			let xText = x(d['Start date']);
			let yText = 280;
			if(i % 2 ==0){
				yText = yText -20
			} else {
				yText = yText +20
			}
			return "translate(" + xText + "," + yText + ") rotate(0)"
		})
		.style("text-anchor", function(d,i){
			/*if(i % 2 ==0){
				return "start"
			} else {
				return "end"
			}*/
			return "start"
		})
    	.attr("x", function(d,i){
			/*if(i % 2 ==0){
				return 5
			} else {
				return -5
			}*/
			return 5;
		})
		.attr("y", 0)
		.attr("dy", "1em");

	let circles = svg.append("g");

	circles.selectAll("circles")
		.data(crises)
    	.enter()
    	.append("circle")
    	.attr("cx", function(d,i){
			return x(d['Start date'])
		})
		.attr("cy", function(d,i){
			if(i % 2 ==0){
				return height/2-d.count-20
			} else {
				return height/2+d.count+20
			}
		})
		.attr("r",20)
		.attr("fill","#f2645a");

	console.log(data);
	data.forEach(function(d,i){
		console.log(crises[i]);
		let centreX = x(crises[i]['Start date']);
		let centreY = height/2-crises[i].count-20
		if(i % 2 ==1){
			centreY = height/2+crises[i].count+20
		}
		addNodes(svg,d,centreX,centreY,-135);
	});
}

function addNodes(svg,nodes,cx,cy,startangle){
	let nodesPerLayer = 20;
	let degrees = 360/nodesPerLayer;
	let lineLength = 20;

	let nodeCircles = svg.append("g");

	nodeCircles.selectAll("circles")
		.data(nodes)
    	.enter()
    	.append("circle")
    	.attr("cx", function(d,i){
    		let lineHeight = 2;
    		let angle = i*degrees+startangle
    		let radians = angle * Math.PI / 180
    		if(i>nodesPerLayer){
    			lineHeight = 3
    		}
    		let x = Math.sin(radians) * lineLength * lineHeight+cx;
    		return x;
		})
		.attr("cy", function(d,i){
    		let lineHeight = 2;
    		let angle = i*degrees+startangle
    		let radians = angle * Math.PI / 180
    		if(i>nodesPerLayer){
    			lineHeight = 3
    		}
			let y = -Math.cos(radians) * lineLength * lineHeight+cy;
			return y;
		})
		.attr("r",4)
		.attr("fill","#1bb580");
}

function createLegend(){

	var margin = {top: 20, right: 20, bottom: 20, left: 20},
	    width = $('#legend').width() - margin.left - margin.right,
	    height = 200 - margin.top - margin.bottom;

	var svg = d3.select('#legend')
	  .append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform",
	          "translate(" + margin.left + "," + margin.top + ")");

    let lines = svg.append("g");

    lines
    	.append("line")
		.attr("x1", width/2)
		.attr("y1", 30)
		.attr("x2", width/2)
		.attr("y2", 150)
		.attr("stroke-width", 2)
		.attr("stroke", "black");

	let texts = svg.append("g");

	texts
    	.append("text")
    	.text('Crisis Name')
    	.attr("transform", function(d,i){
			return "translate(" + (width/2) + "," + 130 + ") rotate(0)"
		})
		.style("text-anchor", function(d,i){
			/*if(i % 2 ==0){
				return "start"
			} else {
				return "end"
			}*/
			return "start"
		})
    	.attr("x", function(d,i){
			/*if(i % 2 ==0){
				return 5
			} else {
				return -5
			}*/
			return 5;
		})
		.attr("y", 0)
		.attr("dy", "1em");

	texts
    	.append("text")
    	.text('Length of line represents')
    	.attr("transform", function(d,i){
			return "translate(" + (width/2) + "," + 90 + ") rotate(0)"
		})
		.style("text-anchor", function(d,i){
			/*if(i % 2 ==0){
				return "start"
			} else {
				return "end"
			}*/
			return "end"
		})
    	.attr("x", function(d,i){
			/*if(i % 2 ==0){
				return 5
			} else {
				return -5
			}*/
			return -5;
		})
		.attr("y", 0)
		.attr("dy", "1em");

	texts
    	.append("text")
    	.text('total number of datasets uploaded.')
    	.attr("transform", function(d,i){
			return "translate(" + (width/2) + "," + 110 + ") rotate(0)"
		})
		.style("text-anchor", function(d,i){
			/*if(i % 2 ==0){
				return "start"
			} else {
				return "end"
			}*/
			return "end"
		})
    	.attr("x", function(d,i){
			/*if(i % 2 ==0){
				return 5
			} else {
				return -5
			}*/
			return -5;
		})
		.attr("y", 0)
		.attr("dy", "1em");

	texts
    	.append("text")
    	.text('Each green circle represents an')
    	.attr("transform", function(d,i){
			return "translate(" + (width/2) + "," + 10 + ") rotate(0)"
		})
		.style("text-anchor", function(d,i){
			/*if(i % 2 ==0){
				return "start"
			} else {
				return "end"
			}*/
			return "start"
		})
    	.attr("x", function(d,i){
			/*if(i % 2 ==0){
				return 5
			} else {
				return -5
			}*/
			return 50;
		})
		.attr("y", 0)
		.attr("dy", "1em");

	texts
    	.append("text")
    	.text('organisation uploading data to HDX')
    	.attr("transform", function(d,i){
			return "translate(" + (width/2) + "," + 30 + ") rotate(0)"
		})
		.style("text-anchor", function(d,i){
			/*if(i % 2 ==0){
				return "start"
			} else {
				return "end"
			}*/
			return "start"
		})
    	.attr("x", function(d,i){
			/*if(i % 2 ==0){
				return 5
			} else {
				return -5
			}*/
			return 50;
		})
		.attr("y", 0)
		.attr("dy", "1em");

	let circles = svg.append("g");

	circles
    	.append("circle")
    	.attr("cx", width/2)
		.attr("cy", 30)
		.attr("r",20)
		.attr("fill","#f2645a");

	let nodes = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];

	addNodes(svg,nodes,width/2,30,-135);
}

function init(data){

	let crises = [
	  {
	    "Crisis name": "West Africa Ebola",
	    "Start date": "08/08/2014",
	    "angle":-135
	  },
	  {
	    "Crisis name": "Nepal Earthquake",
	    "Start date": "04/25/2015",
	    "angle":-135
	  },
	  {
	    "Crisis name": "Cyclone Idai",
	    "Start date": "03/14/2019",
	    "angle":-185
	  },
	  {
	    "Crisis name": "DRC Ebola",
	    "Start date": "07/17/2019",
	    "angle":-135
	  },
	  {
	    "Crisis name": "Yemen",
	    "Start date": "07/01/2015",
	    "angle":0
	  },
	  {
	    "Crisis name": "Cox's Bazaar",
	    "Start date": "09/01/2017",
	    "angle":-135
	  }
	];
	[data,crises]  = processData(data,crises);

	createTimeline('#viz',data,crises);
	createLegend();
}

function processData(data,crises){
	let output = [[],[],[],[],[],[]];

	crises.forEach(function(c){
		c.count = 0;
	})
	
	data.forEach(function(d){
		let id = +d['#crisis+id']-1;
		if(output[id].indexOf(d['#org+name'])==-1){
			output[id].push(d['#org+name']);
		}
		crises[id].count++;
	});
	return [output,crises];
}

//load 3W data

let url = 'https://proxy.hxlstandard.org/data.json?dest=data_edit&strip-headers=on&url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1eTA6yzwdLqvy_yByVCmcJeepSYVXB8oiF5Yz3ktATcE%2Fedit%23gid%3D1364127737';

loadData(url);