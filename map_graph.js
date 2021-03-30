let graph_2_width = (MAX_WIDTH / 2), graph_2_height = 575;

let svg1 = d3.select("#graph3")
.append("svg")
.attr("width", graph_2_width)     // HINT: width
.attr("height", graph_2_height)     // HINT: height
.append("g");

// Set up reference to tooltip
let tooltip = d3.select("#graph2")     
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

d3.select("#graph3")
.append("div")
.attr("class","sauce")
.append("em")
.attr("class", "sauce2")
.attr("transform", `translate(${(graph_2_width-margin.left-margin.right-10)/2},${(graph_2_height - margin.top-margin.bottom)+38})`)       
.style("text-anchor", "middle")
.text("*Hover over the country in the map to view its winning percentage!");
// Map and projection
var path = d3.geoPath();
var projection = d3.geoMercator()
  .scale(120)
  .center([0,20])
  .translate([graph_2_width / 2, graph_2_height / 2]);

slider1.on("slideStop", function(d) {
    start_year = d[0];
    end_year = d[1];
    loadMap();
})

// Data and color scale
var data_map = new Map();

var colorScale = d3.scaleThreshold()
.domain([0,10,20,30,40,50,60,70,80,90,100])
.range(d3.schemeBlues[9]);

function compareForData(a,b) {
    return b.win - a.win;
}  

let start_year = 1970;
let end_year = 2020;

function formatData(data, comparator, map_countries) {
    // TODO: sort and return the given data with the comparator (extracting the desired number of examples)
    let all_countries = new Map();
    data.forEach(function (el) {
        let home_score = parseInt(el.home_score);
        let away_score = parseInt(el.away_score);
        if (!all_countries.has(el.home_team)) {
            if (home_score > away_score) {
                all_countries.set(el.home_team, {wins : 1, total: 1});
            } else {
                all_countries.set(el.home_team, {wins : 0, total: 1});
            }
        } else {
            if (home_score > away_score) {
                score_object = all_countries.get(el.home_team);
                score_object.wins += 1;
                score_object.total += 1;
                all_countries.set(el.home_team, score_object);
            } else {
                score_object = all_countries.get(el.home_team);
                score_object.total += 1;
                all_countries.set(el.home_team, score_object);
            } 
        }
        if (!all_countries.has(el.away_team)) {
            if (away_score > home_score) {
                all_countries.set(el.away_team, {wins : 1, total: 1});
            } else {
                all_countries.set(el.away_team, {wins : 0, total: 1});
            }
        } else {
            if (home_score >= away_score) {
                score_object = all_countries.get(el.away_team);
                score_object.total += 1;
                all_countries.set(el.away_team, score_object);
            } else {
                score_object = all_countries.get(el.away_team);
                score_object.wins += 1;
                score_object.total += 1;
                all_countries.set(el.away_team, score_object);
            } 
        }
    });
    countries = []
    for (let [key, value] of all_countries) { 
        let win_pct = (value.wins / value.total * 100);
        if (key==="United States") {
            key = "USA";
        }
        if (key==="China PR") {
            key = "China";
        }
        if (key==="DR Congo") {
            key = "Democratic Republic of the Congo";
        }
        if (key==="Northern Ireland") {
            key = "Ireland";
        }
        if (key=="Serbia") {
            key = "Republic of Serbia";
        }
        if (key==="Guinea-Bissau") {
            key = "Guinea Bissau";
        }
        if (key==="North Macedonia") {
            key = "Macedonia";
        }
        if (key==="Tanzania") {
            key = "United Republic of Tanzania";
        }
        if (map_countries.includes(key)) {
            countries.push({country: key, win: win_pct});
        }
    }
    console.log(all_countries)
    countries = countries.sort(comparator);
    countries = countries.slice(0,10);
    countries.forEach(function (d) {
        data_map.set(d.country,d.win);
    })
}

function getDataForYears(data) {
    result = []
    data.forEach(function (el) {
        date_year = parseInt(moment(el.date,'YYYY-MM-DD').year());
        if ((date_year >= start_year) && (date_year <= end_year)) {
            result.push(el);
        }
    })
    return result;
}

// Draw the map
let appended_svg = svg1.append("g")

d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(function (topo) {
    map_countries = []
    topo.features.forEach(function(d) {
        map_countries.push(d.properties.name)
    });
    appended_svg = appended_svg.selectAll("path")
    .data(topo.features)
    .enter()
    .append("path")
    // draw each country
    .attr("d", d3.geoPath()
        .projection(projection)
    ).attr("fill", function (d) {
        return colorScale(0);
    })
});

function loadMap() {
    // Resetting the data map
    data_map = new Map();

    promise1 = d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson");
    promise2 = d3.csv("../data/football.csv");

    Promise.all([promise2]).then(values => {
        d = getDataForYears(values[0]);
        formatData(d, compareForData,map_countries);

        let mouseOver = function(d) {
            d3.selectAll(".Country")
            .transition()
            .duration(50)
            .style("opacity", .5)
            d3.select(this)
            .transition()
            .duration(200)
            .style("opacity", 1)
            // .style("stroke", "black")
            let color_span = `<span style="color: ${colorScale(d.total+30)};">`;
            let NA = d.total.toString() + "%";
            if (NA==="0%") {
                NA = "N/A";
            }
            let html = `${d.properties.name}<br/>
                    Win Percentage: ${color_span}${NA}</span>`;

            // Show the tooltip and set the position relative to the event X and Y location
            tooltip.html(html)
                .style("left", `${(d3.event.pageX) - 220}px`)
                .style("top", `${(d3.event.pageY) - 30}px`)
                .style("box-shadow", `2px 2px 5px ${colorScale(d.total+40)}`)
                .transition()
                .duration(200)
                .style("opacity", 0.9)
        }

        let mouseLeave = function(d) {
            d3.selectAll(".Country")
            .transition()
            .duration(200)
            .style("opacity", .8)
            tooltip.transition()
            .duration(200)
            .style("opacity", 0);
        }
        // set the color of each country
        appended_svg.attr("fill", function (d) {
            d.total = (Math.round(data_map.get(d.properties.name)*100)/100) || 0;
            return colorScale(d.total);
        })
        .style("stroke", "transparent")
        .attr("class", function(d){ return "Country" } )
        .style("opacity", .8)
        .on("mouseover", mouseOver )
        .on("mouseleave", mouseLeave )
    });
}

loadMap();