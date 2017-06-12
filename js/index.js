var storage = window.localStorage;
var threshold = 220;
var width = 512;
var data = JSON.parse(storage.getItem('data'));
if(!data) {
    data = [];
}

function calculate(img, cb) {
    var grid = [2, 4, 8, 16, 32];
    var results = [];
    Utility.trimImage(img, threshold, function(cropped) {
        Utility.resizeImage(cropped, width, null, function(resizedWidth) {
            Utility.binarizeImage(resizedWidth, threshold, function(binarized) {
                grid.forEach(function(size, i) {
                    results.push(BoxCounting.calculateFromBinaryImage(binarized, size));
                    if(results.length == grid.length) {
                        console.log(results);
                        var sum = results.reduce(function(a, b) {
                            return a + b;
                        });
                        var avg = sum / results.length;
                        cb(avg);
                    }
                });
            });        
        });
    });
}

var thresholdInput = document.querySelector('#threshold');
function updateThreshold() {
    threshold = thresholdInput.value;
}
thresholdInput.onchange = updateThreshold;
updateThreshold();

var sizeInput = document.querySelector('#result');
function updateSize(newResult) {
    sizeInput.value = newResult;
}

var typeInput = document.querySelector('#type');
function updateType(f) {
    console.log(data);
    if(!data.length) {
        return;
    }
    var size = data.reduce(function (prev, curr) {
        var r;
        if(Math.abs(curr.size - f) < Math.abs(prev.size - f)) {
            r = curr;
        } else {
            r = prev;
        }
        return r;
    });
    console.log(size);
    typeInput.value = size.type;
}

var saveButton = document.querySelector('#save');
function saveSize(size, type) {
    data.push({
        size: size,
        type: type
    });
    storage.setItem('data', JSON.stringify(data));
}
saveButton.onclick = function() {
    var size = sizeInput.value;
    var type = typeInput.value;
    if(size && type) {
        saveSize(size, type);
    }
};

var imagePreview = document.querySelector('#image-preview');
function updatePreview(img) {
    Utility.trimImage(img, threshold, function(cropped) {
        Utility.resizeImage(cropped, width, null, function(resizedWidth) {
            Utility.binarizeImage(resizedWidth, threshold, function(binarized) {
                imagePreview.src = binarized.src;
            });
        });
    });   
}
var loadImageInput = createElement('input', {
    type: 'file',
    accept: 'image/*'
});
function startImageLoad() {
    loadImageInput.click();
}
function finishImageLoad() {
    var fr = new FileReader();
    fr.onload = function(e) {
        var img = new Image();
        img.onload = function() {
            updatePreview(img);
            calculate(img, function(f) {
                updateSize(f);
                updateType(f);
            });
        };
        img.src = e.target.result;
    };
    fr.readAsDataURL(loadImageInput.files[0]);
}
var loadImageButton = document.querySelector('#load-image');
loadImageButton.addEventListener('click', startImageLoad);
loadImageInput.addEventListener('change', finishImageLoad);
