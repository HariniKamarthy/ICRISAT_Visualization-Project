// Function to draw a pie chart given an SVG container and data
function drawPieChart(svgId, data, valueKey, colorScheme, titleText) {
    // Filter out the necessary column for the pie chart
    let pieData = data.map(function(d) {
      return { state: d['State Name'], value: +d[valueKey] };
    });

    // Set the dimensions and radius of the pie chart
    const width = 450, height = 450, radius = Math.min(width, height) / 2;

    // Create tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip");

    // Append SVG object to the specified div container
    const svg = d3.select("#" + svgId)
      .append("svg")
        .attr("width", width)
        .attr("height", height + 50)
      .append("g")
        .attr("transform", "translate(" + width / 2 + "," + (height / 2 + 50) + ")");

    // Generate the pie
    const pie = d3.pie().value(function(d) { return d.value; });

    // Generate the arcs
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    // Assign colors to each arc
    const color = d3.scaleOrdinal(colorScheme);

    // Title
    svg.append("text")
        .attr("x", 0)             
        .attr("y", -radius/2 - 120)
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .text(titleText);

    // Build the pie chart
    svg.selectAll('path')
      .data(pie(pieData))
      .enter()
      .append('path')
        .attr('d', arc)
        .attr('fill', function(d) { return color(d.data.state); })
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.7)
        .on("mouseover", function(event, d) {
            tooltip.transition()
              .duration(200)
              .style("opacity", .9);
            tooltip.html(d.data.state + "<br/>" + valueKey + ": " + d.data.value)
              .style("left", (event.pageX) + "px")
              .style("top", (event.pageY - 28) + "px");
          })
          .on("mouseout", function(d) {
            tooltip.transition()
              .duration(500)
              .style("opacity", 0);
          });

    // Add labels to each slice
    svg.selectAll('text')
      .data(pie(pieData))
      .enter()
      .append('text')
        .text(function(d) { return d.data.state; })
        .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
        .style("text-anchor", "middle")
        .style("font-size", 10);
  }

  // Legend dimensions
  const legendWidth = 150;
  const legendHeight = 300;

  // Colors
  const colorScheme = d3.schemeSet2;
  const color = d3.scaleOrdinal(colorScheme);

  // Legend
  const legendSvg = d3.select("#legend")
  .append("svg")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
  .append("g");

  // Load the CSV data
  const pie_t7_data = 'https://raw.githubusercontent.com/Cropdata5320/CropData_Visualizations/main/Task7_ProcessedData.csv'
  d3.csv(pie_t7_data).then(function(data) {
    // Get unique state names for the legend
    let uniqueStates = Array.from(new Set(data.map(d => d['State Name'])));
    const legendItemHeight = 20;
    const legendHeight = uniqueStates.length * legendItemHeight; // Calculate required height

    // Set the SVG height dynamically to fit all legend items
    const legendSvg = d3.select("#legend")
        .append("svg")
            .attr("width", legendWidth)
            .attr("height", legendHeight) // Set based on the number of legend items
        .append("g");

    // Set the height of the legend container dynamically
    d3.select(".legend-container")
        .style("height", legendHeight + "px");

    // Add legend entries
    legendSvg.selectAll("g")
      .data(uniqueStates)
      .enter().append("g")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; })
      .append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legendSvg.selectAll("g")
      .append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(function(d) { return d; });

    // Draw the pie charts for each value
    drawPieChart("areaChart", data, 'RICE AREA (1000 ha)', colorScheme, "Distribution of RICE AREA (1000 ha) across States" );
    drawPieChart("productionChart", data, 'RICE PRODUCTION (1000 tons)', colorScheme, "Distribution of RICE PRODUCTION (1000 tons) across States");
    drawPieChart("yieldChart", data, 'RICE YIELD (Kg per ha)', colorScheme, "Distribution of RICE YIELD (Kg per ha) across States");
  });