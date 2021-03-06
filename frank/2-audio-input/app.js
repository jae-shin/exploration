$('.document').ready(function() {
  // Chrome won't execute getUserMedia unless the 
  // site is served over a https address.
  // Chrome, however, treats localhost as a secure 
  // connection. So, use live-server to host the 
  // site on localhost when testing it out.
  // Launch by executing shell command 'live-server'
  // WITHOUT the index.html
  var audioContext = new (window.AudioContext || window.webkitAudioContext)();
  var analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  var bufferLength = analyser.frequencyBinCount;
  var dataArray = new Uint8Array(bufferLength);

  var getUserAudio = function() {
    // The user will be prompted whether he will permit the browser
    // to record the audio. If given permission, this script will
    // create a MediaStream object from user input. 
    // The script then connects the audio source to the analyser
    // node. Visualization is then run on ten times a second.
    // NOTE that the source is not connected to any destination.
    // This is allowed by Web Audio, and it just means that 
    // the user audio won't be played back.

    // Web Audio once used navigator.getUserMedia to access user's 
    // camera and microphone. This method has been deprecated.
    // Navigator.mediaDevices.getUserMedia is the newer standard 
    // and works on the latest Chrome builds. But sometimes Chrome
    // won't recognize navigator.mediaDevices.getUserMedia as an 
    // available function. We have to use navigator.webkitGetUserMedia
    // instead in those cases.

    if (navigator.mediaDevices.getUserMedia) {

      navigator.mediaDevices.getUserMedia({audio:true})
        .then(function(mediaStream) {
          console.log('Getting user audio via mediaDevices.getUserMedia');
          var source = audioContext.createMediaStreamSource(mediaStream);

          source.connect(analyser);

          setInterval(updateGraph.bind(this, dataArray), 100);
        });

    } else if (navigator.webkitGetUserMedia) {

      navigator.webkitGetUserMedia({audio:true}, function(mediaStream) {
          console.log('Getting user audio via webkitGetUserMedia');
          var source = audioContext.createMediaStreamSource(mediaStream);

          source.connect(analyser);

          setInterval(updateGraph.bind(this, dataArray), 100);
        }, function(error) { console.log(error); });
      
    } else {

      alert('This browser does not support user audio input');

    }
  };

  /*
    VISUALIZATION

    This is the same code that's used in the first audio exploration snippet.
  */

  var xScale = d3.scaleLinear()
    .domain([0, 128])
    .range([0, 500]);
  var yScale = d3.scaleLinear()
    .domain([0, 128])
    .range([0, 500]);

  var graph = d3.select('.visualizer').append('svg')
    .attr('width', 500)
    .attr('height', 500);

  var updateGraph = function(dataArray) {
    analyser.getByteTimeDomainData(dataArray);
    // console.log(dataArray);
    var dots = graph.selectAll('circle')
      .data(dataArray);

    dots.enter()
      .append('circle')
        .attr('cx', function(d, i) {
          return xScale(i);
        })
        .attr('cy', function(d) {
          return d / 2; // Change this to alter the height of y-axis
        })
        .attr('r', 2)
        .attr('fill', 'lavender');

    dots
      .interrupt()
      .transition()
      .duration(100)
      .ease(d3.easeSin)
      .attr('cx', function(d, i) {
        return xScale(i);
      })
      .attr('cy', function(d) {
        return d / 2; // Change Change this to alter the height of y-axis 
      })
      .attr('r', 2)
      .attr('fill', 'lavender');

    dots.exit()
        .remove();
  };

  getUserAudio();
});