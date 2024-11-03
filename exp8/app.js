// Generate sample data
const generateSampleData = () => {
    const coverTypes = [
      'Spruce/Fir', 'Lodgepole Pine', 'Ponderosa Pine',
      'Cottonwood/Willow', 'Aspen', 'Douglas-fir', 'Krummholz'
    ];
  
    const data = [];
    coverTypes.forEach(type => {
      for (let i = 0; i < 100; i++) {
        data.push({
          coverType: type,
          elevation: 2000 + Math.random() * 2000 + (Math.random() - 0.5) * 500,
          slope: Math.max(0, Math.min(60, 20 + (Math.random() - 0.5) * 40)),
          aspect: Math.random() * 360
        });
      }
    });
    return data;
  };
  
  const data = generateSampleData();
  
  // Set up dimensions
  const margin = { top: 40, right: 60, bottom: 80, left: 80 };
  const width = 800 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;
  
  // Create SVG container
  const svg = d3.select('#mainChart')
    .append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .append('g')
    .attr('transform', `translate(<span class="math-inline">\{margin\.left\},</span>{margin.top})`);
  
  // Create tooltip
  const tooltip = d3.select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);
  
  // Function to draw the chart based on selected chart type and features
  function drawChart(chartType, xFeature, yFeature) {
    svg.selectAll('*').remove();
  
    if (chartType === '3d') {
      // 3D Scatter Plot
      const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d[xFeature]))
        .range([0, width])
        .nice();
  
      const y = d3.scaleLinear()
        .domain(d3.extent(data, d => d[yFeature]))
        .range([height, 0])
        .nice();
  
      const z = d3.scaleLinear()
        .domain(d3.extent(data, d => d.aspect))
        .range([2, 10]);
  
      const color = d3.scaleOrdinal()
        .domain(data.map(d => d.coverType))
        .range(d3.schemeSet3);
  
      // Add axes
      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .attr('class', 'axis');
  
      svg.append('g')
        .call(d3.axisLeft(y))
        .attr('class', 'axis');
  
      // Add axis labels
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 10)
        .attr('text-anchor', 'middle')
        .text(xFeature.charAt(0).toUpperCase() + xFeature.slice(1))
        .attr('class', 'axis-label');
  
      svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -margin.left + 20)
        .attr('text-anchor', 'middle')
        .text(yFeature.charAt(0).toUpperCase() + yFeature.slice(1))
        .attr('class', 'axis-label');
  
      // Add points
      svg.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'point')
        .attr('cx', d => x(d[xFeature]))
        .attr('cy', d => y(d[yFeature]))
        .attr('r', d => z(d.aspect))
        .style('fill', d => color(d.coverType))
        .on('mouseover', function (event, d) {
          d3.select(this)
            .style('stroke-width', '2px');
  
          tooltip.transition()
            .duration(200)
            .style('opacity', .9);
  
          tooltip.html(`
            <strong>${d.coverType}</strong><br/>
            ${xFeature}: ${d[xFeature].toFixed(1)}<br/>
            ${yFeature}: ${d[yFeature].toFixed(1)}<br/>
            Aspect: ${d.aspect.toFixed(1)}
          `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function () {
          d3.select(this)
            .style('stroke-width', '0.5px');
  
          tooltip.transition()
            .duration(500)
            .style('opacity', 0);
        });
  
      // Add legend
      const legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${width - 120}, 20)`);
  
      const coverTypes = [...new Set(data.map(d => d.coverType))];
  
      coverTypes.forEach((type, i) => {
        const legendRow = legend.append('g')
          .attr('transform', `translate(0, ${i * 20})`);
  
        legendRow.append('circle')
          .attr('cx', 0)
          .attr('cy', 0)
          .attr('r', 6)
          .style('fill', color(type));
  
        legendRow.append('text')
          .attr('x', 10)
          .attr('y', 4)
          .text(type)
          .attr('class', 'axis-label')
          .style('font-size', '10px');
      });
    } else if (chartType === 'jitter') {
      // Jitter Plot
      const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d[xFeature]))
        .range([0, width])
        .nice();
  
      const y = d3.scaleLinear()
        .domain(d3.extent(data, d => d[yFeature]))
        .range([height, 0])
        .nice();
  
      const color = d3.scaleOrdinal()
        .domain(data.map(d => d.coverType))
        .range(d3.schemeSet3);
  
      // Add jitter
      const jitterWidth = 40;
      const jitteredData = data.map(d => ({
        ...d,
        jitterX: d[xFeature] + (Math.random() - 0.5) * jitterWidth,
        jitterY: d[yFeature] + (Math.random() - 0.5) * jitterWidth
      }));
  
      // Add axes
      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .attr('class', 'axis');
  
      svg.append('g')
        .call(d3.axisLeft(y))
        .attr('class', 'axis');
  
      // Add axis labels
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 10)
        .attr('text-anchor', 'middle')
        .text(xFeature.charAt(0).toUpperCase() + xFeature.slice(1))
        .attr('class', 'axis-label');
  
      svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -margin.left + 20)
        .attr('text-anchor', 'middle')
        .text(yFeature.charAt(0).toUpperCase() + yFeature.slice(1))
        .attr('class', 'axis-label');
  
      // Add points
      svg.selectAll('circle')
        .data(