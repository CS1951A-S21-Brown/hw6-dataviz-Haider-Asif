let graph_3_width = (MAX_WIDTH / 2) - 10, graph_3_height = 400;

let svg2 = d3.select("#graph2")
    .append("svg")
    .attr("width", graph_3_width)    
    .attr("height", graph_3_height)     
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);    

let x1 = d3.scaleBand()
        .range([0,graph_3_width - margin.left - margin.right])
        .padding(0.2);  
let y1 = d3.scaleLinear()
        .range([graph_3_height - margin.bottom - margin.top,0]);

// Set up reference to y axis label to update text in setData
let x_axis_label_1 = svg2.append("g");
let y_axis_label_1 = svg2.append("g");

// TODO: Add y-axis label
svg2.append("text")
    .attr("transform", `translate(-120,${(graph_3_height - margin.top - margin.bottom)/2})`)
    .style("text-anchor", "middle")
    .text("Probability");

svg2.append("text")
    .attr("transform", `translate(${(graph_3_width-margin.left-margin.right)/2},-20)`)
    .style("text-anchor", "middle")
    .style("font-size", 15)
    .text("Predict which Country will win the 2022 FIFA World Cup by Probability (Top 20)*");

svg2.append("text")
    .attr("transform", `translate(${(graph_3_width-margin.left-margin.right)/2})`)
    .style("text-anchor", "middle")
    .style("font-size", 11)
    .text("* Probabilities are calculated based on win percentages, goals scored, and goals conceded in the past 2 world cups");

// TODO: Add x-axis label
d3.select("#graph2")
    .append("div")
    .attr("class","sauce")
    .append("text")
    .attr("class", "sauce2")
    .attr("transform", `translate(${(graph_3_width-margin.left-margin.right-10)/2},${(graph_3_height - margin.top-margin.bottom)+38})`)       
    .style("text-anchor", "middle")
    .text("Country");


function compareForWorld(a,b) {
    return b.win - a.win;
}

function loadWorld() {
    d3.csv("../data/football.csv").then(function(data) {
        data = formatCupData(getDataForWorldCup(data),compareForWorld);

        console.log(data);
        
        x1.domain(data.map(function (d) {
            return d.country;
        }));

        y1.domain([0, 0.15]);

        x_axis_label_1.attr("transform", `translate(0, ${(graph_3_height - margin.top - margin.bottom)})`)
        .call(d3.axisBottom(x1))
        .selectAll("text")
        .attr("transform", `translate(-10,0)rotate(-30)`)
        .style("text-anchor", "end");
        
        y_axis_label_1.call(d3.axisLeft(y1).tickSize(0).tickPadding(10));

        let color = d3.scaleOrdinal()
        .domain(data.map(function(d) { return d.country }))
        .range(d3.quantize(d3.interpolateHcl("#66a0e2", "#81c2c3"), NUM_EXAMPLES));

        let bars = svg2.selectAll("bars").data(data);

        bars.enter()
            .append("rect")
            .attr("fill", function(d) { return color(d.country) })
            .attr("x", function (d) {
                return x1(d.country);
            })
            .attr("y", function (d) {
                return y1(d.win);
            })               
            .attr("width",x1.bandwidth())
            .attr("height", function (d) {
                return graph_3_height - margin.top - margin.bottom - y1(d.win);
            });
    });
}

function getDataForWorldCup(data) {
    let res = []
    data.forEach(function (el) {
        date_year = parseInt(moment(el.date,'YYYY-MM-DD').year());
        if (((date_year===2018) || (date_year===2014)) && (el.tournament==="FIFA World Cup")) {
            res.push(el);
        }
    })
    return res;
}

function formatCupData(data, comparator) {
    // TODO: sort and return the given data with the comparator (extracting the desired number of examples)
    let all_countries = new Map();
    data.forEach(function (el) {
        let home_score = parseInt(el.home_score);
        let away_score = parseInt(el.away_score);
        if (!all_countries.has(el.home_team)) {
            if (home_score > away_score) {
                all_countries.set(el.home_team, {wins : 1, total: 1, goals_for: home_score, goals_against: away_score});
            } else {
                all_countries.set(el.home_team, {wins : 0, total: 1, goals_for: home_score, goals_against: away_score});
            }
        } else {
            if (home_score > away_score) {
                score_object = all_countries.get(el.home_team);
                score_object.wins += 1;
                score_object.total += 1;
                score_object.goals_for += home_score;
                score_object.goals_against += away_score;
                all_countries.set(el.home_team, score_object);
            } else {
                score_object = all_countries.get(el.home_team);
                score_object.total += 1;
                score_object.goals_for += home_score;
                score_object.goals_against += away_score;
                all_countries.set(el.home_team, score_object);
            } 
        }
        if (!all_countries.has(el.away_team)) {
            if (away_score > home_score) {
                all_countries.set(el.away_team, {wins : 1, total: 1, goals_for: away_score, goals_against: home_score});
            } else {
                all_countries.set(el.away_team, {wins : 0, total: 1, goals_for: away_score, goals_against: home_score});
            }
        } else {
            if (home_score >= away_score) {
                score_object = all_countries.get(el.away_team);
                score_object.total += 1;
                score_object.goals_for += away_score;
                score_object.goals_against += home_score;
                all_countries.set(el.away_team, score_object);
            } else {
                score_object = all_countries.get(el.away_team);
                score_object.wins += 1;
                score_object.total += 1;
                score_object.goals_for += away_score;
                score_object.goals_against += home_score;
                all_countries.set(el.away_team, score_object);
            } 
        }
    });
    console.log(all_countries)
    countries = []
    let sum = 0
    for (let [key, value] of all_countries) { 
        let goal_diff = value.goals_for / value.goals_against;
        let win_pct = (value.wins / value.total);
        if (goal_diff !== 0) {
            win_pct = (value.wins / value.total) * goal_diff;
        }
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
        countries.push({country: key, win: win_pct});
        sum += win_pct;
    }
    let result = []
    countries.forEach(function (d) {
        let probs = (d.win / sum);
        if (d.country==="Bosnia and Herzegovina") {
            d.country = "Bosnia";
        }
        result.push({country: d.country, win: probs});
    })
    console.log(result)
    countries = result.sort(comparator);
    countries = countries.slice(0,NUM_EXAMPLES)
    return countries
}

loadWorld();