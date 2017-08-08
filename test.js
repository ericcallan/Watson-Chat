event.on("hideimages", function() {
	console.log(this);
	GasExchangerDesc.alpha = 1;
	IntegratedventilatorDesc.alpha = 1;
	LungPreservationGasDesc.alpha = 1;
	PulsatilePumpDesc.alpha = 1;
	PumpflowprobeDesc.alpha = 1;
	ReliefValveDesc.alpha = 1;
	ReservoirDesc.alpha = 1;
	SAO2probeDesc.alpha = 1;
	svo2probeDesc.alpha = 1;
	WarmerDesc.alpha = 1;
	HepaDesc.alpha = 1;
});

var go = Creation.currentCard().objectNamed('GasExchangerDesc');
// Prepares `go` to be tapped
go.addTapHandler(1, 1);

go.on("tap", function (location, numberOfTaps, numberOfTouches, tappedNode) {
  console.log("tapped");
});
