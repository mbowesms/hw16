// SVG setup
let svgWidth = 960;
let svgHeight = 620;

let margin = {
  top: 20, 
  right: 40, 
  bottom: 200,
  left: 100
};

// Calculate chart height and width
let height = svgHeight - margin.top - margin.bottom;
let width = svgWidth - margin.right - margin.left;

// Append div class to scatter element
let chart = d3.select('#scatter')
  .append('div')
  .classed('chart', true);

// Append SVG element to chart
let svg = chart.append('svg')
  .attr('width', svgWidth)
  .attr('height', svgHeight);

// Append SVG group
let chartGroup = svg.append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

// Initial x and y parameters
let chosenXAxis = 'poverty';
let chosenYAxis = 'healthcare';

// Update x-scale variable upon label click
function xScale(censusData, chosenXAxis) {
    //scales
    let xLinearScale = d3.scaleLinear()
      .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
        d3.max(censusData, d => d[chosenXAxis]) * 1.2])
      .range([0, width]);

    return xLinearScale;
}

// Update y-scale variable upon label click
function yScale(censusData, chosenYAxis) {
  //scales
  let yLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.5,
      d3.max(censusData, d => d[chosenYAxis]) * 1])
    .range([height, 0]);

  return yLinearScale;
}
// Update xAxis on click
function renderXAxis(newXScale, xAxis) {
  let bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(2000)
    .call(bottomAxis);

  return xAxis;
}

// Update yAxis on click
function renderYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1500)
    .call(leftAxis);

  return yAxis;
}

// Update circles with transition
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1500)
      .attr('cx', data => newXScale(data[chosenXAxis]))
      .attr('cy', data => newYScale(data[chosenYAxis]))

    return circlesGroup;
}

// Update STATE labels
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    textGroup.transition()
      .duration(2000)
      .attr('x', d => newXScale(d[chosenXAxis]))
      .attr('y', d => newYScale(d[chosenYAxis]));

    return textGroup
}

// Stylize x-axis tooltip values
function styleX(value, chosenXAxis) {

    // Style based on variable
    // Poverty
    if (chosenXAxis === 'poverty') {
        return `${value}%`;
    }
    // Income
    else if (chosenXAxis === 'income') {
        return `${value}`;
    }
    else {
      return `${value}`;
    }
}

// Update circles
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    // Poverty
    if (chosenXAxis === 'poverty') {
      var xLabel = 'Poverty:';
    }
    // Income
    else if (chosenXAxis === 'income'){
      var xLabel = 'Median Income:';
    }
    // Age
    else {
      var xLabel = 'Age:';
    }

