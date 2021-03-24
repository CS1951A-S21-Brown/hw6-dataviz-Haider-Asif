// CSV filenames for artist and song data
let filenames = ["../data/artists.csv", "../data/songs.csv"];

// Set up width and height for barplot
let width = 900,
    height = 350;

let color = d3.scaleOrdinal()
.range(d3.quantize(d3.interpolateHcl("#66a0e2", "#81c2c3"), NUM_EXAMPLES));

// TODO: Set up SVG object with width, height and margin
let svg = d3.select("#barplot")
    .append("svg")
    .attr("width", width)     // HINT: width
    .attr("height", height)     // HINT: height
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)
    .attr("fill", function (d) {
        return color(d);
    });    // HINT: transform
// TODO: Create a linear scale for the x axis (number of occurrences)

let x = d3.scaleLinear()
        .range([0,width - margin.left - margin.right]);

// TODO: Create a scale band for the y axis (artist)
let y = d3.scaleBand()
    .range([0,height - margin.bottom - margin.top])
    .padding(0.1);  // Improves readability
/*
    Here we will create global references to the x and y axis with a fixed range.
    We will update the domain of the axis in the setData function based on which data source
    is requested.
 */

// Set up reference to count SVG group
let countRef = svg.append("g");
// Set up reference to y axis label to update text in setData
let y_axis_label = svg.append("g");

// TODO: Add x-axis label
svg.append("text")
    .attr("transform", `translate(${(width-margin.left-margin.right)/2},${(height - margin.top-margin.bottom)+15})`)       // HINT: Place this at the bottom middle edge of the graph
    .style("text-anchor", "middle")
    .text("Count");
// Since this text will not update, we can declare it outside of the setData function


// TODO: Add y-axis label
let y_axis_text = svg.append("text")
    .attr("transform", `translate(-120,${(height - margin.top-margin.bottom)/2})`)       // HINT: Place this at the center left edge of the graph
    .style("text-anchor", "middle");

// TODO: Add chart title
let title = svg.append("text")
    .attr("transform", `translate(${(width-margin.left-margin.right)/2},-10)`)       // HINT: Place this at the top middle edge of the graph
    .style("text-anchor", "middle")
    .style("font-size", 15);
/*
    We declare global references to the y-axis label and the chart title to update the text when
    the data source is changed.
 */



/**
 * Sets the data on the barplot using the provided index of valid data sources and an attribute
 * to use for comparison
 */
function setData(index, attr) {
    // TODO: Load the artists CSV file into D3 by using the d3.csv() method. Index into the filenames array
    d3.csv(filenames[index]).then(function(data) {
        // TODO: Clean and strip desired amount of data for barplot
        data = cleanData(data,compareForData,NUM_EXAMPLES);

        // TODO: Update the x axis domain with the max count of the provided data
        x.domain([0, d3.max(data, function(d) {
            return parseInt(d['count']);})])

        // TODO: Update the y axis domains with the desired attribute
        y.domain(data.map(function (d) {
            return d[attr];
        }));
        // HINT: Use the attr parameter to get the desired attribute for each data point

        // TODO: Render y-axis label
        y_axis_label.call(d3.axisLeft(y).tickSize(0).tickPadding(10));

        /*
            This next line does the following:
                1. Select all desired elements in the DOM
                2. Count and parse the data values
                3. Create new, data-bound elements for each data value
         */

        let color = d3.scaleOrdinal()
        .domain(data.map(function(d) { return d[attr] }))
        .range(d3.quantize(d3.interpolateHcl("#66a0e2", "#81c2c3"), NUM_EXAMPLES));

        let bars = svg.selectAll("rect").data(data).attr("fill", function(d){return color(d[attr]) });

        // TODO: Render the bar elements on the DOM
        /*
            This next section of code does the following:
                1. Take each selection and append a desired element in the DOM
                2. Merge bars with previously rendered elements
                3. For each data point, apply styling attributes to each element

            Remember to use the attr parameter to get the desired attribute for each data point
            when rendering.
         */
        bars.enter()
            .append("rect")
            .merge(bars)
            .transition()
            .duration(1000)
            .attr("x", x(0))
            .attr("y", function (d) {
                return y(d[attr]);
            })               // HINT: Use function(d) { return ...; } to apply styles based on the data point
            .attr("width", function (d) {
                return x(parseInt(d.count));
            })
            .attr("height",  y.bandwidth());        // HINT: y.bandwidth() makes a reasonable display height

        /*
            In lieu of x-axis labels, we are going to display the count of the artist next to its bar on the
            bar plot. We will be creating these in the same manner as the bars.
         */
        let counts = countRef.selectAll("text").data(data);

        // TODO: Render the text elements on the DOM
        counts.enter()
            .append("text")
            .merge(counts)
            .transition()
            .duration(1000)
            .attr("x", function (d) {
                return x(parseInt(d.count));
            })       // HINT: Add a small offset to the right edge of the bar, found by x(d.count)
            .attr("y", function (d) {
                // console.log(d)
                return y(d[attr])+10;
            })      // HINT: Add a small offset to the top edge of the bar, found by y(d.artist)
            .style("text-anchor", "start")
            .text(function(d) {
                return parseInt(d.count)
             });           // HINT: Get the count of the artist
        y_axis_text.text(attr);
        new_attr = "Artists"
        if (attr==="song") {
            new_attr = "Songs"
        }
        title.text("Top " + new_attr + " in Billboard 100 Charts");

        // Remove elements not in use if fewer groups in new dataset
        bars.exit().remove();
        counts.exit().remove();
    });
}


function compareForData(a,b) {
    return parseInt(b.count) - parseInt(a.count);
}

/**
 * Cleans the provided data using the given comparator then strips to first numExamples
 * instances
 */
function cleanData(data, comparator, numExamples) {
    // TODO: sort and return the given data with the comparator (extracting the desired number of examples)
    data = data.sort(comparator);
    data = data.slice(0,numExamples);
    return data;
}

// On page load, render the barplot with the artist data
setData(0, "artist");
