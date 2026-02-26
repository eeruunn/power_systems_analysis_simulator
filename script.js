const container = document.getElementById("bucket");
var selectedItem = null;
var stage = new Konva.Stage({
  container: "bucket",
  width: container.clientWidth,
  height: container.clientHeight,
});

var layer = new Konva.Layer({});
var lineBtn = false;
var busBtn = false;
var buses = [];

// layer.add(circle);

function lineMode() {
  deselectAll();
  lineBtn = !lineBtn;
  document.getElementById("lineBtn").style.backgroundColor = lineBtn
    ? "green"
    : "grey";
}
function addBusf() {
  deselectAll();
  busBtn = !busBtn;

  addBus();
}
stage.add(layer);
var buscount = 0;
function addBus() {
  var busgroup = new Konva.Group({
    x: Math.random() * 100,
    y: Math.random() * 100,
    draggable: true,
    id: "bus_" + ++buscount,
  });
  var bus = new Konva.Rect({
    name: "busBody",
    x: 0,
    y: 0,
    offsetX: 30,
    offsetY: 5,
    width: 60,
    height: 10,
    fill: "black",
  });
  var text = new Konva.Text({
    x: 0,
    y: 40,
    text: "Bus " + buscount,
    fontSize: 14,
    fill: "black",
    draggable: true,
    fontFamily: "Arial",
  });

  busgroup.add(bus);
  busgroup.add(text);
  busgroup.on("dblclick", function () {
    rotateBus(this);
  });
  busgroup.on("click", function (e) {
    e.cancelBubble = true;
    selectItem(busgroup);
  });
  layer.add(busgroup);
  layer.batchDraw();
  buses[buscount - 1] = busgroup;
}

//add new transmission line
function addLine(startBus, stopBus) {
  var line = new Konva.Line({
    points: [],
    stroke: "black",
    strokeWidth: 2,
  });
  layer.add(line);
  layer.moveToBottom();
  console.log(startBus.position());
  console.log(stopBus.position());
  function updateLine() {
    var p1 = startBus.position();
    var p2 = stopBus.position();
    line.points([p1.x, p1.y, p2.x, p2.y]);
  }
  startBus.on("dragmove", function () {
    updateLine();
    layer.batchDraw();
  });
  stopBus.on("dragmove", function () {
    updateLine();
    layer.batchDraw();
  });
  updateLine();
  layer.batchDraw();
}

function rotateBus(groupNode) {
  var bus = groupNode.findOne(".busBody");

  var currentRotation = bus.rotation();
  if (currentRotation == 0) {
    bus.rotation(90);
  } else {
    bus.rotation(0);
  }
  layer.batchDraw();
}
function selectItem(newItem) {
  if (selectedItem && selectedItem !== newItem) {
    unHighLightItem(selectedItem);
    if (lineBtn) {
      addLine(selectedItem, newItem);
    }
  }

  selectedItem = newItem;
  highLightItem(newItem);
  layer.batchDraw();
}
function highLightItem(item) {
  if (item instanceof Konva.Group) {
    var bus = item.findOne(".busBody");
    bus.stroke("red");
    bus.strokeWidth(3);
  }
}

function unHighLightItem(item) {
  if (item instanceof Konva.Group) {
    var bus = item.findOne(".busBody");
    bus.stroke("null");
  }
}

stage.on("click", function (e) {
  if (e.target === stage) {
    if (selectItem) {
      unHighLightItem(selectedItem);
    }
    selectedItem = null;
    layer.batchDraw();
    return;
  }
});

function deselectAll() {
  busBtn = false;
  const buttons = [...document.querySelectorAll(".cmpbtn")];

  buttons.map((button) => {
    button.style.backgroundColor = "grey";
  });
}
