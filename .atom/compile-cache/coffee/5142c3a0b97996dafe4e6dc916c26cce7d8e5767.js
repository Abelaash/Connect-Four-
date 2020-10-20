(function() {
  var Command, ShellRunner, SourceInfo, TestRunner,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  ShellRunner = require('./shell-runner');

  SourceInfo = require('./source-info');

  Command = require('./command');

  module.exports = TestRunner = (function() {
    function TestRunner(params) {
      this.command = bind(this.command, this);
      this.initialize(params);
    }

    TestRunner.prototype.initialize = function(params) {
      this.params = params;
      this.panel = params.panel;
      return this.sourceInfo = new SourceInfo();
    };

    TestRunner.prototype.run = function() {
      this.shell = new ShellRunner(this.shellRunnerParams());
      this.params.setTestInfo(this.command());
      return this.shell.run();
    };

    TestRunner.prototype.shellRunnerParams = function() {
      return {
        write: this.params.write,
        exit: this.params.exit,
        command: this.command,
        cwd: (function(_this) {
          return function() {
            return _this.sourceInfo.projectPath();
          };
        })(this),
        currentShell: this.sourceInfo.currentShell(),
        panel: this.panel
      };
    };

    TestRunner.prototype.command = function() {
      var cmd, framework;
      framework = this.sourceInfo.testFramework();
      cmd = Command.testCommand(this.params.testScope, framework);
      return cmd.replace('{relative_path}', this.sourceInfo.activeFile()).replace('{line_number}', this.sourceInfo.currentLine()).replace('{regex}', this.sourceInfo.minitestRegExp());
    };

    TestRunner.prototype.cancel = function() {
      return this.shell.kill();
    };

    return TestRunner;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9hYmVsYS8uYXRvbS9wYWNrYWdlcy9hdG9tLXRlc3QtcnVubmVyL2xpYi90ZXN0LXJ1bm5lci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDRDQUFBO0lBQUE7O0VBQUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUjs7RUFDZCxVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVI7O0VBQ2IsT0FBQSxHQUFVLE9BQUEsQ0FBUSxXQUFSOztFQUVWLE1BQU0sQ0FBQyxPQUFQLEdBQ1E7SUFDUyxvQkFBQyxNQUFEOztNQUNYLElBQUMsQ0FBQSxVQUFELENBQVksTUFBWjtJQURXOzt5QkFHYixVQUFBLEdBQVksU0FBQyxNQUFEO01BQ1YsSUFBQyxDQUFBLE1BQUQsR0FBVTtNQUNWLElBQUMsQ0FBQSxLQUFELEdBQVMsTUFBTSxDQUFDO2FBQ2hCLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBSSxVQUFKLENBQUE7SUFISjs7eUJBS1osR0FBQSxHQUFLLFNBQUE7TUFDSCxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUksV0FBSixDQUFnQixJQUFDLENBQUEsaUJBQUQsQ0FBQSxDQUFoQjtNQUNULElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBUixDQUFvQixJQUFDLENBQUEsT0FBRCxDQUFBLENBQXBCO2FBQ0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQUE7SUFIRzs7eUJBS0wsaUJBQUEsR0FBbUIsU0FBQTthQUNqQjtRQUFBLEtBQUEsRUFBUyxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQWpCO1FBQ0EsSUFBQSxFQUFTLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFEakI7UUFFQSxPQUFBLEVBQVMsSUFBQyxDQUFBLE9BRlY7UUFHQSxHQUFBLEVBQVMsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsVUFBVSxDQUFDLFdBQVosQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUhUO1FBSUEsWUFBQSxFQUFjLElBQUMsQ0FBQSxVQUFVLENBQUMsWUFBWixDQUFBLENBSmQ7UUFLQSxLQUFBLEVBQU8sSUFBQyxDQUFBLEtBTFI7O0lBRGlCOzt5QkFRbkIsT0FBQSxHQUFTLFNBQUE7QUFDUCxVQUFBO01BQUEsU0FBQSxHQUFZLElBQUMsQ0FBQSxVQUFVLENBQUMsYUFBWixDQUFBO01BQ1osR0FBQSxHQUFNLE9BQU8sQ0FBQyxXQUFSLENBQW9CLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBNUIsRUFBdUMsU0FBdkM7YUFDTixHQUFHLENBQUMsT0FBSixDQUFZLGlCQUFaLEVBQStCLElBQUMsQ0FBQSxVQUFVLENBQUMsVUFBWixDQUFBLENBQS9CLENBQXdELENBQ3BELE9BREosQ0FDWSxlQURaLEVBQzZCLElBQUMsQ0FBQSxVQUFVLENBQUMsV0FBWixDQUFBLENBRDdCLENBQ3VELENBQ25ELE9BRkosQ0FFWSxTQUZaLEVBRXVCLElBQUMsQ0FBQSxVQUFVLENBQUMsY0FBWixDQUFBLENBRnZCO0lBSE87O3lCQU9ULE1BQUEsR0FBUSxTQUFBO2FBQ04sSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQUE7SUFETTs7Ozs7QUFsQ1oiLCJzb3VyY2VzQ29udGVudCI6WyJTaGVsbFJ1bm5lciA9IHJlcXVpcmUgJy4vc2hlbGwtcnVubmVyJ1xuU291cmNlSW5mbyA9IHJlcXVpcmUgJy4vc291cmNlLWluZm8nXG5Db21tYW5kID0gcmVxdWlyZSAnLi9jb21tYW5kJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGNsYXNzIFRlc3RSdW5uZXJcbiAgICBjb25zdHJ1Y3RvcjogKHBhcmFtcykgLT5cbiAgICAgIEBpbml0aWFsaXplIHBhcmFtc1xuXG4gICAgaW5pdGlhbGl6ZTogKHBhcmFtcykgLT5cbiAgICAgIEBwYXJhbXMgPSBwYXJhbXNcbiAgICAgIEBwYW5lbCA9IHBhcmFtcy5wYW5lbFxuICAgICAgQHNvdXJjZUluZm8gPSBuZXcgU291cmNlSW5mbygpXG5cbiAgICBydW46IC0+XG4gICAgICBAc2hlbGwgPSBuZXcgU2hlbGxSdW5uZXIoQHNoZWxsUnVubmVyUGFyYW1zKCkpXG4gICAgICBAcGFyYW1zLnNldFRlc3RJbmZvKEBjb21tYW5kKCkpXG4gICAgICBAc2hlbGwucnVuKClcblxuICAgIHNoZWxsUnVubmVyUGFyYW1zOiAtPlxuICAgICAgd3JpdGU6ICAgQHBhcmFtcy53cml0ZVxuICAgICAgZXhpdDogICAgQHBhcmFtcy5leGl0XG4gICAgICBjb21tYW5kOiBAY29tbWFuZFxuICAgICAgY3dkOiAgICAgPT4gQHNvdXJjZUluZm8ucHJvamVjdFBhdGgoKVxuICAgICAgY3VycmVudFNoZWxsOiBAc291cmNlSW5mby5jdXJyZW50U2hlbGwoKVxuICAgICAgcGFuZWw6IEBwYW5lbFxuXG4gICAgY29tbWFuZDogPT5cbiAgICAgIGZyYW1ld29yayA9IEBzb3VyY2VJbmZvLnRlc3RGcmFtZXdvcmsoKVxuICAgICAgY21kID0gQ29tbWFuZC50ZXN0Q29tbWFuZChAcGFyYW1zLnRlc3RTY29wZSwgZnJhbWV3b3JrKVxuICAgICAgY21kLnJlcGxhY2UoJ3tyZWxhdGl2ZV9wYXRofScsIEBzb3VyY2VJbmZvLmFjdGl2ZUZpbGUoKSkuXG4gICAgICAgICAgcmVwbGFjZSgne2xpbmVfbnVtYmVyfScsIEBzb3VyY2VJbmZvLmN1cnJlbnRMaW5lKCkpLlxuICAgICAgICAgIHJlcGxhY2UoJ3tyZWdleH0nLCBAc291cmNlSW5mby5taW5pdGVzdFJlZ0V4cCgpKVxuXG4gICAgY2FuY2VsOiAtPlxuICAgICAgQHNoZWxsLmtpbGwoKVxuIl19
