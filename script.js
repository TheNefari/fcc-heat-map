const req = new XMLHttpRequest();
req.open("GET", "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json", true);
req.send();
req.onload = function(){
const json = JSON.parse(req.responseText);
  drawHeatMap(json)
}

function drawHeatMap(json){
  const data=json["monthlyVariance"];
  var w=800;
  var h=400;
  const padding=60;
  const svg = d3.select("body")
  .append("svg")
  .attr("height",h)
  .attr("width",w);
  
  var parseTimeMonths = d3.timeParse("%m");
  var parseTimeYears = d3.timeParse("%Y");
  
  const xTimeMin=d3.min(data,(d)=>parseTimeYears(d["year"]));
  const xTimeMax=d3.max(data,(d)=>parseTimeYears(d["year"]));
  const yTimeMax=parseTimeMonths(d3.max(data,(d)=>d["month"]));
  const yTimeMin=parseTimeMonths(d3.min(data,(d)=>d["month"]));
  
  const xScale=d3.scaleTime()
  .domain([xTimeMin,xTimeMax])
  .range([padding,w-padding]);
  const yScale=d3.scaleLinear()
  //.domain([yTimeMin, yTimeMax])
  .domain([0.5, 12.5])
  .range([padding,h-(1.40*padding)]);
  
  
  const fillColor=function(temp){
    const mTemp = json["baseTemperature"]+temp;
    if(mTemp>10){
      return("darkred");
    }else if(mTemp>9){
      return("red");
    }else if(mTemp>8){
      return("darkorange");
    }else if(mTemp>7){
      return("orange");
    }else if(mTemp>6){
      return("yellow");
    }else if(mTemp>5){
      return("lightyellow");
    }else if(mTemp>4){
      return("lightblue");
    }else if(mTemp>3){
      return("cyan");
    }else if(mTemp>2){
      return("blue");
    }else if(mTemp>1){
      return("darkblue");
    }
  }
  
  const rects = svg.selectAll("rect")
  .data(data)
  .enter()
  .append("rect")
  .attr("x",(d)=>xScale(parseTimeYears(d["year"])))
  .attr("y",(d)=>yScale((d["month"])))
  .attr("class","cell")
  .attr("data-month",(d)=>d["month"]-1)
  .attr("data-year",(d)=>d["year"])
  .attr("data-temp",(d)=>d["variance"])
  .style("width","3px")
  .style("height",(h-2.5*padding)/12+"px")
  .style("fill",(d)=>fillColor(d["variance"]))
  .on("mouseover", handleMouseOver)
  .on("mouseout", handleMouseOut);
  
  var formatMonths = d3.timeFormat("%B");
  
  var yAxis = svg.append("g")
  .attr("transform", "translate("+padding+","+0.15*padding+")")
  .attr("id","y-axis")
  .call(d3
    .axisLeft(yScale)
    .tickSizeOuter(0)
    .tickFormat((x)=>formatMonths(parseTimeMonths(x))));
  var xAxis = svg.append("g")
  .attr("transform", "translate(0,"+(h-1.25*padding)+")")
  .attr("id","x-axis")
  .call(d3
    .axisBottom(xScale)
    .tickSizeOuter(1)
    .tickFormat(d3.timeFormat("%Y")));
  
  d3.select("body")
    .append("div")
    .attr("id","tooltip")
    .style("visibility","hidden")
    .style("position","absolute")
    .style("border-radius","2px")
    .style("border","1px solid black")
    .style("padding","10px");
  
   svg.append("g").attr("id","legend");
 for(let i=-6;i<3;i++){
  d3.select("#legend").append("text")
    .attr("transform", "translate("+((w/2+19.5*i)+2)+","+(0.8*padding)+")")
    .text(i+8);
    d3.select("#legend").append("rect")
      .attr("transform", "translate("+(w/2+20*i)+","+(0.9*padding)+")")
      .attr("fill",fillColor(i))    .style("width","20px").style("height","10px");
}
  
   function handleMouseOver(d,i){
    d3.select("#tooltip")
      .attr("data-year",(d["year"]))
      .style("visibility","visible")
      //.style("background-color",(d["Doping"]=="")?"cyan":"orange")
      .style("left",event.pageX+0+"px")
      .style("top",event.pageY-45+"px")
     .style("background-color",fillColor(d["variance"]))
      .html(formatMonths(parseTimeMonths(d["month"]))+" "+d["year"]+"<br>"+(json["baseTemperature"]+d["variance"]).toFixed(2));
  }
  function handleMouseOut(){
    d3.select("#tooltip").style("visibility","hidden");
  }
}