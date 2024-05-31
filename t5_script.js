// Set dimensions and margins for the graph
const margin = { top: 50, right: 30, bottom: 50, left: 150 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// Append the svg object to the body of the page
const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Data set URI
const temperature_csvUrl = 'https://raw.githubusercontent.com/Cropdata5320/CropData_Visualizations/main/temperature.csv';
const rainfall_csvurl = 'https://raw.githubusercontent.com/Cropdata5320/CropData_Visualizations/main/rainfall.csv'

// Read the data
d3.csv(temperature_csvUrl).then(tempData => {
    // Format your temperature data here
    tempData.forEach(d => {
        d.YEAR = +d.YEAR;
        d.ANNUAL = +d.ANNUAL;
    });

    d3.csv(rainfall_csvurl).then(rainData => {
        // Format your temperature data here
        rainData.forEach(d => {
            d.YEAR = +d.YEAR;
            d.ANN = +d.ANN;
        });

        // Combine the temperature and rainfall data
        const combinedData = tempData.map(td => {
            const rd = rainData.find(rd => rd.YEAR === td.YEAR);
            return {
            YEAR: td.YEAR,
            ANNUAL: td.ANNUAL,
            ANN: rd ? rd.ANN : null
            };
        });

        // X axis
        const x = d3.scaleBand()
            .range([0, width])
            .domain(combinedData.map(d => d.YEAR))
            .padding(0.2);
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x).tickFormat(d3.format("d")))
            .selectAll("text")
                .attr("class", "axis-label")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-65)");

        // Y axis
        const yTemp = d3.scaleLinear()
            .domain([0, d3.max(combinedData, d => d.ANNUAL)])
            .range([height, 0]);
        svg.append("g")
            .attr("class", "y-axis-temp")
            .call(d3.axisLeft(yTemp));

        const yRainfall = d3.scaleLinear()
            .domain([0, d3.max(combinedData, d => d.ANN)])
            .range([height, 0]);
        svg.append("g")
            .attr("class", "y-axis-rain")
            .attr("transform", `translate(${width}, 0)`)
            .call(d3.axisLeft(yRainfall));

        // Line for temperature
        svg.append("path")
            .datum(combinedData)
            .attr("class", "temp-line")
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(d => x(d.YEAR))
                .y(d => yTemp(d.ANNUAL))
            );

        // Line for rainfall
        svg.append("path")
            .datum(combinedData)
            .attr("class", "rain-line")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(d => x(d.YEAR))
                .y(d => yRainfall(d.ANN))
            );

        // Title
        svg.append("text")
            .attr("class", "title")
            .attr("x", width / 2)
            .attr("y", 0 - (margin.top / 2))
            .attr("text-anchor", "middle")
            .text("Task 5 - Annual Temperature & Rainfall Trends Over Time");

        // Tooltip
        const tooltip = d3.select("#chart")
            .append("div")
            .attr("class", "tooltip");

        svg.selectAll(".temp-dot")
            .data(combinedData)
            .enter().append("circle")
            .attr("class", "temp-dot")
            .attr("cx", d => x(d.YEAR))
            .attr("cy", d => yTemp(d.ANNUAL))
            .attr("r", 3)
            .attr("fill", "green")
            .on("mouseover", (event, d) => {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`Year: ${d.YEAR}<br>Temperature: ${d.ANNUAL}°C`)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", d => {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        svg.selectAll(".rain-dot")
            .data(combinedData)
            .enter().append("circle")
            .attr("class", "rain-dot")
            .attr("cx", d => x(d.YEAR))
            .attr("cy", d => yRainfall(d.ANN))
            .attr("r", 3)
            .attr("fill", "green")
            .on("mouseover", (event, d) => {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`Year: ${d.YEAR}<br>Rainfall: ${d.ANN}mm`)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", d => {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // Add legend
        const legend = svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 12)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(["Temperature", "Rainfall"])
            .enter().append("g")
            .attr("transform", (d, i) => `translate(-10,${20 + i * 20})`);

        legend.append("rect")
            .attr("x", -36)
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", d => d === "Temperature" ? "#ff6347" : "#4682b4");

        legend.append("text")
            .attr("x", -45)
            .attr("y", 6)
            .attr("dy", "0.32em")
            .text(d => d);

    });
});
