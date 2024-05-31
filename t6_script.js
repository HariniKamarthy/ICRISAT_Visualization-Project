// Set the dimensions and margins of the graph
const margin = { top: 80, right: 400, bottom: 40, left: 75 },
    width = 1000 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

// Append the svg object to the body of the page
const svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Data set URI
const cy_weather_price_csvUrl = 'https://raw.githubusercontent.com/Cropdata5320/CropData_Visualizations/main/Task6_ProcessedData.csv'

// Read the data
d3.csv(cy_weather_price_csvUrl).then((data) => {

    // Filter data to only include the first year
    let yearData = data.filter(d => d.Year == "1994");

    // Add X axis
    const x = d3.scaleLinear()
        .domain([0, d3.max(yearData, d => +d.yield)])
        .range([0, width]);
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    // Append X axis label
    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .text("Yield");

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([0, d3.max(yearData, d => +d.Avg_Annual_Rainfall)])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Append Y axis label
    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "middle")
        .attr("x", - height / 2)
        .attr("y", -50)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("Avg Annual Rainfall");

    // Add a scale for bubble size
    const z = d3.scaleLinear()
        .domain([0, d3.max(yearData, d => +d.average_price)])
        .range([2, 30]);

    // Add a scale for bubble color
    const myColor = d3.scaleOrdinal()
        .domain([...new Set(yearData.map(d => d.State_Name))])
        .range(d3.schemePaired);

    // Add bubbles
    svg.append('g')
        .selectAll("dot")
        .data(yearData)
        .enter()
        .append("circle")
          .attr("cx", d => x(d.yield))
          .attr("cy", d => y(d.Avg_Annual_Rainfall))
          .attr("r", d => z(d.average_price))
          .style("fill", d => myColor(d.State_Name))
          .style("opacity", "0.7")
          .attr("stroke", "black");

    // Append the slider
    const slider = d3.select("#my_dataviz").append("input")
        .attr("type", "range")
        .attr("min", "1994")
        .attr("max", "2017")
        .attr("step", "1")
        .attr("value", "1994")
        .attr("id", "yearSlider");

    // Create a label for the slider
    const sliderLabel = d3.select("#my_dataviz").append("div")
        .attr("id", "sliderValue")
        .text("1994");
    
    // Update function for the slider
    slider.on("input", function() {
        const year = this.value;
        sliderLabel.text(year); // Update the slider label
        updateChart(year);
    });

    // Title
    svg.append("text")
        .attr("class", "title")
        .attr("x", width / 2)
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .text("Correlation between Crop Yield, Rainfall, Price - Different Regions/Years");

    // Create a tooltip
    const tooltip = d3.select("#my_dataviz").append("div")
        .attr("class", "tooltip")

    // Add a legend
    const legend = svg.selectAll(".legend")
        .data(myColor.domain())
        .enter().append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => "translate(0," + i * 20 + ")");

    legend.append("circle")
        .attr("cx", width + 40)
        .attr("cy", -20)
        .attr("r", 7)
        .style("fill", myColor);

    legend.append("text")
        .attr("x", width + 55)
        .attr("y", -20)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(d => d);

    // Function to update the chart
    function updateChart(year) {

        // Filter the data to the year that was selected
        yearData = data.filter(d => d.Year == year);

        // Update the slider text to show the current year
        d3.select("#sliderValue").text(year);

        // Update the X axis
        x.domain([0, d3.max(yearData, d => +d.yield)]);
        svg.selectAll("g .x.axis").transition()
            .duration(1000)
            .call(d3.axisBottom(x));

        // Update the Y axis
        y.domain([0, d3.max(yearData, d => +d.Avg_Annual_Rainfall)]);
        svg.selectAll("g .y.axis").transition()
            .duration(1000)
            .call(d3.axisLeft(y));

        // Update the bubble size scale
        z.domain([0, d3.max(yearData, d => +d.average_price)]);

        // Update the bubbles
        const bubbles = svg.selectAll("circle")
            .data(yearData, d => d.ID);
        
        // Enter new bubbles
        bubbles.enter()
        .append("circle")
        .attr("class", "bubble")
        .merge(bubbles) // Enter + Update
        .transition()
        .duration(1000)
            .attr("cx", d => x(d.yield))
            .attr("cy", d => y(d.Avg_Annual_Rainfall))
            .attr("r", d => z(d.average_price))
            .style("fill", d => myColor(d.State_Name))
            .attr("stroke", "black");
        
        bubbles.exit().remove();

        // Update the tooltip
        svg.selectAll("circle")
            .on("mouseover", function(event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html("State: " + d.State_Name + "<br/>Year: " + d.Year + "<br/>Yield: " + d.yield + "<br/>Rainfall: " + d.Avg_Annual_Rainfall + "<br/>Price: " + d.average_price)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    }
});