// ylabel
  // Healthcare
  if (chosenYAxis ==='healthcare') {
    var yLabel = "No Healthcare:"
  }
  else if(chosenYAxis === 'obesity') {
    var yLabel = 'Obesity:';
  }
  // Smoking
  else{
    var yLabel = 'Smokers:';
  }

  // Create tooltip
  var toolTip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-8, 0])
    .html(function(d) {
        return (`${d.state}<br>${xLabel} ${styleX(d[chosenXAxis], chosenXAxis)}<br>${yLabel} ${d[chosenYAxis]}%`);
  });

  circlesGroup.call(toolTip);

  // Add
  circlesGroup.on('mouseover', toolTip.show)
    .on('mouseout', toolTip.hide);

    return circlesGroup;
}
// Retrieve data
d3.csv('./assets/data/data.csv').then(function(censusData) {

    console.log(censusData);
    
    // Parse data
    censusData.forEach(function(data){
        data.obesity = +data.obesity;
        data.income = +data.income;
        data.smokes = +data.smokes;
        data.age = +data.age;
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
    });

    // Linear scales 
    var xLinearScale = xScale(censusData, chosenXAxis);
    var yLinearScale = yScale(censusData, chosenYAxis);

    // x-axis
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append x
    var xAxis = chartGroup.append('g')
      .classed('x-axis', true)
      .attr('transform', `translate(0, ${height})`)
      .call(bottomAxis);

    // Append y
    var yAxis = chartGroup.append('g')
      .classed('y-axis', true)
      //.attr
      .call(leftAxis);
    
    // Append circles
    var circlesGroup = chartGroup.selectAll('circle')
      .data(censusData)
      .enter()
      .append('circle')
      .classed('stateCircle', true)
      .attr('cx', d => xLinearScale(d[chosenXAxis]))
      .attr('cy', d => yLinearScale(d[chosenYAxis]))
      .attr('r', 14)
      .attr('opacity', '.6');

    // Initial text
    var textGroup = chartGroup.selectAll('.stateText')
      .data(censusData)
      .enter()
      .append('text')
      .classed('stateText', true)
      .attr('x', d => xLinearScale(d[chosenXAxis]))
      .attr('y', d => yLinearScale(d[chosenYAxis]))
      .attr('dy', 3)
      .attr('font-size', '10px')
      .text(function(d){return d.abbr});

    // xLabels group
    var xLabelsGroup = chartGroup.append('g')
      .attr('transform', `translate(${width / 2}, ${height + 10 + margin.top})`);

    var povertyLabel = xLabelsGroup.append('text')
      .classed('aText', true)
      .classed('active', true)
      .attr('x', 0)
      .attr('y', 20)
      .attr('value', 'poverty')
      .text('In Poverty (%)');
      
    var ageLabel = xLabelsGroup.append('text')
      .classed('aText', true)
      .classed('inactive', true)
      .attr('x', 0)
      .attr('y', 40)
      .attr('value', 'age')
      .text('Age (Median)');  

    var incomeLabel = xLabelsGroup.append('text')
      .classed('aText', true)
      .classed('inactive', true)
      .attr('x', 0)
      .attr('y', 60)
      .attr('value', 'income')
      .text('Household Income (Median)')

    // yLabels group
    var yLabelsGroup = chartGroup.append('g')
      .attr('transform', `translate(${0 - margin.left/4}, ${height/2})`);

    var healthcareLabel = yLabelsGroup.append('text')
      .classed('aText', true)
      .classed('active', true)
      .attr('x', 0)
      .attr('y', 0 - 20)
      .attr('dy', '1em')
      .attr('transform', 'rotate(-90)')
      .attr('value', 'healthcare')
      .text('Without Healthcare (%)');
    
    var smokesLabel = yLabelsGroup.append('text')
      .classed('aText', true)
      .classed('inactive', true)
      .attr('x', 0)
      .attr('y', 0 - 40)
      .attr('dy', '1em')
      .attr('transform', 'rotate(-90)')
      .attr('value', 'smokes')
      .text('Smoker (%)');
    
    var obesityLabel = yLabelsGroup.append('text')
      .classed('aText', true)
      .classed('inactive', true)
      .attr('x', 0)
      .attr('y', 0 - 60)
      .attr('dy', '1em')
      .attr('transform', 'rotate(-90)')
      .attr('value', 'obesity')
      .text('Obese (%)');
    
    // Update tooltip
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x-axis event listener
    xLabelsGroup.selectAll('text')
      .on('click', function() {
        var value = d3.select(this).attr('value');

        if (value != chosenXAxis) {

          // Replace chosenX with value
          chosenXAxis = value; 

          // Update x for new data
          xLinearScale = xScale(censusData, chosenXAxis);

          // Update x
          xAxis = renderXAxis(xLinearScale, xAxis);

          // Update circles with new value 
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

          // Update text
          textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

          // Update tooltip
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

          // Text classes
          if (chosenXAxis === 'poverty') {
            povertyLabel.classed('active', true).classed('inactive', false);
            ageLabel.classed('active', false).classed('inactive', true);
            incomeLabel.classed('active', false).classed('inactive', true);
          }
          else if (chosenXAxis === 'age') {
            povertyLabel.classed('active', false).classed('inactive', true);
            ageLabel.classed('active', true).classed('inactive', false);
            incomeLabel.classed('active', false).classed('inactive', true);
          }
          else {
            povertyLabel.classed('active', false).classed('inactive', true);
            ageLabel.classed('active', false).classed('inactive', true);
            incomeLabel.classed('active', true).classed('inactive', false);
          }
        }
      });
      
    // y-axis lables event listener
    yLabelsGroup.selectAll('text')
      .on('click', function() {
        var value = d3.select(this).attr('value');

        if(value !=chosenYAxis) {
            chosenYAxis = value;
            yLinearScale = yScale(censusData, chosenYAxis);
            yAxis = renderYAxis(yLinearScale, yAxis);
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
            textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
            if (chosenYAxis === 'obesity') {
              obesityLabel.classed('active', true).classed('inactive', false);
              smokesLabel.classed('active', false).classed('inactive', true);
              healthcareLabel.classed('active', false).classed('inactive', true);
            }
            else if (chosenYAxis === 'smokes') {
              obesityLabel.classed('active', false).classed('inactive', true);
              smokesLabel.classed('active', true).classed('inactive', false);
              healthcareLabel.classed('active', false).classed('inactive', true);
            }
            else {
              obesityLabel.classed('active', false).classed('inactive', true);
              smokesLabel.classed('active', false).classed('inactive', true);
              healthcareLabel.classed('active', true).classed('inactive', false);
            }
          }
        });
});
