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
var lines = []; // Tracks all line objects
var selectedItem = null;
var currentEditingLine = null; // Tracks which line is currently being edited

// layer.add(circle);

function lineMode() {
  deselectAll();
  lineBtn = !lineBtn;
  document.getElementById("lineBtn").style.backgroundColor = lineBtn
    ? "green"
    : "grey";
}
function addBusf() {
    // In a professional CAD, we deselect everything before adding new items
    if (selectedItem) unHighLightItem(selectedItem);
    selectedItem = null;
    
    // Hide properties and show the default message
    document.getElementById('props-panel').style.display = 'none';
    document.getElementById('no-selection-msg').style.display = 'block';

    addBus();
}
  stage.add(layer);
  var buscount = 0;
function addBus() {
    buscount++;
    
    // Calculate a position that is more central or based on a grid
    const spawnX = 50 + (Math.random() * 300);
    const spawnY = 50 + (Math.random() * 300);

    var busgroup = new Konva.Group({
        x: Math.round(spawnX / 20) * 20, // Snap to your 20px grid
        y: Math.round(spawnY / 20) * 20,
        draggable: true,
        id: "bus_" + buscount,
    });

    // Professional MATLAB Slate-Blue color for buses
    var bus = new Konva.Rect({
        name: "busBody",
        x: 0,
        y: 0,
        offsetX: 30,
        offsetY: 5,
        width: 60,
        height: 8, // Slightly thinner for a sleek look
        fill: "#2c3e50", 
        stroke: "#7f8c8d",
        strokeWidth: 1,
        cornerRadius: 2
    });

    var text = new Konva.Text({
        x: -25,
        y: 15, // Move label below the bus
        text: "Bus " + buscount,
        fontSize: 11,
        fill: "#333",
        fontFamily: "'Segoe UI', Arial",
        fontStyle: 'bold'
    });

    busgroup.add(bus);
    busgroup.add(text);

    // Interaction logic
    busgroup.on("dblclick", function () {
        rotateBus(this);
    });

    busgroup.on("click", function (e) {
        e.cancelBubble = true;
        selectItem(this);
    });

    // Handle Snap-to-Grid while dragging
    busgroup.on("dragmove", () => {
        busgroup.position({
            x: Math.round(busgroup.x() / 20) * 20,
            y: Math.round(busgroup.y() / 20) * 20
        });
    });

    layer.add(busgroup);
    layer.batchDraw();
    
    // Use push to ensure the buses array is always in order
    buses.push(busgroup); 
}

//add new transmission line
function addLine(startBus, stopBus) {
  var line = new Konva.Line({
    points: [],
    stroke: "black",
    strokeWidth: 5, // Thicker makes it easier to click
    lineCap: 'round',
    id: "line_" + lines.length,
    // Store reference IDs for the matrix
    fromBus: startBus.id(),
    toBus: stopBus.id(),
    // Default Impedance Values
    resistance: 0.01,
    reactance: 0.05
  });

  function updateLine() {
    const p1 = startBus.position();
    const p2 = stopBus.position();
    line.points([p1.x, p1.y, p2.x, p2.y]);
  }

  // Bind movement
  startBus.on("dragmove", updateLine);
  stopBus.on("dragmove", updateLine);

  // Click to input impedance
  line.on('click', function(e) {
    e.cancelBubble = true;
    openProperties(this);
  });

  updateLine();
  layer.add(line);
  line.moveToBottom();
  lines.push(line); 
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
    // Only handle visual button resets here
    const buttons = [...document.querySelectorAll(".ribbon-btn, .cmpbtn")];
    buttons.forEach((button) => {
        button.style.backgroundColor = ""; // Reset to default CSS
    });
}
function openProperties(line) {
    currentEditingLine = line;
    
    // UI Toggles
    document.getElementById('no-selection-msg').style.display = 'none';
    document.getElementById('props-panel').style.display = 'block';
    
    // Set Data
    document.getElementById('editing-label').innerText = line.attrs.fromBus + " ➔ " + line.attrs.toBus;
    document.getElementById('inputR').value = line.attrs.resistance;
    document.getElementById('inputX').value = line.attrs.reactance;

    // Professional Highlight: MATLAB Orange (#edb120)
    lines.forEach(l => {
        l.stroke('black');
        l.strokeWidth(2);
    });
    line.stroke('#edb120'); 
    line.strokeWidth(4);
    layer.batchDraw();
}

function saveLineData() {
    if (currentEditingLine) {
        const rVal = parseFloat(document.getElementById('inputR').value);
        const xVal = parseFloat(document.getElementById('inputX').value);

        // Save values back to the Konva object
        currentEditingLine.setAttr('resistance', rVal);
        currentEditingLine.setAttr('reactance', xVal);

        document.getElementById('props-panel').style.display = 'none';
        currentEditingLine.stroke('black');
        layer.batchDraw();
        console.log("Updated Line Data:", currentEditingLine.attrs);
    }
}
function generateYBus() {
    let n = buses.length;
    if (n === 0) return alert("Add buses first!");

    // 1. Core Logic: Initialize n x n matrix
    let matrix = Array.from({ length: n }, () => Array(n).fill(0));

    lines.forEach(line => {
        // Map bus IDs to indices (e.g., bus_1 -> 0)
        let i = parseInt(line.attrs.fromBus.split('_')[1]) - 1;
        let j = parseInt(line.attrs.toBus.split('_')[1]) - 1;
        
        let R = line.attrs.resistance;
        let X = line.attrs.reactance;
        
        // Magnitude of Admittance y = 1 / sqrt(R^2 + X^2)
        let admittance = 1 / Math.sqrt(R*R + X*X);

        // Populate Ybus rules
        matrix[i][i] += admittance;
        matrix[j][j] += admittance;
        matrix[i][j] -= admittance;
        matrix[j][i] -= admittance;
    });

    // 2. UI Logic: Build the visible table
    let tableHtml = "<table style='width:100%; border-collapse: collapse;'>";
    matrix.forEach((row, rowIndex) => {
        tableHtml += "<tr>";
        row.forEach((value, colIndex) => {
            // Highlighting diagonal elements (Self Admittance) in light blue
            let bgColor = (rowIndex === colIndex) ? "#e3f2fd" : "transparent";
            tableHtml += `<td style='border: 1px solid #ccc; padding: 8px; background: ${bgColor};'>${value.toFixed(3)}</td>`;
        });
        tableHtml += "</tr>";
    });
    tableHtml += "</table>";

    // Ensure this ID matches the result container in your Sidebar
    const resultPanel = document.getElementById('results-modal');
    const output = document.getElementById('matrix-output');

    output.innerHTML = tableHtml;
    resultPanel.style.display = 'block'; 

    // Optional: Hide the properties panel to make room for results
    document.getElementById('props-panel').style.display = 'none';
}