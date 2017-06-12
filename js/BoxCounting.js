(function(){
    var BoxCounting = {
        calculateFromArray: function(a, size) {
            var boxesWithData = 0;
            for(var i = 0; i < a.length; i += size) {
                for(var j = 0; j < a[i].length; j += size) {
                    var box = Utility.arraySubset(a, i, j, i + size, j + size);
                    boxesWithData += !Utility.arrayIsEmpty(box);
                }
            }
            return Math.log(boxesWithData) / Math.log(a[0].length / size);
        },
        calculateFromBinaryImage: function(img, size) {
                var a = Utility.binaryImageToArray(img);
                return BoxCounting.calculateFromArray(a, size);
        }
    };

    window.BoxCounting = BoxCounting;
})();
