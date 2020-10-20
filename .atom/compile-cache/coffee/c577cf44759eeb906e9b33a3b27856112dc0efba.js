(function() {
  var $, Convert, ResizeHandle, RubyTestView, SourceInfo, TestRunner, Utility, View, _, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _ = require('underscore-plus');

  ref = require('atom-space-pen-views'), $ = ref.$, View = ref.View;

  TestRunner = require('./test-runner');

  ResizeHandle = require('./resize-handle');

  Utility = require('./utility');

  SourceInfo = require('./source-info');

  Convert = require('ansi-to-html');

  module.exports = RubyTestView = (function(superClass) {
    extend(RubyTestView, superClass);

    function RubyTestView() {
      this.write = bind(this.write, this);
      this.onTestRunEnd = bind(this.onTestRunEnd, this);
      this.setTestInfo = bind(this.setTestInfo, this);
      return RubyTestView.__super__.constructor.apply(this, arguments);
    }

    RubyTestView.content = function() {
      return this.div({
        "class": "ruby-test inset-panel panel-bottom native-key-bindings",
        tabindex: -1
      }, (function(_this) {
        return function() {
          _this.div({
            "class": "ruby-test-resize-handle"
          });
          _this.div({
            "class": "panel-heading"
          }, function() {
            _this.span('Running tests: ');
            _this.span({
              outlet: 'header'
            });
            return _this.div({
              "class": "heading-buttons pull-right inline-block"
            }, function() {
              return _this.div({
                click: 'closePanel',
                "class": "heading-close icon-x inline-block"
              });
            });
          });
          return _this.div({
            "class": "panel-body"
          }, function() {
            _this.div({
              "class": 'ruby-test-spinner'
            }, 'Starting...');
            return _this.pre("", {
              outlet: 'results'
            });
          });
        };
      })(this));
    };

    RubyTestView.prototype.initialize = function(serializeState) {
      var sourceInfo;
      sourceInfo = new SourceInfo();
      this.results.on('click', function(e) {
        var file, line, promise, ref1;
        if ((ref1 = e.target) != null ? ref1.href : void 0) {
          line = $(e.target).data('line');
          file = $(e.target).data('file');
          if (!file.startsWith("/")) {
            file = (sourceInfo.projectPath()) + "/" + file;
          }
          promise = atom.workspace.open(file, {
            searchAllPanes: true,
            initialLine: line
          });
          return promise.done(function(editor) {
            return editor.setCursorBufferPosition([line - 1, 0]);
          });
        }
      });
      atom.commands.add("atom-workspace", "ruby-test:toggle", (function(_this) {
        return function() {
          return _this.toggle();
        };
      })(this));
      atom.commands.add("atom-workspace", "ruby-test:test-file", (function(_this) {
        return function() {
          return _this.testFile();
        };
      })(this));
      atom.commands.add("atom-workspace", "ruby-test:test-single", (function(_this) {
        return function() {
          return _this.testSingle();
        };
      })(this));
      atom.commands.add("atom-workspace", "ruby-test:test-previous", (function(_this) {
        return function() {
          return _this.testPrevious();
        };
      })(this));
      atom.commands.add("atom-workspace", "ruby-test:test-all", (function(_this) {
        return function() {
          return _this.testAll();
        };
      })(this));
      atom.commands.add("atom-workspace", "ruby-test:cancel", (function(_this) {
        return function() {
          return _this.cancelTest();
        };
      })(this));
      return new ResizeHandle(this);
    };

    RubyTestView.prototype.serialize = function() {};

    RubyTestView.prototype.destroy = function() {
      this.output = '';
      return this.detach();
    };

    RubyTestView.prototype.closePanel = function() {
      if (this.hasParent()) {
        return this.detach();
      }
    };

    RubyTestView.prototype.toggle = function() {
      if (this.hasParent()) {
        return this.detach();
      } else {
        this.showPanel();
        if (!this.runner) {
          this.spinner.hide();
          return this.setTestInfo("No tests running");
        }
      }
    };

    RubyTestView.prototype.testFile = function() {
      return this.runTest();
    };

    RubyTestView.prototype.testSingle = function() {
      return this.runTest({
        testScope: "single"
      });
    };

    RubyTestView.prototype.testAll = function() {
      return this.runTest({
        testScope: "all"
      });
    };

    RubyTestView.prototype.testPrevious = function() {
      if (!this.runner) {
        return;
      }
      this.saveFile();
      this.newTestView();
      return this.runner.run();
    };

    RubyTestView.prototype.runTest = function(overrideParams) {
      var params;
      this.saveFile();
      this.newTestView();
      params = _.extend({}, this.testRunnerParams(), overrideParams || {});
      this.runner = new TestRunner(params);
      this.runner.run();
      return this.spinner.show();
    };

    RubyTestView.prototype.newTestView = function() {
      this.output = '';
      this.flush();
      return this.showPanel();
    };

    RubyTestView.prototype.testRunnerParams = function() {
      return {
        write: this.write,
        exit: this.onTestRunEnd,
        setTestInfo: this.setTestInfo,
        panel: this
      };
    };

    RubyTestView.prototype.setTestInfo = function(infoStr) {
      return this.header.text(infoStr);
    };

    RubyTestView.prototype.onTestRunEnd = function() {
      return null;
    };

    RubyTestView.prototype.showPanel = function() {
      if (!this.hasParent()) {
        atom.workspace.addRightPanel({
          item: this
        });
        return this.spinner = this.find('.ruby-test-spinner');
      }
    };

    RubyTestView.prototype.write = function(str) {
      var convert, converted;
      if (this.spinner) {
        this.spinner.hide();
      }
      this.output || (this.output = '');
      convert = new Convert({
        escapeXML: true
      });
      converted = convert.toHtml(str).replace(/[^\s\[\]<>"'&;]+\.rb:[0-9]+/g, (function(_this) {
        return function(s) {
          var file, line, ref1;
          ref1 = s.split(":"), file = ref1[0], line = ref1[1];
          return "<a href=\"" + file + "\" data-line=\"" + line + "\" data-file=\"" + file + "\">" + s + "</a>";
        };
      })(this));
      this.output += converted;
      return this.flush();
    };

    RubyTestView.prototype.flush = function() {
      this.results.html(this.output);
      return this.results.parent().scrollTop(this.results.innerHeight());
    };

    RubyTestView.prototype.cancelTest = function() {
      var ref1;
      this.runner.cancel();
      if ((ref1 = this.spinner) != null) {
        ref1.hide();
      }
      return this.write('\nTests canceled');
    };

    RubyTestView.prototype.saveFile = function() {
      var util;
      util = new Utility;
      return util.saveFile();
    };

    return RubyTestView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9hYmVsYS8uYXRvbS9wYWNrYWdlcy9hdG9tLXRlc3QtcnVubmVyL2xpYi9ydWJ5LXRlc3Qtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHFGQUFBO0lBQUE7Ozs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLE1BQVcsT0FBQSxDQUFRLHNCQUFSLENBQVgsRUFBQyxTQUFELEVBQUc7O0VBQ0gsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSOztFQUNiLFlBQUEsR0FBZSxPQUFBLENBQVEsaUJBQVI7O0VBQ2YsT0FBQSxHQUFVLE9BQUEsQ0FBUSxXQUFSOztFQUNWLFVBQUEsR0FBYSxPQUFBLENBQVEsZUFBUjs7RUFDYixPQUFBLEdBQVUsT0FBQSxDQUFRLGNBQVI7O0VBRVYsTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7Ozs7OztJQUNKLFlBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHdEQUFQO1FBQWlFLFFBQUEsRUFBVSxDQUFDLENBQTVFO09BQUwsRUFBb0YsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ2xGLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHlCQUFQO1dBQUw7VUFDQSxLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxlQUFQO1dBQUwsRUFBNkIsU0FBQTtZQUMzQixLQUFDLENBQUEsSUFBRCxDQUFNLGlCQUFOO1lBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTTtjQUFBLE1BQUEsRUFBUSxRQUFSO2FBQU47bUJBQ0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8seUNBQVA7YUFBTCxFQUF1RCxTQUFBO3FCQUNyRCxL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QUE7SUFGUTs7OztLQXRIZTtBQVQzQiIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG57JCxWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuVGVzdFJ1bm5lciA9IHJlcXVpcmUgJy4vdGVzdC1ydW5uZXInXG5SZXNpemVIYW5kbGUgPSByZXF1aXJlICcuL3Jlc2l6ZS1oYW5kbGUnXG5VdGlsaXR5ID0gcmVxdWlyZSAnLi91dGlsaXR5J1xuU291cmNlSW5mbyA9IHJlcXVpcmUgJy4vc291cmNlLWluZm8nXG5Db252ZXJ0ID0gcmVxdWlyZSAnYW5zaS10by1odG1sJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBSdWJ5VGVzdFZpZXcgZXh0ZW5kcyBWaWV3XG4gIEBjb250ZW50OiAtPlxuICAgIEBkaXYgY2xhc3M6IFwicnVieS10ZXN0IGluc2V0LXBhbmVsIHBhbmVsLWJvdHRvbSBuYXRpdmUta2V5LWJpbmRpbmdzXCIsIHRhYmluZGV4OiAtMSwgPT5cbiAgICAgIEBkaXYgY2xhc3M6IFwicnVieS10ZXN0LXJlc2l6ZS1oYW5kbGVcIlxuICAgICAgQGRpdiBjbGFzczogXCJwYW5lbC1oZWFkaW5nXCIsID0+XG4gICAgICAgIEBzcGFuICdSdW5uaW5nIHRlc3RzOiAnXG4gICAgICAgIEBzcGFuIG91dGxldDogJ2hlYWRlcidcbiAgICAgICAgQGRpdiBjbGFzczogXCJoZWFkaW5nLWJ1dHRvbnMgcHVsbC1yaWdodCBpbmxpbmUtYmxvY2tcIiwgPT5cbiAgICAgICAgICBAZGl2IGNsaWNrOiAnY2xvc2VQYW5lbCcsIGNsYXNzOiBcImhlYWRpbmctY2xvc2UgaWNvbi14IGlubGluZS1ibG9ja1wiXG4gICAgICBAZGl2IGNsYXNzOiBcInBhbmVsLWJvZHlcIiwgPT5cbiAgICAgICAgQGRpdiBjbGFzczogJ3J1YnktdGVzdC1zcGlubmVyJywgJ1N0YXJ0aW5nLi4uJ1xuICAgICAgICBAcHJlIFwiXCIsIG91dGxldDogJ3Jlc3VsdHMnXG5cbiAgaW5pdGlhbGl6ZTogKHNlcmlhbGl6ZVN0YXRlKSAtPlxuICAgIHNvdXJjZUluZm8gPSBuZXcgU291cmNlSW5mbygpXG4gICAgQHJlc3VsdHMub24gJ2NsaWNrJywgKGUpIC0+XG4gICAgICBpZiBlLnRhcmdldD8uaHJlZlxuICAgICAgICBsaW5lID0gJChlLnRhcmdldCkuZGF0YSgnbGluZScpXG4gICAgICAgIGZpbGUgPSAkKGUudGFyZ2V0KS5kYXRhKCdmaWxlJylcbiAgICAgICAgaWYgIWZpbGUuc3RhcnRzV2l0aChcIi9cIilcbiAgICAgICAgICBmaWxlID0gXCIje3NvdXJjZUluZm8ucHJvamVjdFBhdGgoKX0vI3tmaWxlfVwiXG5cbiAgICAgICAgcHJvbWlzZSA9IGF0b20ud29ya3NwYWNlLm9wZW4oZmlsZSwgeyBzZWFyY2hBbGxQYW5lczogdHJ1ZSwgaW5pdGlhbExpbmU6IGxpbmUgfSlcbiAgICAgICAgcHJvbWlzZS5kb25lIChlZGl0b3IpIC0+XG4gICAgICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFtsaW5lLTEsIDBdKVxuICAgIGF0b20uY29tbWFuZHMuYWRkIFwiYXRvbS13b3Jrc3BhY2VcIiwgXCJydWJ5LXRlc3Q6dG9nZ2xlXCIsID0+IEB0b2dnbGUoKVxuICAgIGF0b20uY29tbWFuZHMuYWRkIFwiYXRvbS13b3Jrc3BhY2VcIiwgXCJydWJ5LXRlc3Q6dGVzdC1maWxlXCIsID0+IEB0ZXN0RmlsZSgpXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgXCJhdG9tLXdvcmtzcGFjZVwiLCBcInJ1YnktdGVzdDp0ZXN0LXNpbmdsZVwiLCA9PiBAdGVzdFNpbmdsZSgpXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgXCJhdG9tLXdvcmtzcGFjZVwiLCBcInJ1YnktdGVzdDp0ZXN0LXByZXZpb3VzXCIsID0+IEB0ZXN0UHJldmlvdXMoKVxuICAgIGF0b20uY29tbWFuZHMuYWRkIFwiYXRvbS13b3Jrc3BhY2VcIiwgXCJydWJ5LXRlc3Q6dGVzdC1hbGxcIiwgPT4gQHRlc3RBbGwoKVxuICAgIGF0b20uY29tbWFuZHMuYWRkIFwiYXRvbS13b3Jrc3BhY2VcIiwgXCJydWJ5LXRlc3Q6Y2FuY2VsXCIsID0+IEBjYW5jZWxUZXN0KClcbiAgICBuZXcgUmVzaXplSGFuZGxlKEApXG5cbiAgIyBSZXR1cm5zIGFuIG9iamVjdCB0aGF0IGNhbiBiZSByZXRyaWV2ZWQgd2hlbiBwYWNrYWdlIGlzIGFjdGl2YXRlZFxuICBzZXJpYWxpemU6IC0+XG5cbiAgIyBUZWFyIGRvd24gYW55IHN0YXRlIGFuZCBkZXRhY2hcbiAgZGVzdHJveTogLT5cbiAgICBAb3V0cHV0ID0gJydcbiAgICBAZGV0YWNoKClcblxuICBjbG9zZVBhbmVsOiAtPlxuICAgIGlmIEBoYXNQYXJlbnQoKVxuICAgICAgQGRldGFjaCgpXG5cbiAgdG9nZ2xlOiAtPlxuICAgIGlmIEBoYXNQYXJlbnQoKVxuICAgICAgQGRldGFjaCgpXG4gICAgZWxzZVxuICAgICAgQHNob3dQYW5lbCgpXG4gICAgICB1bmxlc3MgQHJ1bm5lclxuICAgICAgICBAc3Bpbm5lci5oaWRlKClcbiAgICAgICAgQHNldFRlc3RJbmZvKFwiTm8gdGVzdHMgcnVubmluZ1wiKVxuXG4gIHRlc3RGaWxlOiAtPlxuICAgIEBydW5UZXN0KClcblxuICB0ZXN0U2luZ2xlOiAtPlxuICAgIEBydW5UZXN0KHRlc3RTY29wZTogXCJzaW5nbGVcIilcblxuICB0ZXN0QWxsOiAtPlxuICAgIEBydW5UZXN0KHRlc3RTY29wZTogXCJhbGxcIilcblxuICB0ZXN0UHJldmlvdXM6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAcnVubmVyXG4gICAgQHNhdmVGaWxlKClcbiAgICBAbmV3VGVzdFZpZXcoKVxuICAgIEBydW5uZXIucnVuKClcblxuICBydW5UZXN0OiAob3ZlcnJpZGVQYXJhbXMpIC0+XG4gICAgQHNhdmVGaWxlKClcbiAgICBAbmV3VGVzdFZpZXcoKVxuICAgIHBhcmFtcyA9IF8uZXh0ZW5kKHt9LCBAdGVzdFJ1bm5lclBhcmFtcygpLCBvdmVycmlkZVBhcmFtcyB8fCB7fSlcbiAgICBAcnVubmVyID0gbmV3IFRlc3RSdW5uZXIocGFyYW1zKVxuICAgIEBydW5uZXIucnVuKClcbiAgICBAc3Bpbm5lci5zaG93KClcblxuICBuZXdUZXN0VmlldzogLT5cbiAgICBAb3V0cHV0ID0gJydcbiAgICBAZmx1c2goKVxuICAgIEBzaG93UGFuZWwoKVxuXG4gIHRlc3RSdW5uZXJQYXJhbXM6IC0+XG4gICAgd3JpdGU6IEB3cml0ZVxuICAgIGV4aXQ6IEBvblRlc3RSdW5FbmRcbiAgICBzZXRUZXN0SW5mbzogQHNldFRlc3RJbmZvXG4gICAgcGFuZWw6IEBcblxuICBzZXRUZXN0SW5mbzogKGluZm9TdHIpID0+XG4gICAgQGhlYWRlci50ZXh0KGluZm9TdHIpXG5cbiAgb25UZXN0UnVuRW5kOiA9PlxuICAgIG51bGxcblxuICBzaG93UGFuZWw6IC0+XG4gICAgdW5sZXNzIEBoYXNQYXJlbnQoKVxuICAgICAgYXRvbS53b3Jrc3BhY2UuYWRkUmlnaHRQYW5lbChpdGVtOiBAKVxuICAgICAgQHNwaW5uZXIgPSBAZmluZCgnLnJ1YnktdGVzdC1zcGlubmVyJylcblxuICB3cml0ZTogKHN0cikgPT5cbiAgICBAc3Bpbm5lci5oaWRlKCkgaWYgQHNwaW5uZXJcbiAgICBAb3V0cHV0IHx8PSAnJ1xuICAgIGNvbnZlcnQgPSBuZXcgQ29udmVydChlc2NhcGVYTUw6IHRydWUpXG4gICAgY29udmVydGVkID0gY29udmVydC50b0h0bWwoc3RyKS5yZXBsYWNlIC9bXlxcc1xcW1xcXTw+XCInJjtdK1xcLnJiOlswLTldKy9nLCAocykgPT5cbiAgICAgIFtmaWxlLCBsaW5lXSA9IHMuc3BsaXQoXCI6XCIpXG4gICAgICBcIjxhIGhyZWY9XFxcIiN7ZmlsZX1cXFwiIGRhdGEtbGluZT1cXFwiI3tsaW5lfVxcXCIgZGF0YS1maWxlPVxcXCIje2ZpbGV9XFxcIj4je3N9PC9hPlwiXG4gICAgQG91dHB1dCArPSBjb252ZXJ0ZWRcbiAgICBAZmx1c2goKVxuXG4gIGZsdXNoOiAtPlxuICAgIEByZXN1bHRzLmh0bWwoQG91dHB1dClcbiAgICBAcmVzdWx0cy5wYXJlbnQoKS5zY3JvbGxUb3AoQHJlc3VsdHMuaW5uZXJIZWlnaHQoKSlcblxuICBjYW5jZWxUZXN0OiAtPlxuICAgIEBydW5uZXIuY2FuY2VsKClcbiAgICBAc3Bpbm5lcj8uaGlkZSgpXG4gICAgQHdyaXRlKCdcXG5UZXN0cyBjYW5jZWxlZCcpXG5cbiAgc2F2ZUZpbGU6IC0+XG4gICAgdXRpbCA9IG5ldyBVdGlsaXR5XG4gICAgdXRpbC5zYXZlRmlsZSgpXG4iXX0=
