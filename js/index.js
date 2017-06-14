var storage = window.localStorage;
var threshold = 220;
var width = 512;
var grids = [2, 4, 8, 16, 32];
var data = JSON.parse(storage.getItem('data'));
if(!data) {
    data = [];
}

var thresholdInput = document.querySelector('#threshold');
function updateThreshold() {
    threshold = thresholdInput.value;
}
thresholdInput.onchange = updateThreshold;
updateThreshold();

var sizeInput = document.querySelector('#result');
var typeInput = document.querySelector('#type');
function updateResult(newResult) {
    sizeInput.value = newResult;
    if(!data.length) {
        return;
    }
    var size = data.reduce(function (prev, curr) {
        var r;
        if(Math.abs(curr.size - newResult) < Math.abs(prev.size - newResult)) {
            r = curr;
        } else {
            r = prev;
        }
        return r;
    });
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
    imagePreview.src = img.src;
}
var loadImageInput = createElement('input', {
    type: 'file',
    accept: 'image/*'
});
function startImageLoad() {
    loadImageInput.click();
}
function calculate(img, cb) {
    Utility.trimImage(img, threshold, function(cropped) {
        Utility.resizeImage(cropped, width, null, function(resizedWidth) {
            Utility.binarizeImage(resizedWidth, threshold, cb);
        });
    });
}
function finishImageLoad() {
    var fr = new FileReader();
    fr.onload = function(e) {
        var img = new Image();
        img.onload = function() {
            calculate(img, function(binarized) {
                updatePreview(binarized);
                var result = BoxCounting.calculateFromBinaryImage(binarized, grids);
                updateResult(result);
            });
        };
        img.src = e.target.result;
    };
    fr.readAsDataURL(loadImageInput.files[0]);
}
var loadImageButton = document.querySelector('#load-image');
loadImageButton.addEventListener('click', startImageLoad);
loadImageInput.addEventListener('change', finishImageLoad);
