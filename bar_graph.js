let earliest_year = 1970;
let latest_year = 2020;
let graph_1_width = (MAX_WIDTH / 2) - 10, graph_1_height = 370;

let slider1 = new Slider('#year-slider',{
    tooltip: earliest_year.toString()+":"+latest_year.toString()
});

slider1.on("slideStop", function(d) {
    earliest_year = d[0];
    latest_year = d[1];
    if ((latest_year-earliest_year) >= 20) {
        graph_1_height = (latest_year-earliest_year) * 17.5
    }
    loadPage();
})

let svg = d3.select("#graph1")
    .append("svg")
    .attr("width", graph_1_width)    
    .attr("height", graph_1_height)     
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);    

let x = d3.scaleLinear()
        .range([0,graph_1_width - margin.left - margin.right]);

let y = d3.scaleBand()
        .range([0,graph_1_height - margin.bottom - margin.top])
        .padding(0.1);  

// Set up reference to count SVG group
let countRef = svg.append("g");
// Set up reference to y axis label to update text in setData
let y_axis_label = svg.append("g");

// TODO: Add x-axis label
svg.append("text")
    .attr("transform", `translate(${(graph_1_width-margin.left-margin.right)/2},${(graph_1_height - margin.top-margin.bottom)+15})`)       
    .style("text-anchor", "middle")
    .text("Count");

// TODO: Add y-axis label
svg.append("text")
    .attr("transform", `translate(-120,${(graph_1_height - margin.top - margin.bottom)/2})`)
    .style("text-anchor", "middle")
    .text("Year");

// TODO: Add chart title
const num = earliest_year+NUM_EXAMPLES;

let title = svg.append("text")
    .attr("transform", `translate(${(graph_1_width-margin.left-margin.right)/2},-10)`)
    .style("text-anchor", "middle")
    .style("font-size", 15);


function compareForBar(a,b) {
    return b.count - a.count;
}

function loadPage() {
    title.text("Number of International Football games by year from " + earliest_year.toString() +" to "+latest_year.toString()+"! (Top 20)");
    // TODO: Load the football CSV file into D3 by using the d3.csv() method
    d3.csv("../data/football.csv").then(function(data) {
        // TODO: Clean and strip desired amount of data for barplot
        data = cleanData(data, compareForBar, NUM_EXAMPLES);

        console.log(data);
        
        x.domain([0, d3.max(data, function(d) {
            return parseInt(d.count);})])

        y.domain(data.map(function (d) {
            return d.year;
        }))

        y_axis_label.call(d3.axisLeft(y).tickSize(0).tickPadding(10));

        let color = d3.scaleOrdinal()
        .domain(data.map(function(d) { return d.year }))
        .range(d3.quantize(d3.interpolateHcl("#66a0e2", "#81c2c3"), NUM_EXAMPLES));

        let bars = svg.selectAll("rect").data(data).attr("fill", function(d){return color(d.year) });;

        bars.enter()
            .append("rect")
            .merge(bars)
            .attr("fill", function(d) { return color(d.year) })
            .attr("x", x(0))
            .attr("y", function (d) {
                return y(d.year);
            })               
            .attr("width", function (d) {
                return x(parseInt(d.count));
            })
            .attr("height", y.bandwidth());  

        let counts = countRef.selectAll("text").data(data);

        counts.enter()
            .append("text")
            .merge(counts)
            .attr("x", function (d) {
                return x(parseInt(d.count))+5;
            })       
            .attr("y", function (d) {
                return y(d.year)+10;
            })       
            .style("text-anchor", "start")
            .text(function(d) {
            return parseInt(d.count)
            });           
        bars.exit().remove();
        counts.exit().remove();
    });
}

/**
 * Cleans the provided data using the given comparator then strips to first numExamples
 * instances
 */
function cleanData(data, comparator, numExamples) {
    years = []
    for (i = earliest_year; i < latest_year+1; i++) {
        years.push({
            year: i,
            count: 0
        });
    }
    data.forEach(function (el) {
        date_year = parseInt(moment(el.date,'YYYY-MM-DD').year());
        if (date_year >= earliest_year) {
            years.forEach(function (y) {
                if (y.year===date_year) {
                    y.count += 1;
                }
            })
        }
    })
    years = years.sort(comparator);
    console.log(years);
    years = years.slice(0,numExamples);
    return years;
}

loadPage();
