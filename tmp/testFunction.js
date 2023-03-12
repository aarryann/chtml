(function(exports){
  exports.test = function(){
    return 'called';
  }

})( typeof exports === 'undefined' ? this['testFunction'] = {} : exports )
