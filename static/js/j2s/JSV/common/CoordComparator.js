Clazz.declarePackage("JSV.common");
(function(){
var c$ = Clazz.declareType(JSV.common, "CoordComparator", null, java.util.Comparator);
Clazz.overrideMethod(c$, "compare", 
function(c1, c2){
return (c1.getXVal() > c2.getXVal() ? 1 : c1.getXVal() < c2.getXVal() ? -1 : 0);
}, "JSV.common.Coordinate,JSV.common.Coordinate");
})();
;//5.0.1-v4 Wed Dec 11 08:23:48 CST 2024
