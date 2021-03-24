(function() {
    // TODO: Set up SVG object with width, height and margin
    let svg = d3.select("#scatterplot")      // HINT: div id for div containing scatterplot
        .append("svg")
        .attr("width", width)     // HINT: width
        .attr("height", height)     // HINT: height
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);    // HINT: transform

    // Set up reference to tooltip
    let tooltip = d3.select("#scatterplot")     // HINT: div id for div containing scatterplot
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    /*
        Create tooltip as a div right underneath the SVG scatter plot.
        Initially tooltip is invisible (opacity 0). We add the tooltip class for styling.
     */



    // TODO: Load the billboard CSV file into D3 by using the d3.csv() method
    d3.csv("../data/billboard.csv").then(function(data) {
        let artist = "Maroon 5";
        // TODO: Filter the data for songs of a given artist (hard code artist name here)
        data = filterData(data, artist);

        // TODO: Nest the data into groups, where a group is a given song by the artist
        let nestedData = d3.nest()
            .key(function(d) { return d.song })
            .entries(data);
        /*
            HINT: The key() function is used to join the data. We want to override the default key
            function to use the artist song. This should take the form of an anonymous function
            that returns the song corresponding to a given data point.
         */

        // TODO: Get a list containing the min and max years in the filtered dataset
        let extent = d3.extent(data, function(d) { return Date.parse(d.date); });
        /*
            HINT: Here we introduce the d3.extent, which can be used to return the min and
            max of a dataset.

            We want to use an anonymous function that will return a parsed JavaScript date (since
            our x-axis is time). Try using Date.parse() for this.
         */

        // TODO: Create a time scale for the x axis
        let x = d3.scaleTime()
            .domain(extent)
            .range([0, width - margin.left - margin.right]);

        // TODO: Add x-axis label
        svg.append("g")
            .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`)       // HINT: Position this at the bottom of the graph. Make the x shift 0 and the y shift the height (adjusting for the margin)
            .call(d3.axisBottom(x));
        // HINT: Use the d3.axisBottom() to create your axis


        // TODO: Create a linear scale for the y axis
        let y = d3.scaleLinear()
            .domain([0, d3.max(data, function(d) { return d.position; })])
            .range([0, height - margin.top - margin.bottom]);
        /*
            HINT: The domain should be an interval from 0 to the highest position a song has been on the Billboard
            The range should be the same as previous examples.
         */

        // TODO: Add y-axis label
        svg.append("g")
            .call(d3.axisLeft(y));

        // Create a list of the groups in the nested data (representing songs) in the same order
        let groups = nestedData.map(function(d) { return d.key });

        // OPTIONAL: Adding color
        let color = d3.scaleOrdinal()
            .domain(groups)
            .range(d3.quantize(d3.interpolateHcl("#66a0e2", "#ff5c7a"), groups.length));

        // Mouseover function to display the tooltip on hover
        let mouseover = function(d) {
            let color_span = `<span style="color: ${color(d.song)};">`;
            let html = `${d.artist}<br/>
                    ${color_span}${d.song}</span><br/>
                    Position: ${color_span}${d.position}</span>`;       // HINT: Display the song here

            // Show the tooltip and set the position relative to the event X and Y location
            tooltip.html(html)
                .style("left", `${(d3.event.pageX) - 220}px`)
                .style("top", `${(d3.event.pageY) - 30}px`)
                .style("box-shadow", `2px 2px 5px ${color(d.song)}`)    // OPTIONAL for students
                .transition()
                .duration(200)
                .style("opacity", 0.9)
        };

        // Mouseout function to hide the tool on exit
        let mouseout = function(d) {
            // Set opacity back to 0 to hide
            tooltip.transition()
                .duration(200)
                .style("opacity", 0);
        };

        // Creates a reference to all the scatterplot dots
        let dots = svg.selectAll("dot").data(data);

        // TODO: Render the dot elements on the DOM
        dots.enter()
            .append("circle")
            .attr("cx", function (d) { return x(Date.parse(d.date)); })      // HINT: Get x position by parsing the data point's date field
            .attr("cy", function (d) { return y(d.position); })      // HINT: Get y position with the data point's position field
            .attr("r", 4)       // HINT: Define your own radius here
            .style("fill",  function(d){ return color(d.song); })
            .on("mouseover", mouseover) // HINT: Pass in the mouseover and mouseout functions here
            .on("mouseout", mouseout);

        // Add x-axis label
        svg.append("text")
            .attr("transform", `translate(${(width - margin.left - margin.right) / 2},
                                        ${(height - margin.top - margin.bottom) + 30})`)       // HINT: Place this at the bottom middle edge of the graph
            .style("text-anchor", "middle")
            .text("Count");

        // Add y-axis label
        svg.append("text")
            .attr("transform", `translate(-80, ${(height - margin.top - margin.bottom) / 2})`)       // HINT: Place this at the center left edge of the graph
            .style("text-anchor", "middle")
            .text("Position");

        // Add chart title
        svg.append("text")
            .attr("transform", `translate(${(width - margin.left - margin.right) / 2}, ${-20})`)       // HINT: Place this at the top middle edge of the graph
            .style("text-anchor", "middle")
            .style("font-size", 15)
            .text(`${artist} (2010-2019)`);
    });



    /**
     * Filters the given data to only include songs by the given artist
     */
    function filterData(data, artist) {
        return data.filter(function(a) { return a.artist === (artist); });
    }
})();