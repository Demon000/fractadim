(function(){
    var BoxCounting = {
        calculateFromArray: function(a, grids) {
            var width = a.length;
            var height = a[0].length;
            var results = grids.map(function(grid, i) {
                var boxesWithData = 0;
                for(var i = 0; i < width; i += grid) {
                    for(var j = 0; j < height; j += grid) {
                        var box = Utility.arraySubset(a, i, j, i + grid, j + grid);
                        boxesWithData += !Utility.arrayIsEmpty(box);
                    }
                }
                return Math.log(boxesWithData) / Math.log(a[0].length / grid);
            });
            return Utility.arrayAverage(results);
        },
        calculateFromBinaryImage: function(img, grids) {
                var a = Utility.binaryImageToArray(img);
                return BoxCounting.calculateFromArray(a, grids);
        }
    };

    window.BoxCounting = BoxCounting;
})();
