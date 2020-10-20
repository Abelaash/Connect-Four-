(function() {
  var SourceInfo, Utility, fs;

  fs = require('fs');

  Utility = require('./utility');

  module.exports = SourceInfo = (function() {
    function SourceInfo() {}

    SourceInfo.prototype.frameworkLookup = {
      test: 'test',
      spec: 'rspec',
      rspec: 'rspec',
      feature: 'cucumber',
      minitest: 'minitest',
      python: 'python'
    };

    SourceInfo.prototype.regExpForTestStyle = {
      unit: /def\s(.*?)$/,
      spec: /(?:"|')(.*?)(?:"|')/
    };

    SourceInfo.prototype.currentShell = function() {
      return atom.config.get('ruby-test.shell') || 'bash';
    };

    SourceInfo.prototype.projectPath = function() {
      var defaultPath, j, len, path, ref;
      defaultPath = atom.project.getPaths()[0];
      if (this.filePath()) {
        ref = atom.project.getPaths();
        for (j = 0, len = ref.length; j < len; j++) {
          path = ref[j];
          if (this.filePath().indexOf(path) === 0) {
            return path;
          }
        }
        return defaultPath;
      } else {
        return defaultPath;
      }
    };

    SourceInfo.prototype.activeFile = function() {
      var fp;
      return this._activeFile || (this._activeFile = (fp = this.filePath()) && atom.project.relativize(fp));
    };

    SourceInfo.prototype.currentLine = function() {
      var cursor, editor;
      return this._currentLine || (this._currentLine = !this._currentLine ? (editor = atom.workspace.getActiveTextEditor(), cursor = editor && editor.getLastCursor(), cursor ? cursor.getBufferRow() + 1 : null) : void 0);
    };

    SourceInfo.prototype.minitestRegExp = function() {
      var file;
      if (this._minitestRegExp !== void 0) {
        return this._minitestRegExp;
      }
      file = this.fileAnalysis();
      return this._minitestRegExp = this.extractMinitestRegExp(file.testHeaderLine, file.testStyle);
    };

    SourceInfo.prototype.extractMinitestRegExp = function(testHeaderLine, testStyle) {
      var match, regExp;
      regExp = this.regExpForTestStyle[testStyle];
      match = (testHeaderLine != null) && testHeaderLine.match(regExp) || null;
      if (match) {
        return match[1];
      } else {
        return "";
      }
    };

    SourceInfo.prototype.fileFramework = function() {
      if (!this._fileAnalysis) {
        this.fileAnalysis();
      }
      return this._fileAnalysis.framework;
    };

    SourceInfo.prototype.testStyle = function() {
      if (!this._fileAnalysis) {
        this.fileAnalysis();
      }
      return this._fileAnalysis.testStyle;
    };

    SourceInfo.prototype.fileAnalysis = function() {
      var editor, i, minitestClassRegExp, minitestMethodRegExp, res, rspecAssertionRegExp, rspecRequireRegExp, sourceLine, specRegExp;
      if (this._fileAnalysis !== void 0) {
        return this._fileAnalysis;
      }
      this._fileAnalysis = {
        testHeaderLine: null,
        testStyle: null,
        framework: null
      };
      editor = atom.workspace.getActiveTextEditor();
      i = this.currentLine() - 1;
      specRegExp = new RegExp(/\b(?:should|test|it)\s+['"](.*)['"]\s+do\b/);
      rspecRequireRegExp = new RegExp(/^require.*(rails|spec)_helper/);
      rspecAssertionRegExp = new RegExp(/^\s*expect\(/);
      minitestClassRegExp = new RegExp(/class\s(.*)<(\s?|\s+)Minitest::Test/);
      minitestMethodRegExp = new RegExp(/^(\s+)def\s(.*)$/);
      while (i >= 0) {
        sourceLine = editor.lineTextForBufferRow(i);
        if (!this._fileAnalysis.testHeaderLine) {
          if (res = sourceLine.match(specRegExp)) {
            this._minitestRegExp = res[1];
            this._fileAnalysis.testStyle = 'spec';
            this._fileAnalysis.testHeaderLine = sourceLine;
          } else if (minitestMethodRegExp.test(sourceLine)) {
            this._fileAnalysis.testStyle = 'unit';
            this._fileAnalysis.testHeaderLine = sourceLine;
          }
        }
        if (rspecRequireRegExp.test(sourceLine)) {
          this._fileAnalysis.testStyle = 'spec';
          this._fileAnalysis.framework = 'rspec';
          break;
        } else if (rspecAssertionRegExp.test(sourceLine)) {
          this._fileAnalysis.testStyle = 'spec';
          this._fileAnalysis.framework = 'rspec';
          break;
        } else if (this._fileAnalysis.testStyle === 'unit' && minitestClassRegExp.test(sourceLine)) {
          this._fileAnalysis.framework = 'minitest';
          return this._fileAnalysis;
        }
        i--;
      }
      if (this._fileAnalysis.framework !== 'rspec' && this._fileAnalysis.testStyle === 'spec') {
        this._fileAnalysis.framework = 'minitest';
      }
      return this._fileAnalysis;
    };

    SourceInfo.prototype.testFramework = function() {
      var t;
      return this._testFramework || (this._testFramework = !this._testFramework ? ((t = this.fileType()) && this.frameworkLookup[t]) || (fs.existsSync(this.projectPath() + '/.rspec') && 'rspec') || this.projectType() : void 0);
    };

    SourceInfo.prototype.fileType = function() {
      var matches;
      return this._fileType || (this._fileType = this._fileType === void 0 ? !this.activeFile() ? null : (matches = this.activeFile().match(/_(test|spec)\.rb|.(py)$/)) ? matches[1] === 'test' && atom.config.get("ruby-test.testFramework") ? atom.config.get("ruby-test.testFramework") : matches[1] === 'spec' && atom.config.get("ruby-test.specFramework") ? atom.config.get("ruby-test.specFramework") : this.fileFramework() === 'minitest' || (!this.fileFramework() && matches[1] === 'test' && this.testStyle() === 'spec') ? 'minitest' : matches[1] === 'spec' ? 'rspec' : matches[2] === 'py' ? 'python' : 'test' : (matches = this.activeFile().match(/\.(feature)$/)) ? matches[1] : void 0 : void 0);
    };

    SourceInfo.prototype.projectType = function() {
      if (fs.existsSync(this.projectPath() + '/test')) {
        return atom.config.get("ruby-test.testFramework") || 'test';
      } else if (fs.existsSync(this.projectPath() + '/spec')) {
        return atom.config.get("ruby-test.specFramework") || 'rspec';
      } else if (fs.existsSync(this.projectPath() + '/features')) {
        return 'cucumber';
      } else {
        return null;
      }
    };

    SourceInfo.prototype.filePath = function() {
      var util;
      util = new Utility;
      return util.filePath();
    };

    return SourceInfo;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9hYmVsYS8uYXRvbS9wYWNrYWdlcy9hdG9tLXRlc3QtcnVubmVyL2xpYi9zb3VyY2UtaW5mby5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxPQUFBLEdBQVUsT0FBQSxDQUFRLFdBQVI7O0VBRVYsTUFBTSxDQUFDLE9BQVAsR0FFUTs7O3lCQUNKLGVBQUEsR0FDRTtNQUFBLElBQUEsRUFBUyxNQUFUO01BQ0EsSUFBQSxFQUFTLE9BRFQ7TUFFQSxLQUFBLEVBQVMsT0FGVDtNQUdBLE9BQUEsRUFBUyxVQUhUO01BSUEsUUFBQSxFQUFVLFVBSlY7TUFLQSxNQUFBLEVBQVEsUUFMUjs7O3lCQU9GLGtCQUFBLEdBQ0U7TUFBQSxJQUFBLEVBQU0sYUFBTjtNQUNBLElBQUEsRUFBTSxxQkFETjs7O3lCQUdGLFlBQUEsR0FBYyxTQUFBO2FBQ1osSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGlCQUFoQixDQUFBLElBQXNDO0lBRDFCOzt5QkFHZCxXQUFBLEdBQWEsU0FBQTtBQUNYLFVBQUE7TUFBQSxXQUFBLEdBQWMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFiLENBQUEsQ0FBd0IsQ0FBQSxDQUFBO01BQ3RDLElBQUcsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFIO0FBQ0U7QUFBQSxhQUFBLHFDQUFBOztVQUNFLElBQUcsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFXLENBQUMsT0FBWixDQUFvQixJQUFwQixDQUFBLEtBQTZCLENBQWhDO0FBQ0UsbUJBQU8sS0FEVDs7QUFERjtBQUdBLGVBQU8sWUFKVDtPQUFBLE1BQUE7ZUFNRSxZQU5GOztJQUZXOzt5QkFVYixVQUFBLEdBQVksU0FBQTtBQUNWLFVBQUE7YUFBQSxJQUFDLENBQUEsZ0JBQUQsSUFBQyxDQUFBLGNBQWdCLENBQUMs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RyxHQUdILE1BWkMsR0FhRyxDQUFBLE9BQUEsR0FBVSxJQUFDLENBQUEsVUFBRCxDQUFBLENBQWEsQ0FBQyxLQUFkLENBQW9CLGNBQXBCLENBQVYsQ0FBSCxHQUNILE9BQVEsQ0FBQSxDQUFBLENBREwsR0FBQSxNQWpCUSxHQUFBO0lBRFA7O3lCQXFCVixXQUFBLEdBQWEsU0FBQTtNQUNYLElBQUcsRUFBRSxDQUFDLFVBQUgsQ0FBYyxJQUFDLENBQUEsV0FBRCxDQUFBLENBQUEsR0FBaUIsT0FBL0IsQ0FBSDtlQUNFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix5QkFBaEIsQ0FBQSxJQUE4QyxPQURoRDtPQUFBLE1BRUssSUFBRyxFQUFFLENBQUMsVUFBSCxDQUFjLElBQUMsQ0FBQSxXQUFELENBQUEsQ0FBQSxHQUFpQixPQUEvQixDQUFIO2VBQ0gsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHlCQUFoQixDQUFBLElBQThDLFFBRDNDO09BQUEsTUFFQSxJQUFHLEVBQUUsQ0FBQyxVQUFILENBQWMsSUFBQyxDQUFBLFdBQUQsQ0FBQSxDQUFBLEdBQWlCLFdBQS9CLENBQUg7ZUFDSCxXQURHO09BQUEsTUFBQTtlQUdILEtBSEc7O0lBTE07O3lCQVViLFFBQUEsR0FBVSxTQUFBO0FBQ1IsVUFBQTtNQUFBLElBQUEsR0FBTyxJQUFJO2FBQ1gsSUFBSSxDQUFDLFFBQUwsQ0FBQTtJQUZROzs7OztBQTFKZCIsInNvdXJjZXNDb250ZW50IjpbImZzID0gcmVxdWlyZSgnZnMnKVxuVXRpbGl0eSA9IHJlcXVpcmUgJy4vdXRpbGl0eSdcblxubW9kdWxlLmV4cG9ydHMgPVxuICAjIFByb3ZpZGVzIGluZm9ybWF0aW9uIGFib3V0IHRoZSBzb3VyY2UgY29kZSBiZWluZyB0ZXN0ZWRcbiAgY2xhc3MgU291cmNlSW5mb1xuICAgIGZyYW1ld29ya0xvb2t1cDpcbiAgICAgIHRlc3Q6ICAgICd0ZXN0J1xuICAgICAgc3BlYzogICAgJ3JzcGVjJ1xuICAgICAgcnNwZWM6ICAgJ3JzcGVjJ1xuICAgICAgZmVhdHVyZTogJ2N1Y3VtYmVyJ1xuICAgICAgbWluaXRlc3Q6ICdtaW5pdGVzdCdcbiAgICAgIHB5dGhvbjogJ3B5dGhvbidcblxuICAgIHJlZ0V4cEZvclRlc3RTdHlsZTpcbiAgICAgIHVuaXQ6IC9kZWZcXHMoLio/KSQvXG4gICAgICBzcGVjOiAvKD86XCJ8JykoLio/KSg/OlwifCcpL1xuXG4gICAgY3VycmVudFNoZWxsOiAtPlxuICAgICAgYXRvbS5jb25maWcuZ2V0KCdydWJ5LXRlc3Quc2hlbGwnKSB8fCAnYmFzaCdcblxuICAgIHByb2plY3RQYXRoOiAtPlxuICAgICAgZGVmYXVsdFBhdGggPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVswXVxuICAgICAgaWYgQGZpbGVQYXRoKClcbiAgICAgICAgZm9yIHBhdGggaW4gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClcbiAgICAgICAgICBpZiBAZmlsZVBhdGgoKS5pbmRleE9mKHBhdGgpID09IDBcbiAgICAgICAgICAgIHJldHVybiBwYXRoXG4gICAgICAgIHJldHVybiBkZWZhdWx0UGF0aFxuICAgICAgZWxzZVxuICAgICAgICBkZWZhdWx0UGF0aFxuXG4gICAgYWN0aXZlRmlsZTogLT5cbiAgICAgIEBfYWN0aXZlRmlsZSB8fD0gKGZwID0gQGZpbGVQYXRoKCkpIGFuZCBhdG9tLnByb2plY3QucmVsYXRpdml6ZShmcClcblxuICAgIGN1cnJlbnRMaW5lOiAtPlxuICAgICAgQF9jdXJyZW50TGluZSB8fD0gdW5sZXNzIEBfY3VycmVudExpbmVcbiAgICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICAgIGN1cnNvciA9IGVkaXRvciBhbmQgZWRpdG9yLmdldExhc3RDdXJzb3IoKVxuICAgICAgICBpZiBjdXJzb3JcbiAgICAgICAgICBjdXJzb3IuZ2V0QnVmZmVyUm93KCkgKyAxXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBudWxsXG5cbiAgICBtaW5pdGVzdFJlZ0V4cDogLT5cbiAgICAgIHJldHVybiBAX21pbml0ZXN0UmVnRXhwIGlmIEBfbWluaXRlc3RSZWdFeHAgIT0gdW5kZWZpbmVkXG4gICAgICBmaWxlID0gQGZpbGVBbmFseXNpcygpXG4gICAgICBAX21pbml0ZXN0UmVnRXhwID0gQGV4dHJhY3RNaW5pdGVzdFJlZ0V4cChmaWxlLnRlc3RIZWFkZXJMaW5lLCBmaWxlLnRlc3RTdHlsZSlcblxuICAgIGV4dHJhY3RNaW5pdGVzdFJlZ0V4cDogKHRlc3RIZWFkZXJMaW5lLCB0ZXN0U3R5bGUpLT5cbiAgICAgIHJlZ0V4cCA9IEByZWdFeHBGb3JUZXN0U3R5bGVbdGVzdFN0eWxlXVxuICAgICAgbWF0Y2ggPSB0ZXN0SGVhZGVyTGluZT8gYW5kIHRlc3RIZWFkZXJMaW5lLm1hdGNoKHJlZ0V4cCkgb3IgbnVsbFxuICAgICAgaWYgbWF0Y2hcbiAgICAgICAgbWF0Y2hbMV1cbiAgICAgIGVsc2VcbiAgICAgICAgXCJcIlxuXG4gICAgZmlsZUZyYW1ld29yazogLT5cbiAgICAgIEBmaWxlQW5hbHlzaXMoKSB1bmxlc3MgQF9maWxlQW5hbHlzaXNcbiAgICAgIEBfZmlsZUFuYWx5c2lzLmZyYW1ld29ya1xuXG4gICAgdGVzdFN0eWxlOiAtPlxuICAgICAgQGZpbGVBbmFseXNpcygpIHVubGVzcyBAX2ZpbGVBbmFseXNpc1xuICAgICAgQF9maWxlQW5hbHlzaXMudGVzdFN0eWxlXG5cbiAgICBmaWxlQW5hbHlzaXM6IC0+XG4gICAgICByZXR1cm4gQF9maWxlQW5hbHlzaXMgaWYgQF9maWxlQW5hbHlzaXMgIT0gdW5kZWZpbmVkXG5cbiAgICAgIEBfZmlsZUFuYWx5c2lzID1cbiAgICAgICAgdGVzdEhlYWRlckxpbmU6IG51bGxcbiAgICAgICAgdGVzdFN0eWxlOiBudWxsXG4gICAgICAgIGZyYW1ld29yazogbnVsbFxuXG4gICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgIGkgPSBAY3VycmVudExpbmUoKSAtIDFcbiAgICAgIHNwZWNSZWdFeHAgPSBuZXcgUmVnRXhwKC9cXGIoPzpzaG91bGR8dGVzdHxpdClcXHMrWydcIl0oLiopWydcIl1cXHMrZG9cXGIvKVxuICAgICAgcnNwZWNSZXF1aXJlUmVnRXhwID0gbmV3IFJlZ0V4cCgvXnJlcXVpcmUuKihyYWlsc3xzcGVjKV9oZWxwZXIvKVxuICAgICAgcnNwZWNBc3NlcnRpb25SZWdFeHAgPSBuZXcgUmVnRXhwKC9eXFxzKmV4cGVjdFxcKC8pXG4gICAgICBtaW5pdGVzdENsYXNzUmVnRXhwID0gbmV3IFJlZ0V4cCgvY2xhc3NcXHMoLiopPChcXHM/fFxccyspTWluaXRlc3Q6OlRlc3QvKVxuICAgICAgbWluaXRlc3RNZXRob2RSZWdFeHAgPSBuZXcgUmVnRXhwKC9eKFxccyspZGVmXFxzKC4qKSQvKVxuICAgICAgd2hpbGUgaSA+PSAwXG4gICAgICAgIHNvdXJjZUxpbmUgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coaSlcblxuICAgICAgICBpZiBub3QgQF9maWxlQW5hbHlzaXMudGVzdEhlYWRlckxpbmVcbiAgICAgICAgICAjIGNoZWNrIGlmIGl0IGlzIHJzcGVjIG9yIG1pbml0ZXN0IHNwZWNcbiAgICAgICAgICBpZiByZXMgPSBzb3VyY2VMaW5lLm1hdGNoKHNwZWNSZWdFeHApXG4gICAgICAgICAgICBAX21pbml0ZXN0UmVnRXhwID0gcmVzWzFdXG4gICAgICAgICAgICBAX2ZpbGVBbmFseXNpcy50ZXN0U3R5bGUgPSAnc3BlYydcbiAgICAgICAgICAgIEBfZmlsZUFuYWx5c2lzLnRlc3RIZWFkZXJMaW5lID0gc291cmNlTGluZVxuXG4gICAgICAgICAgIyBjaGVjayBpZiBpdCBpcyBtaW5pdGVzdCB1bml0XG4gICAgICAgICAgZWxzZSBpZiBtaW5pdGVzdE1ldGhvZFJlZ0V4cC50ZXN0KHNvdXJjZUxpbmUpXG4gICAgICAgICAgICBAX2ZpbGVBbmFseXNpcy50ZXN0U3R5bGUgPSAndW5pdCdcbiAgICAgICAgICAgIEBfZmlsZUFuYWx5c2lzLnRlc3RIZWFkZXJMaW5lID0gc291cmNlTGluZVxuXG4gICAgICAgICMgaWYgaXQgaXMgc3BlYyBhbmQgaGFzIHJlcXVpcmUgc3BlY19oZWxwZXIgd2hpY2ggbWVhbnMgaXQgaXMgcnNwZWMgc3BlY1xuICAgICAgICBpZiByc3BlY1JlcXVpcmVSZWdFeHAudGVzdChzb3VyY2VMaW5lKVxuICAgICAgICAgIEBfZmlsZUFuYWx5c2lzLnRlc3RTdHlsZSA9ICdzcGVjJ1xuICAgICAgICAgIEBfZmlsZUFuYWx5c2lzLmZyYW1ld29yayA9ICdyc3BlYydcbiAgICAgICAgICBicmVha1xuXG4gICAgICAgIGVsc2UgaWYgcnNwZWNBc3NlcnRpb25SZWdFeHAudGVzdChzb3VyY2VMaW5lKVxuICAgICAgICAgIEBfZmlsZUFuYWx5c2lzLnRlc3RTdHlsZSA9ICdzcGVjJ1xuICAgICAgICAgIEBfZmlsZUFuYWx5c2lzLmZyYW1ld29yayA9ICdyc3BlYydcbiAgICAgICAgICBicmVha1xuXG4gICAgICAgICMgaWYgaXQgaXMgdW5pdCB0ZXN0IGFuZCBpbmhlcml0IGZyb20gTWluaXRlc3Q6OlVuaXRcbiAgICAgICAgZWxzZSBpZiBAX2ZpbGVBbmFseXNpcy50ZXN0U3R5bGUgPT0gJ3VuaXQnICYmIG1pbml0ZXN0Q2xhc3NSZWdFeHAudGVzdChzb3VyY2VMaW5lKVxuICAgICAgICAgIEBfZmlsZUFuYWx5c2lzLmZyYW1ld29yayA9ICdtaW5pdGVzdCdcbiAgICAgICAgICByZXR1cm4gQF9maWxlQW5hbHlzaXNcblxuICAgICAgICBpLS1cblxuICAgICAgaWYgQF9maWxlQW5hbHlzaXMuZnJhbWV3b3JrICE9ICdyc3BlYycgYW5kIEBfZmlsZUFuYWx5c2lzLnRlc3RTdHlsZSA9PSAnc3BlYydcbiAgICAgICAgQF9maWxlQW5hbHlzaXMuZnJhbWV3b3JrID0gJ21pbml0ZXN0J1xuXG4gICAgICBAX2ZpbGVBbmFseXNpc1xuXG4gICAgdGVzdEZyYW1ld29yazogLT5cbiAgICAgIEBfdGVzdEZyYW1ld29yayB8fD0gdW5sZXNzIEBfdGVzdEZyYW1ld29ya1xuICAgICAgICAoKHQgPSBAZmlsZVR5cGUoKSkgYW5kIEBmcmFtZXdvcmtMb29rdXBbdF0pIG9yXG4gICAgICAgIChmcy5leGlzdHNTeW5jKEBwcm9qZWN0UGF0aCgpICsgJy8ucnNwZWMnKSBhbmQgJ3JzcGVjJykgb3JcbiAgICAgICAgQHByb2plY3RUeXBlKClcblxuICAgIGZpbGVUeXBlOiAtPlxuICAgICAgQF9maWxlVHlwZSB8fD0gaWYgQF9maWxlVHlwZSA9PSB1bmRlZmluZWRcblxuICAgICAgICBpZiBub3QgQGFjdGl2ZUZpbGUoKVxuICAgICAgICAgIG51bGxcbiAgICAgICAgZWxzZSBpZiBtYXRjaGVzID0gQGFjdGl2ZUZpbGUoKS5tYXRjaCgvXyh0ZXN0fHNwZWMpXFwucmJ8LihweSkkLylcbiAgICAgICAgICBpZiBtYXRjaGVzWzFdID09ICd0ZXN0JyBhbmQgYXRvbS5jb25maWcuZ2V0KFwicnVieS10ZXN0LnRlc3RGcmFtZXdvcmtcIilcbiAgICAgICAgICAgIGF0b20uY29uZmlnLmdldChcInJ1YnktdGVzdC50ZXN0RnJhbWV3b3JrXCIpXG4gICAgICAgICAgZWxzZSBpZiBtYXRjaGVzWzFdID09ICdzcGVjJyBhbmQgYXRvbS5jb25maWcuZ2V0KFwicnVieS10ZXN0LnNwZWNGcmFtZXdvcmtcIilcbiAgICAgICAgICAgIGF0b20uY29uZmlnLmdldChcInJ1YnktdGVzdC5zcGVjRnJhbWV3b3JrXCIpXG4gICAgICAgICAgZWxzZSBpZiBAZmlsZUZyYW1ld29yaygpID09ICdtaW5pdGVzdCcgb3IgKG5vdCBAZmlsZUZyYW1ld29yaygpIGFuZCBtYXRjaGVzWzFdID09ICd0ZXN0JyBhbmQgQHRlc3RTdHlsZSgpID09ICdzcGVjJylcbiAgICAgICAgICAgICdtaW5pdGVzdCdcbiAgICAgICAgICBlbHNlIGlmIG1hdGNoZXNbMV0gPT0gJ3NwZWMnXG4gICAgICAgICAgICAncnNwZWMnXG4gICAgICAgICAgZWxzZSBpZiBtYXRjaGVzWzJdID09ICdweSdcbiAgICAgICAgICAgICdweXRob24nXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgJ3Rlc3QnXG4gICAgICAgIGVsc2UgaWYgbWF0Y2hlcyA9IEBhY3RpdmVGaWxlKCkubWF0Y2goL1xcLihmZWF0dXJlKSQvKVxuICAgICAgICAgIG1hdGNoZXNbMV1cblxuICAgIHByb2plY3RUeXBlOiAtPlxuICAgICAgaWYgZnMuZXhpc3RzU3luYyhAcHJvamVjdFBhdGgoKSArICcvdGVzdCcpXG4gICAgICAgIGF0b20uY29uZmlnLmdldChcInJ1YnktdGVzdC50ZXN0RnJhbWV3b3JrXCIpIHx8ICd0ZXN0J1xuICAgICAgZWxzZSBpZiBmcy5leGlzdHNTeW5jKEBwcm9qZWN0UGF0aCgpICsgJy9zcGVjJylcbiAgICAgICAgYXRvbS5jb25maWcuZ2V0KFwicnVieS10ZXN0LnNwZWNGcmFtZXdvcmtcIikgfHwgJ3JzcGVjJ1xuICAgICAgZWxzZSBpZiBmcy5leGlzdHNTeW5jKEBwcm9qZWN0UGF0aCgpICsgJy9mZWF0dXJlcycpXG4gICAgICAgICdjdWN1bWJlcidcbiAgICAgIGVsc2VcbiAgICAgICAgbnVsbFxuXG4gICAgZmlsZVBhdGg6IC0+XG4gICAgICB1dGlsID0gbmV3IFV0aWxpdHlcbiAgICAgIHV0aWwuZmlsZVBhdGgoKVxuIl19
