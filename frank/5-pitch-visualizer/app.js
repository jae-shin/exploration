$(document).ready(function() {

  // Goal: create a dynamically scaling graph that
  // creates rectangles with y-position equal to the 
  // note integer and x-width scaled to the number of
  // total notes that are being graphed

  // Create SVG element
  var svgWidth = 1000;
  var svgHeight = 500;

  var graph = d3.select('#visualizer').append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight + 100);

  // Web Audio setup and pitch detection variables
  // are in pitchDetector.js
  // NOTE: avgNoteArray, which is used by the visualizer,
  // is defined and updated in pitchDetector.js

  // Loading local music as an ArrayBuffer, 
  // which can be decoded by Web Audio
  var onFileChange = function(callback, event) {
    var reader = new FileReader();
    // console.log(event.target.files);
    reader.readAsArrayBuffer(event.target.files[0]);

    reader.onload = function(e) {
      // console.log(e.target.result);
      callback(e.target.result);
    };
  };

  var updatePitchIntervalID = null;
  var getAvgNoteIntervalID = null;
  var updateGraphIntervalID = null; 

  var playSong = function(audioData) {
    
    audioContext.decodeAudioData(audioData, function(arrayBuffer) {
      var source = audioContext.createBufferSource();
      source.buffer = arrayBuffer;

      source.connect(analyser);
      analyser.connect(audioContext.destination);

      source.start();

      source.onended = function() {
        console.log('Song has stopped');

        clearInterval( updatePitchIntervalID );
        clearInterval( getAvgNoteIntervalID );
        clearInterval( updateGraphIntervalID ); 
      };
    });
  };

  $('#fileInput').change(function(event) {
    onFileChange(playSong, event);
    startGraph();
  });

  // Creates a random integer 1-12 every second and 
  // pushes it into avgNoteArray. Each note needs an
  // id so that D3 can persistently bind a DOM element
  // to each note
  var generateNote = function() {
    var note = {
      id: avgNoteArray.length,
      value: Math.floor(Math.random() * 12) + 1
    };

    avgNoteArray.push(note);
  };

  // Use D3 to graph avgNoteArray
  // Should scale dynamically
  var updateGraph = function() {
    
    // Redefine the scale functions so that 
    // the graph will scale dynamically (hopefully!)
    var xScale = d3.scaleLinear()
      .domain([0, avgNoteArray.length])
      .range([0, svgWidth]);

    var yScale = d3.scaleLinear()
      .domain([0, 150])
      .range([svgHeight, 0]);
      // .range([0, svgHeight]);

    // Bind each note object in avgNoteArray
    // to a rect svg element
    var notes = graph.selectAll('rect')
      .data(avgNoteArray);

    // D3 General Update Pattern

    // ENTER
    notes.enter()
      .append('rect')
      .attr('x', function(d) {
        return xScale(d.id);
      })
      .attr('y', function(d) {
        return yScale(d.value);
      })
      .attr('width', svgWidth / avgNoteArray.length)
      .attr('height', 10)
      .attr('fill', 'red');

    // UPDATE
    notes
      .transition()
      .ease(d3.easeSin)
      .attr('x', function(d) {
        return xScale(d.id);
      })
      .attr('y', function(d) {
        return yScale(d.value);
      })
      .attr('width', svgWidth / avgNoteArray.length)
      .attr('height', 10)
      .attr('fill', 'blue');   
  };

  // Generates a random note every second
  // and graphs it
  var startGraph = function() {
    
    // Calculate the note 60 times a second
    // and push each note into the noteArray
    updatePitchIntervalID = setInterval(updatePitch, setIntervalTimeRate);

    // Calculate the per-second average note
    // and graph that note
    getAvgNoteIntervalID = setInterval(getAvgNote, 1000);
    updateGraphIntervalID = setInterval(updateGraph, 1000);
  };

});
