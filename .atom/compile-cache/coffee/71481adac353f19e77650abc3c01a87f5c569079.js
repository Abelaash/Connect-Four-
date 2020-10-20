(function() {
  var Command;

  module.exports = Command = (function() {
    function Command() {}

    Command.testCommand = function(scope, testFramework) {
      if (scope == null) {
        scope = "file";
      }
      if (scope === "single") {
        return this.testSingleCommand(testFramework);
      } else if (scope === "file") {
        return this.testFileCommand(testFramework);
      } else if (scope === "all") {
        return this.testAllCommand(testFramework);
      } else {
        throw "Unknown scope: " + scope;
      }
    };

    Command.testFileCommand = function(testFramework) {
      return atom.config.get("atom-test-runner." + testFramework + "FileCommand");
    };

    Command.testAllCommand = function(testFramework) {
      return atom.config.get("atom-test-runner." + testFramework + "AllCommand");
    };

    Command.testSingleCommand = function(testFramework) {
      return atom.config.get("atom-test-runner." + testFramework + "SingleCommand");
    };

    return Command;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9hYmVsYS8uYXRvbS9wYWNrYWdlcy9hdG9tLXRlc3QtcnVubmVyL2xpYi9jb21tYW5kLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FFUTs7O0lBQ0osT0FBQyxDQUFBLFdBQUQsR0FBYyxTQUFDLEtBQUQsRUFBaUIsYUFBakI7O1FBQUMsUUFBUTs7TUFDckIsSUFBRyxLQUFBLEtBQVMsUUFBWjtlQUNFLElBQUMsQ0FBQSxpQkFBRCxDQUFtQixhQUFuQixFQURGO09BQUEsTUFFSyxJQUFHLEtBQUEsS0FBUyxNQUFaO2VBQ0gsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsYUFBakIsRUFERztPQUFBLE1BRUEsSUFBRyxLQUFBLEtBQVMsS0FBWjtlQUNILElBQUMsQ0FBQSxjQUFELENBQWdCLGFBQWhCLEVBREc7T0FBQSxNQUFBO0FBR0gsY0FBTSxpQkFBQSxHQUFrQixNQUhyQjs7SUFMTzs7SUFVZCxPQUFDLENBQUEsZUFBRCxHQUFrQixTQUFDLGFBQUQ7YUFDaEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG1CQUFBLEdBQW9CLGFBQXBCLEdBQWtDLGFBQWxEO0lBRGdCOztJQUdsQixPQUFDLENBQUEsY0FBRCxHQUFpQixTQUFDLGFBQUQ7YUFDZixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsbUJBQUEsR0FBb0IsYUFBcEIsR0FBa0MsWUFBbEQ7SUFEZTs7SUFHakIsT0FBQyxDQUFBLGlCQUFELEdBQW9CLFNBQUMsYUFBRDthQUNsQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsbUJBQUEsR0FBb0IsYUFBcEIsR0FBa0MsZUFBbEQ7SUFEa0I7Ozs7O0FBbkJ4QiIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID1cbiAgIyBDYWxjdWxhdGVzIHRlc3QgY29tbWFuZCwgYmFzZWQgb24gdGVzdCBmcmFtZXdvcmsgYW5kIHRlc3Qgc2NvcGVcbiAgY2xhc3MgQ29tbWFuZFxuICAgIEB0ZXN0Q29tbWFuZDogKHNjb3BlID0gXCJmaWxlXCIsIHRlc3RGcmFtZXdvcmspIC0+XG4gICAgICBpZiBzY29wZSA9PSBcInNpbmdsZVwiXG4gICAgICAgIEB0ZXN0U2luZ2xlQ29tbWFuZCh0ZXN0RnJhbWV3b3JrKVxuICAgICAgZWxzZSBpZiBzY29wZSA9PSBcImZpbGVcIlxuICAgICAgICBAdGVzdEZpbGVDb21tYW5kKHRlc3RGcmFtZXdvcmspXG4gICAgICBlbHNlIGlmIHNjb3BlID09IFwiYWxsXCJcbiAgICAgICAgQHRlc3RBbGxDb21tYW5kKHRlc3RGcmFtZXdvcmspXG4gICAgICBlbHNlXG4gICAgICAgIHRocm93IFwiVW5rbm93biBzY29wZTogI3tzY29wZX1cIlxuXG4gICAgQHRlc3RGaWxlQ29tbWFuZDogKHRlc3RGcmFtZXdvcmspIC0+XG4gICAgICBhdG9tLmNvbmZpZy5nZXQoXCJhdG9tLXRlc3QtcnVubmVyLiN7dGVzdEZyYW1ld29ya31GaWxlQ29tbWFuZFwiKVxuXG4gICAgQHRlc3RBbGxDb21tYW5kOiAodGVzdEZyYW1ld29yaykgLT5cbiAgICAgIGF0b20uY29uZmlnLmdldChcImF0b20tdGVzdC1ydW5uZXIuI3t0ZXN0RnJhbWV3b3JrfUFsbENvbW1hbmRcIilcblxuICAgIEB0ZXN0U2luZ2xlQ29tbWFuZDogKHRlc3RGcmFtZXdvcmspIC0+XG4gICAgICBhdG9tLmNvbmZpZy5nZXQoXCJhdG9tLXRlc3QtcnVubmVyLiN7dGVzdEZyYW1ld29ya31TaW5nbGVDb21tYW5kXCIpXG4iXX0=
