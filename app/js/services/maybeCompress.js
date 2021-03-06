(function() { 'use strict';

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * @ngdoc service
 * @name tradity.maybeCompress
 * @description
 * # maybeCompress
 * Factory
 */
angular.module('tradity')
  .factory('maybeCompress', function (lzma, $q) {
    var MaybeCompress = function() {
      this.canCompress = true;
      
      // perform minimal self-test to make sure the compression enviroment works
      var testString = 'Banana';
      this.compress(testString, 5).then(this.decompress.bind(this)).then((function(decompressed) {
        if (decompressed != testString) {
          console.warn('Decompressed string does not match input', decompressed);
          this.canCompress = false;
        }
      }).bind(this)).catch((function(e) {
        console.warn('No compression available', e);
        this.canCompress = false;
      }).bind(this));
    };
    
    MaybeCompress.prototype.compress = function(input, threshold) {
      if (input.length < threshold || !lzma || !this.canCompress)
        return $q.when('r:' + input); // raw encoding
      
      // some browsers have a limit of 2.5 million characters for localStorage
      // feed data is rather well compressible, so LZMA level 3 should be just fine
      return lzma.compress(input, input.length > threshold * 4 ? 9 : 3).then(function(compressed) {
        // use Array.prototype.map, since compressed might be a typed array where
        // map returns a typed array of the same kind (and is therefore unsuitable
        // for returning strings)
        return '0x' + Array.prototype.map.call(compressed, function(byte) {
          return (byte+256).toString(16).substr(-2);
        }).join('');
      });
    };
    
    MaybeCompress.prototype.decompress = function(input) {
      if (!input || input == 'null')
        return $q.when(null);
      
      var encodingID = input.substr(0, 2);
      if (encodingID == 'r:')
        return $q.when(input.substr(2));
      
      if (encodingID != '0x') {
        console.warn('Unknown encoding:', encodingID);
        return $q.when(null);
      }
      
      if (!lzma) {
        console.warn('No LZMA present for decoding');
        return $q.when(null);
      }
      
      // unhex input
      var byteArray = input.substr(2).replace(/(..)/g, '$1:').split(':').slice(0, -1)
        .map(function(s) { return parseInt(s, 16); });
      
      return lzma.decompress(byteArray);
    };
    
    return new MaybeCompress();
  });

})();
