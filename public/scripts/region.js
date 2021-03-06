(function() {
  var CHUNK_HEADER_SIZE, Region, SECTOR_BYTES, SECTOR_INTS, chunk, dataview, emptySector, emptySectorBuffer, exports, nbt, require, sizeDelta,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  if (typeof window !== "undefined" && window !== null) {
    exports = window.exports;
    require = window.require;
  }

  dataview = require('dataview');

  nbt = require('nbt');

  chunk = require('chunk');

  SECTOR_BYTES = 4096;

  SECTOR_INTS = SECTOR_BYTES / 4;

  CHUNK_HEADER_SIZE = 5;

  emptySectorBuffer = new ArrayBuffer(4096);

  emptySector = new Uint8Array(emptySectorBuffer);

  sizeDelta = 0;

  Region = (function() {

    function Region(buffer, x, z) {
      var i, nSectors, offset, sectorNum, _ref, _ref2;
      this.buffer = buffer;
      this.x = x;
      this.z = z;
      this.hasChunk = __bind(this.hasChunk, this);
      this.getOffset = __bind(this.getOffset, this);
      this.outOfBounds = __bind(this.outOfBounds, this);
      this.getChunk = __bind(this.getChunk, this);
      this.dataView = new dataview.jDataView(this.buffer);
      sizeDelta = 0;
      nSectors = this.buffer.byteLength / SECTOR_BYTES;
      this.sectorFree = [];
      for (i = 0, _ref = nSectors - 1; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
        this.sectorFree.push(true);
      }
      this.sectorFree[0] = false;
      this.sectorFree[1] = false;
      this.dataView.seek(0);
      this.offsets = new Int32Array(this.buffer, 0, SECTOR_INTS);
      for (i = 0; 0 <= SECTOR_INTS ? i <= SECTOR_INTS : i >= SECTOR_INTS; 0 <= SECTOR_INTS ? i++ : i--) {
        offset = this.dataView.getInt32();
        if (offset !== 0 && (offset >> 16) + ((offset >> 8) & 0xFF) <= this.sectorFree.length) {
          for (sectorNum = 0, _ref2 = ((offset >> 8) & 0xFF) - 1; 0 <= _ref2 ? sectorNum <= _ref2 : sectorNum >= _ref2; 0 <= _ref2 ? sectorNum++ : sectorNum--) {
            this.sectorFree[(offset >> 16) + sectorNum] = false;
          }
        }
      }
    }

    Region.prototype.getChunk = function(x, z) {
      var data, length, nbtReader, offset, retval, retvalbytes, version;
      offset = this.getOffset(x, z);
      if (offset === 0) {
        console.log("Not able to show chunk at (" + x + ", " + z + ")");
        return null;
      } else {
        this.dataView.seek(offset);
        length = this.dataView.getInt32();
        version = this.dataView.getUint8();
        data = new Uint8Array(this.buffer, this.dataView.tell(), length);
        retvalbytes = new Zlib.Inflate(data).decompress();
        nbtReader = new nbt.NBTReader(retvalbytes);
        retval = nbtReader.read();
        return retval;
      }
    };

    /*
      getChunk: (x, z) =>
        try 
          if @outOfBounds z, x
            return null
    
          offset = @getOffset z, x
          if offset is 0          
            return null    
    
          sectorNumber = new Int32Array(1)
          numSectors = new Uint8Array(1)
          offset = @getOffset(z,x)
          sectorNumber = offset >> 16     #sectorNumber    
          numSectors = (offset >> 8) & 0xFF    #numSectors
          if numSectors is 0 then return null
          #if sectorNumber + numSectors > @sectorFree.length
          #  return null      
    
          @dataView.seek sectorNumber * SECTOR_BYTES
          length = @dataView.getInt32()
    
          if length > SECTOR_BYTES * numSectors
            return null      
    
          version = @dataView.getUint8()
          data = new Uint8Array(@buffer, @dataView.tell(), length)
          retvalbytes = new Zlib.Inflate(data).decompress()
          nbtReader = new nbt.NBTReader(retvalbytes)
          retval = nbtReader.read()
          return retval
        catch e
        return null
    */

    Region.prototype.outOfBounds = function(x, z) {
      return x < 0 || x >= 32 || z < 0 || z >= 32;
    };

    Region.prototype.getOffset = function(x, z) {
      var bytes, locationOffset, offset, sectors;
      locationOffset = 4 * (x + z * 32);
      bytes = new Uint8Array(this.buffer, locationOffset, 4);
      sectors = bytes[3];
      offset = bytes[0] << 16 | bytes[1] << 8 | bytes[2];
      if (offset === 0) {
        return 0;
      } else {
        return offset * 4096;
      }
    };

    Region.prototype.hasChunk = function(x, z) {
      var offset;
      offset = this.getOffset(x, z);
      return offset !== 0;
    };

    return Region;

  })();

  exports.Region = Region;

}).call(this);
