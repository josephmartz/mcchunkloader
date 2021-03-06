(function() {
  var ChunkSizeX, ChunkSizeY, ChunkSizeZ, ChunkView, blockInfo, calcOpts, calcPoint, cubeCount, exports, require, times, typeToCoords, typeToCoords2,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  if (typeof window !== "undefined" && window !== null) {
    require = window.require;
    exports = window.exports;
  }

  blockInfo = require('blockinfo').blockInfo;

  ChunkSizeY = 256;

  ChunkSizeZ = 16;

  ChunkSizeX = 16;

  cubeCount = 0;

  calcOpts = {};

  times = 0;

  calcPoint = function(pos, opts) {
    var verts;
    verts = [];
    verts.push(pos[0] + opts.chunkX * 16 * 1.00000);
    verts.push((pos[1] + 1) * 1.0);
    verts.push(pos[2] + opts.chunkZ * 16 * 1.00000);
    return verts;
  };

  typeToCoords = function(type) {
    var s, x, y;
    if (type.t != null) {
      x = type.t[0];
      y = 15 - type.t[1];
      s = 0.0085;
      return [x / 16.0 + s, y / 16.0 + s, (x + 1.0) / 16.0 - s, y / 16.0 + s, (x + 1.0) / 16.0 - s, (y + 1.0) / 16.0 - s, x / 16.0 + s, (y + 1.0) / 16.0 - s];
    } else {
      return [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
    }
  };

  typeToCoords2 = function(type) {
    var s, x, y;
    if (type.t != null) {
      x = type.t[0];
      y = 15 - type.t[1];
      s = 0.0085;
      return [x / 16.0 + s, y / 16.0 + s, (x + 1.0) / 16.0 - s, y / 16.0 + s, (x + 1.0) / 16.0 - s, (y + 1.0) / 16.0 - s, x / 16.0 + s, y / 16.0 + s, (x + 1.0) / 16.0 - s, (y + 1.0) / 16.0 - s, x / 16.0 + s, (y + 1.0) / 16.0 - s];
    } else {
      return [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
    }
  };

  ChunkView = (function() {

    function ChunkView(options, indices, vertices) {
      this.options = options;
      this.indices = indices;
      this.vertices = vertices;
      this.addFace = __bind(this.addFace, this);
      this.addCubePoint = __bind(this.addCubePoint, this);
      this.showBlock = __bind(this.showBlock, this);
      this.addTexturedBlock = __bind(this.addTexturedBlock, this);
      this.hasNeighbor = __bind(this.hasNeighbor, this);
      this.getColor = __bind(this.getColor, this);
      this.getBlockInfo = __bind(this.getBlockInfo, this);
      this.getBlockType = __bind(this.getBlockType, this);
      this.renderPoints = __bind(this.renderPoints, this);
      this.addBlock = __bind(this.addBlock, this);
      this.extractChunk = __bind(this.extractChunk, this);
      this.transNeighbors = __bind(this.transNeighbors, this);
      this.getLightAt = __bind(this.getLightAt, this);
      this.getBlockAt = __bind(this.getBlockAt, this);
      this.index = 0;
      this.nbt = options.nbt;
      this.pos = options.pos;
      this.torches = [];
      this.unknown = [];
      this.notexture = [];
      this.rotcent = true;
      this.filled = [];
      this.nomatch = {};
      this.special = {};
      if (this.options.ymin != null) {
        this.ymin = this.options.ymin;
      } else {
        this.ymin = 60;
      }
      if ((this.options.superflat != null) === 'true') {
        this.options.superflat = true;
      }
      if (this.options.superflat != null) {
        this.superflat = this.options.superflat;
      } else {
        this.superflat = false;
      }
      if (this.options.showstuff != null) {
        this.showStuff = this.options.showstuff;
      } else {
        this.showStuff = 'diamondsmoss';
      }
      if (options.ymin != null) this.ymin = options.ymin;
    }

    ChunkView.prototype.getBlockAt = function(x, y, z) {
      var blockpos, offset, section, sectionnum, sections, _i, _len, _ref;
      if (((_ref = this.nbt.root) != null ? _ref.Level.Sections : void 0) != null) {
        sections = this.nbt.root.Level.Sections;
      } else {
        sections = this.nbt.root.Sections;
      }
      if (!sections) return -1;
      sectionnum = Math.floor(y / 16);
      offset = ((y % 16) * 256) + (z * 16) + x;
      blockpos = offset;
      for (_i = 0, _len = sections.length; _i < _len; _i++) {
        section = sections[_i];
        if (section !== void 0 && section.Y * 1 === sectionnum * 1) {
          return section.Blocks[blockpos];
        }
      }
      return -1;
    };

    ChunkView.prototype.getLightAt = function(x, y, z) {
      var offset, section, sectionnum, sections, _i, _len;
      if (this.nbt.root.Level.Sections != null) {
        sections = this.nbt.root.Level.Sections;
      } else {
        sections = this.nbt.root.Sections;
      }
      if (!sections) return -1;
      sectionnum = Math.floor(y / 16);
      offset = ((y % 16) * 256) + (z * 16) + x;
      for (_i = 0, _len = sections.length; _i < _len; _i++) {
        section = sections[_i];
        if (section !== void 0 && section.Y * 1 === sectionnum * 1) {
          if (offset % 2 === 0) {
            return section.BlockLight[Math.floor(offset / 2)] & 0x0F;
          } else {
            return (section.BlockLight[Math.floor(offset / 2)] >> 4) & 0x0F;
          }
        }
      }
      return -1;
    };

    ChunkView.prototype.transNeighbors = function(x, y, z) {
      var blockID, i, j, k, _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
      for (i = _ref = x - 1, _ref2 = x + 1; _ref <= _ref2 ? i <= _ref2 : i >= _ref2; _ref <= _ref2 ? i++ : i--) {
        if (i >= ChunkSizeX) continue;
        for (j = _ref3 = y - 1, _ref4 = y + 1; _ref3 <= _ref4 ? j <= _ref4 : j >= _ref4; _ref3 <= _ref4 ? j++ : j--) {
          for (k = _ref5 = z - 1, _ref6 = z + 1; _ref5 <= _ref6 ? k <= _ref6 : k >= _ref6; _ref5 <= _ref6 ? k++ : k--) {
            if (k >= ChunkSizeZ) continue;
            if (!(i === x && j === y && k === z)) {
              blockID = this.getBlockAt(i, j, k);
              if (blockID === 0 || blockID === -1) return true;
            }
          }
        }
      }
      return false;
    };

    ChunkView.prototype.extractChunk = function() {
      var Y, blah, blockType, id, offset, section, sections, show, x, y, z, _i, _len, _ref, _ref2, _ref3, _ref4;
      this.vertices = [];
      this.colors = [];
      this.indices = [];
      this.textcoords = [];
      this.filled = [];
      this.cubeCount = 0;
      if (this.nbt.root.Level.Sections != null) {
        sections = this.nbt.root.Level.Sections;
      } else {
        sections = this.nbt.root.Sections;
      }
      if (!sections) return;
      for (_i = 0, _len = sections.length; _i < _len; _i++) {
        section = sections[_i];
        if (section !== void 0) {
          Y = section.Y * 1;
          for (y = _ref = Y * 16, _ref2 = Y * 16 + 15; _ref <= _ref2 ? y <= _ref2 : y >= _ref2; _ref <= _ref2 ? y++ : y--) {
            for (x = 0, _ref3 = ChunkSizeX - 1; 0 <= _ref3 ? x <= _ref3 : x >= _ref3; 0 <= _ref3 ? x++ : x--) {
              for (z = 0, _ref4 = ChunkSizeZ - 1; 0 <= _ref4 ? z <= _ref4 : z >= _ref4; 0 <= _ref4 ? z++ : z--) {
                if (y < this.ymin) continue;
                offset = ((y % 16) * 256) + (z * 16) + x;
                id = section.Blocks[offset];
                blockType = blockInfo['_' + id];
                if (!(blockType != null)) id = -1;
                if (!((blockType != null ? blockType.t : void 0) != null)) id = -1;
                show = false;
                show = id > 0;
                if (!this.superflat && y < 60 && this.showStuff === 'diamondsmoss') {
                  show = id === 48 || id === 56 || id === 4 || id === 52;
                } else {
                  if (id !== 0 && id !== -1 && id !== -10) {
                    show = this.transNeighbors(x, y, z);
                  } else {
                    show = false;
                  }
                }
                if (show) {
                  this.addBlock([x, y, z]);
                } else {
                  blah = 1;
                }
              }
            }
          }
        }
      }
      return this.renderPoints();
    };

    ChunkView.prototype.addBlock = function(position) {
      var verts;
      verts = [position[0], position[1], position[2]];
      return this.filled.push(verts);
    };

    ChunkView.prototype.renderPoints = function() {
      var i, verts, _results;
      i = 0;
      if (this.filled.length === 0) {
        console.log('empty chunk');
        console.log(this.nbt);
      }
      try {
        _results = [];
        while (i < this.filled.length && i < 1000) {
          verts = this.filled[i];
          this.addTexturedBlock(verts);
          _results.push(i++);
        }
        return _results;
      } catch (e) {
        return console.log(e);
      }
    };

    ChunkView.prototype.getBlockType = function(x, y, z) {
      var blockID, blockType, id;
      blockType = blockInfo["_-1"];
      id = this.getBlockAt(x, y, z);
      blockID = "_-1";
      if (id != null) blockID = "_" + id.toString();
      if (blockInfo[blockID] != null) blockType = blockInfo[blockID];
      return blockType;
    };

    ChunkView.prototype.getBlockInfo = function(p) {
      var blockID, blockType, id;
      blockType = blockInfo["_-1"];
      id = this.getBlockAt(p[0], p[1], p[2]);
      blockID = "_-1";
      if (id != null) blockID = "_" + id.toString();
      if (blockInfo[blockID] != null) {
        return blockInfo[blockID];
      } else {
        return blockInfo["_-1"];
      }
    };

    ChunkView.prototype.getColor = function(pos) {
      var t;
      t = this.getBlockType(pos[0], pos[1], pos[2]);
      return t.rgba;
    };

    ChunkView.prototype.hasNeighbor = function(bl, p, offset0, offset1, offset2) {
      var id, info, n, _ref;
      if (this.showStuff === 'diamondsmoss' && p[1] < 62) return false;
      if (p[0] === 0 || p[0] === 15 || p[2] === 0 || p[2] === 15) return false;
      n = [p[0] + offset0, p[1] + offset1, p[2] + offset2];
      id = this.getBlockAt(n[0], n[1], n[2]);
      info = this.getBlockType(n[0], n[1], n[2]);
      if ((_ref = info.id) === 0 || _ref === 37 || _ref === 38 || _ref === 50) {
        return false;
      }
      return (info != null) && (info != null ? info.id : void 0) > 0 && (info.t != null) && (info.t[0] != null);
    };

    ChunkView.prototype.addTexturedBlock = function(p) {
      var a, block, blockAbove, blockType, show, side, _i, _len, _ref;
      a = p;
      block = this.getBlockInfo(p);
      blockType = block.type;
      if ((block != null ? block.s : void 0) != null) {
        if (block.type.indexOf('woodendoor') >= 0 || block.type.indexOf('irondoor') >= 0) {
          blockAbove = this.getBlockInfo([p[0], p[1] + 1, p[2]]);
          if (((blockAbove != null ? blockAbove.s : void 0) != null) && blockAbove.type === block.type) {
            blockType = block.type + 'bottom';
          } else {
            blockType = block.type + 'top';
          }
        }
        if (!(this.special[blockType] != null)) this.special[blockType] = [];
        return this.special[blockType].push(calcPoint(p, this.options));
      } else {
        _ref = ['front', 'back', 'top', 'bottom', 'right', 'left'];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          side = _ref[_i];
          this.index = this.addFace(this.index, a, block, p, side);
        }
        return show = this.showBlock(block, p);
      }
    };

    ChunkView.prototype.showBlock = function(bl, p) {
      var show, _ref;
      show = {};
      if ((_ref = bl.id) === 37 || _ref === 38) {
        show = {
          front: true,
          back: true,
          top: true,
          bottom: true,
          left: true,
          right: true
        };
      } else {
        show.front = !(this.hasNeighbor(bl, p, 0, 0, 1));
        show.back = !(this.hasNeighbor(bl, p, 0, 0, -1));
        show.top = !(this.hasNeighbor(bl, p, 0, 1, 0));
        show.bottom = !(this.hasNeighbor(bl, p, 0, -1, 0));
        show.left = !(this.hasNeighbor(bl, p, -1, 0, 0));
        show.right = !(this.hasNeighbor(bl, p, 1, 0, 0));
      }
      return show;
    };

    ChunkView.prototype.addCubePoint = function(a, xdelta, ydelta, zdelta) {
      var p2, p3, s;
      s = 0.0000000;
      p2 = [a[0] + xdelta * 0.5 + s, a[1] + ydelta * 0.5 + s, a[2] + zdelta * 0.5 + s];
      p3 = calcPoint(p2, this.options);
      this.vertices.push(p3[0]);
      this.vertices.push(p3[1]);
      return this.vertices.push(p3[2]);
    };

    ChunkView.prototype.addFace = function(i, a, bl, p, side) {
      var clr, coords, dirtgrass, facecoords, show;
      try {
        coords = typeToCoords2(bl);
        dirtgrass = blockInfo['_2x'];
        facecoords = typeToCoords2(dirtgrass);
        show = this.showBlock(bl, p);
        if (show[side]) {
          switch (side) {
            case 'front':
              if (bl.id === 2) coords = facecoords;
              this.addCubePoint(a, -1.0, -1.0, 1.0);
              this.addCubePoint(a, 1.0, -1.0, 1.0);
              this.addCubePoint(a, 1.0, 1.0, 1.0);
              this.addCubePoint(a, -1.0, -1.0, 1.0);
              this.addCubePoint(a, 1.0, 1.0, 1.0);
              this.addCubePoint(a, -1.0, 1.0, 1.0);
              break;
            case 'back':
              if (bl.id === 2) coords = facecoords;
              this.addCubePoint(a, 1.0, -1.0, -1.0);
              this.addCubePoint(a, -1.0, -1.0, -1.0);
              this.addCubePoint(a, -1.0, 1.0, -1.0);
              this.addCubePoint(a, 1.0, -1.0, -1.0);
              this.addCubePoint(a, -1.0, 1.0, -1.0);
              this.addCubePoint(a, 1.0, 1.0, -1.0);
              break;
            case 'top':
              this.addCubePoint(a, -1.0, 1.0, -1.0);
              this.addCubePoint(a, -1.0, 1.0, 1.0);
              this.addCubePoint(a, 1.0, 1.0, 1.0);
              this.addCubePoint(a, -1.0, 1.0, -1.0);
              this.addCubePoint(a, 1.0, 1.0, 1.0);
              this.addCubePoint(a, 1.0, 1.0, -1.0);
              break;
            case 'bottom':
              if (bl.id === 2) coords = facecoords;
              this.addCubePoint(a, -1.0, -1.0, -1.0);
              this.addCubePoint(a, 1.0, -1.0, -1.0);
              this.addCubePoint(a, 1.0, -1.0, 1.0);
              this.addCubePoint(a, -1.0, -1.0, -1.0);
              this.addCubePoint(a, 1.0, -1.0, 1.0);
              this.addCubePoint(a, -1.0, -1.0, 1.0);
              break;
            case 'right':
              if (bl.id === 2) coords = facecoords;
              this.addCubePoint(a, 1.0, -1.0, 1.0);
              this.addCubePoint(a, 1.0, -1.0, -1.0);
              this.addCubePoint(a, 1.0, 1.0, -1.0);
              this.addCubePoint(a, 1.0, -1.0, 1.0);
              this.addCubePoint(a, 1.0, 1.0, -1.0);
              this.addCubePoint(a, 1.0, 1.0, 1.0);
              break;
            case 'left':
              if (bl.id === 2) coords = facecoords;
              this.addCubePoint(a, -1.0, -1.0, -1.0);
              this.addCubePoint(a, -1.0, -1.0, 1.0);
              this.addCubePoint(a, -1.0, 1.0, 1.0);
              this.addCubePoint(a, -1.0, -1.0, -1.0);
              this.addCubePoint(a, -1.0, 1.0, 1.0);
              this.addCubePoint(a, -1.0, 1.0, -1.0);
          }
          this.indices.push.apply(this.indices, [i + 0, i + 1, i + 2, i + 3, i + 4, i + 5]);
          this.textcoords.push.apply(this.textcoords, coords);
          clr = [1.0, 1.0, 1.0];
          this.colors.push.apply(this.colors, clr);
          this.colors.push.apply(this.colors, clr);
          this.colors.push.apply(this.colors, clr);
          this.colors.push.apply(this.colors, clr);
          this.colors.push.apply(this.colors, clr);
          return this.colors.push.apply(this.colors, clr);
        }
      } catch (e) {
        return console.log(e);
      } finally {
        if (show[side]) {
          return i + 6;
        } else {
          return i;
        }
      }
    };

    return ChunkView;

  })();

  exports.ChunkView = ChunkView;

  exports.calcPoint = calcPoint;

  exports.typeToCoords = typeToCoords;

}).call(this);
