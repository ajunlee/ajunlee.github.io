const stage = new Konva.Stage({
    container: 'container',
    width: window.innerWidth,
    height: window.innerHeight - 50, // Account for controls height
});

const layer = new Konva.Layer();
stage.add(layer);

let selectedNode = null;
const deleteButton = document.createElement('button');
deleteButton.textContent = 'X';
deleteButton.className = 'delete-button';
document.body.appendChild(deleteButton);

function updateDeleteButtonPosition(node) {
    const box = node.getClientRect();
    const stageBox = stage.container().getBoundingClientRect();

    deleteButton.style.left = `${stageBox.left + box.x}px`;
    deleteButton.style.top = `${stageBox.top + box.y}px`;
    deleteButton.style.display = 'block';
}

function hideDeleteButton() {
    deleteButton.style.display = 'none';
}

function addText() {
    const inputText = document.getElementById('textInput').value || 'Sample Text';
    const selectedFont = document.getElementById('fontSelector').value;
    const text = new Konva.Text({
        x: 50,
        y: 50,
        text: inputText,
        fontSize: 24,
        fontFamily: selectedFont,
        draggable: true,
    });

    const transformer = new Konva.Transformer();
    layer.add(text);
    layer.add(transformer);
    transformer.nodes([text]);

    text.on('transform', () => {
        text.fontSize(text.width() / (text.text().length / 2));
    });

    text.on('click', () => {
        transformer.nodes([text]);
        selectedNode = text;
        updateDeleteButtonPosition(text);
    });

    text.on('dragmove', () => {
        if (selectedNode === text) {
            updateDeleteButtonPosition(text);
        }
    });

    layer.draw();
}

function addImage() {
    const imageURL = document.getElementById('imageInput').value || 'https://via.placeholder.com/150';
    const imageObj = new Image();
    imageObj.src = imageURL;

    imageObj.onload = function () {
        const image = new Konva.Image({
            x: 100,
            y: 100,
            image: imageObj,
            width: 150,
            height: 150,
            draggable: true,
        });

        const transformer = new Konva.Transformer({
            boundBoxFunc: (oldBox, newBox) => {
                // Limit resizing
                if (newBox.width < 30 || newBox.height < 30) {
                    return oldBox;
                }
                return newBox;
            },
        });

        layer.add(image);
        layer.add(transformer);
        transformer.nodes([image]);

        image.on('click', () => {
            transformer.nodes([image]);
            selectedNode = image;
            updateDeleteButtonPosition(image);
        });

        image.on('dragmove', () => {
            if (selectedNode === image) {
                updateDeleteButtonPosition(image);
            }
        });

        layer.draw();
    };
}

function addBarcode() {
    const barcodeValue = document.getElementById('barcodeInput').value || '123456789';

    const canvas = document.createElement('canvas');
    JsBarcode(canvas, barcodeValue, {
        format: 'CODE128',
        displayValue: false,
        height: 50,
    });

    const barcodeImage = new Konva.Image({
        x: 150,
        y: 150,
        image: canvas,
        width: canvas.width,
        height: canvas.height,
        draggable: true,
    });

    const barcodeText = new Konva.Text({
        x: 150,
        y: 150 + canvas.height + 5, // Position text below barcode
        text: barcodeValue,
        fontSize: 16,
        fontFamily: 'Arial',
        fill: 'black',
        draggable: true,
    });

    const transformer = new Konva.Transformer({
        boundBoxFunc: (oldBox, newBox) => {
            // Limit resizing
            if (newBox.width < 30 || newBox.height < 30) {
                return oldBox;
            }
            return newBox;
        },
    });

    layer.add(barcodeImage);
    layer.add(barcodeText);
    layer.add(transformer);
    transformer.nodes([barcodeImage, barcodeText]);

    barcodeImage.on('click', () => {
        transformer.nodes([barcodeImage, barcodeText]);
        selectedNode = barcodeImage;
        updateDeleteButtonPosition(barcodeImage);
    });

    barcodeImage.on('dragmove', () => {
        if (selectedNode === barcodeImage) {
            updateDeleteButtonPosition(barcodeImage);
        }
    });

    barcodeText.on('click', () => {
        transformer.nodes([barcodeImage, barcodeText]);
        selectedNode = barcodeText;
        updateDeleteButtonPosition(barcodeText);
    });

    barcodeText.on('dragmove', () => {
        if (selectedNode === barcodeText) {
            updateDeleteButtonPosition(barcodeText);
        }
    });

    layer.draw();
}

deleteButton.onclick = () => {
    if (selectedNode) {
        selectedNode.destroy();
        hideDeleteButton();
        layer.draw();
        selectedNode = null;
    }
};

function bringForward() {
    if (selectedNode) {
        selectedNode.moveUp();
        layer.draw();
    }
}

function sendBackward() {
    if (selectedNode) {
        selectedNode.moveDown();
        layer.draw();
    }
}

stage.on('click', (e) => {
    if (e.target === stage) {
        layer.find('Transformer').forEach((tr) => tr.nodes([]));
        selectedNode = null;
        hideDeleteButton();
        layer.draw();
    }
});

function addQRCode() {
    const qrCodeValue = document.getElementById('qrcodeInput').value || 'https://example.com';

    const canvas = document.createElement('canvas');
    QRCode.toCanvas(canvas, qrCodeValue, { width: 100, height: 100 }, (error) => {
        if (error) console.error(error);

        const qrCodeImage = new Konva.Image({
            x: 150,
            y: 150,
            image: canvas,
            width: canvas.width,
            height: canvas.height,
            draggable: true,
        });

        layer.add(qrCodeImage);
        layer.draw();
    });
}

function addRectangle() {
    const rectangle = new Konva.Rect({
        x: 50,
        y: 50,
        width: 100,
        height: 100,
        stroke: 'black',
        strokeWidth: 2,
        draggable: true,
    });
    const transformer = new Konva.Transformer({
        boundBoxFunc: (oldBox, newBox) => {
            // Limit resizing
            if (newBox.width < 30 || newBox.height < 30) {
                return oldBox;
            }
            return newBox;
        },
    });
    layer.add(rectangle);
    layer.add(transformer);
    transformer.nodes([rectangle]);

    rectangle.on('click', () => {
        transformer.nodes([rectangle]);
        selectedNode = rectangle;
        updateDeleteButtonPosition(rectangle);
    });

    rectangle.on('dragmove', () => {
        if (selectedNode === rectangle) {
            updateDeleteButtonPosition(rectangle);
        }
    });
    
    layer.draw();
}

document.getElementById('exportButton').addEventListener('click', () => {
    const dataURL = stage.toDataURL({ mimeType: 'image/png' });
    const link = document.createElement('a');
    link.download = 'canvas.png';
    link.href = dataURL;
    link.click();
});

function saveCanvas() {
    const json = stage.toJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = 'canvas.json';
    link.href = URL.createObjectURL(blob);
    link.click();
}

function importCanvas(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const json = e.target.result;
            stage.destroyChildren();
            Konva.Node.create(json, 'container');
        };
        reader.readAsText(file);
    }
}
