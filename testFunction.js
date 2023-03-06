(function(exports){
  exports.test = function(){
    console.log('inside test');
    return 'called';
  }

})( typeof exports === 'undefined' ? this['testFunction'] = {} : exports )
