// The making of a heat map 

let url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
let req =  new XMLHttpRequest()

let values = []     // to be filled by import data from request
let xScales         //for x-axis and placing elements on horizontal canvas
let yScales         // for y-axis and placing donts on left canvas

//Dimensions
let width = 1200
let height = 625
let padding = 60

let colors = ['Blue', 'SteelBlue', 'aqua', 'beige', '#fee090', 'gold', 'orange', 'red']
let varianceValues = ['-3', '-2', '-1', '0', '1', '2', '3', '4']
let baseTemp


let drawCanvas = ( ) => {                       //encompassing canvas
    let canvas = d3.select('#canvas')
                    .attr('width', width)
                    .attr('height', height)                    
}

let svg = d3.select('svg');
let tooltip = d3.select('#tooltip');

let generateScales = () => {    //generate x and y scales set to linear & time

    xScales = d3.scaleLinear()
              .domain([d3.min(values, (item) => {
                return item['year']
              }) -1, d3.max(values, (item) => {
                return item['year']
              }) +1]) 
              .range([padding, width - padding])
              
  
    /*let datesArray = values.map((item) => {

        return new Date(item[0])
    })*/

  yScales = d3.scaleBand()
              .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])              
              .range([height - padding, padding])
}



let drawCells = () => {
    svg.selectAll('rect')
      .data(values)
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('data-year', (item) => {
        return item['year']            
      })
      .attr('data-month', (item) => {
         return new Date(item['month']) -1
      })
      .attr('data-temp',(item) => {
        return baseTemp + item['variance']
      })      
      .attr('x', (item) => {
        return xScales(item['year'])
      })
      .attr('height', ((height - 2 * padding) / 12))
      .attr('width', ((width - 2 * padding)/255))
      .attr('y', (item) => {
        return yScales(item['month'] -1)
      })
      .style('fill', (item) => {

        let variance = item['variance']

        if(variance <= varianceValues){
          return colors[0]
        }else if(variance <= -2){
          return colors[1]
        }else if(variance <= -1){
            return colors[2]
        }else if(variance <= 0){
          return colors[3]
        }else if(variance <= 1){
          return colors[4]
        }else if(variance <= 2){
          return colors[5]
        }else if(variance <= 3){
          return colors[6]
        }else{
          return colors[7]
        }
        
      })
      .on('mouseover', (item) => {
        
        tooltip.transition()
                .style('visibility', 'visible')
        
        let monthNames = [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December'
        ]
        tooltip.attr('data-year', item['year'])
        tooltip.text(`${item['year']} - ${monthNames[item['month'] - 1]} 
                  \n ${item['variance'] + baseTemp} \n ${item['variance']}`)        
        
      }) 
      .on('mouseout', (item)  => {
        tooltip.style('visibility', 'hidden');
      });
}

let generateAxes = () => {

    let xAxis = d3.axisBottom(xScales)
                .tickFormat(d3.format('d'))
    let yAxis = d3.axisLeft(yScales)
                .tickValues(yScales.domain())
                .tickFormat((month) => {
                  let date = new Date(0)
                  date.setUTCMonth(month)
                  let format = d3.utcFormat('%B')
                  return format(date)
                })
                .tickSize(10, 1)
                

  //draw the x-axis
    svg.append('g')
        .call(xAxis)
        .attr('id', 'x-axis')
        .attr('transform', `translate(0,${height - padding})`);

  svg.append('text')
      .attr('class', 'label')
      .attr('transform', `translate(0,${height - padding * 0.5 -10})`)
      .attr('y', 10)
      .attr('x', width/2)
      .style('text-anchor', 'end')
      .text('---Years---');

  //draw the y-axis
  svg.append('g')
    .call(yAxis)
    .attr('id', 'y-axis')
    .attr('transform', 'translate(' + padding + ', 0)');

  svg.append('text')
    .attr('class', 'label')
    .attr('transform', 'rotate(-90)')
    .attr('y', 6)
    .attr('x', -300)
    .attr('dy', '.71em')
    .style('text-anchor', 'end')
    .text('Months');
}

//Handle all Titles in one function
let descriptions = ( ) => {
    d3.select('body')
      .select('svg')
      .append('text')
      .attr('id', 'title')
      .attr('x', width / 4)
      .attr('y', padding - 25)
      .attr('text-anchor', 'midlle')
      .style('font-size', '30px')
      .text('Monthly Global Land-Surface Temperature')
  
    // subtitle
    d3.select('body')
      .select('svg')
      .append('text')
      .attr('id', 'description')
      .attr('x', width / 2)
      .attr('y', padding - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '20px')
      .text('1753 - 2015: base temperature 8.66℃')
  
}

let createLegend = ( ) => {

  let legendContainer  = svg.append('g').attr('id', 'legend');
  let legend = legendContainer
              .selectAll('#legend')
              .data(colors)
              .enter()
              .append('g')
              .attr('class', 'legend-label')
              .attr('transform', function (d, i) {
                return 'translate(0,' + (height - 20) + ')';
              });

  for(let i = 0 ; i <= colors.length -1; i++){

      legend.append('rect')      
            .attr('width', 15)
            .attr('height', 15)
            .style('fill', colors[i])
            .attr('x', width/2 - 100 - (padding - 30*i)) 
                
            .append('text')
            .attr('x', width/2 - 100 - (padding - 30*i))
            .attr('y', height - 20)
            .attr('dy', '.13em')
            .style('color', 'black')                        
            .text(varianceValues[i])

  }
}


//Request data from url   
req.open('GET', url, true)
req.onload = () => {
    let object = JSON.parse(req.responseText)
    baseTemp = object['baseTemperature']
    values = object['monthlyVariance']
    console.log(baseTemp)
    console.log(values)
    
    drawCanvas()
    descriptions()
    generateScales()
    drawCells()
    generateAxes()
    createLegend()
    
}
req.send()