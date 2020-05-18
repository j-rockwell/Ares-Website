module.exports = {
    asString : function(listing) {
        return listing._id.toString();
    },
    
    eq: function (v1, v2) {
        return v1 === v2;
    },
    
    ne: function (v1, v2) {
        return v1 !== v2;
    },
    
    lt: function (v1, v2) {
        return v1 < v2;
    },
    
    gt: function (v1, v2) {
        return v1 > v2;
    },
    
    lte: function (v1, v2) {
        return v1 <= v2;
    },
    
    gte: function (v1, v2) {
        return v1 >= v2;
    },
    
    and: function () {
        return Array.prototype.slice.call(arguments).every(Boolean);
    },
    
    or: function () {
        return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
    },
    
    cont : function (val, arr) {
        if (!val || !arr) {
            return false;
        }
    
        for (var i = 0; i < arr.length; i++) {
            const o = arr[i];
    
            if (o == val) {
                return true;
            }
        }
    
        return false;
    }
}