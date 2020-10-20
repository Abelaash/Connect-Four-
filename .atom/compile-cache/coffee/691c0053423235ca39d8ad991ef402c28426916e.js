(function() {
  var Utility;

  module.exports = Utility = (function() {
    function Utility() {}

    Utility.prototype.saveFile = function() {
      if (this.filePath()) {
        return this.editor().save();
      }
    };

    Utility.prototype.filePath = function() {
      return this.editor() && this.editor().buffer && this.editor().buffer.file && this.editor().buffer.file.path;
    };

    Utility.prototype.editor = function() {
      return atom.workspace.getActiveTextEditor();
    };

    return Utility;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9hYmVsYS8uYXRvbS9wYWNrYWdlcy9hdG9tLXRlc3QtcnVubmVyL2xpYi91dGlsaXR5LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FDTTs7O3NCQUNKLFFBQUEsR0FBVSxTQUFBO01BQ1IsSUFBb0IsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFwQjtlQUFBLElBQUMsQ0FBQSxNQUFELENBQUEsQ0FBUyxDQUFDLElBQVYsQ0FBQSxFQUFBOztJQURROztzQkFHVixRQUFBLEdBQVUsU0FBQTthQUNSLElBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxJQUNFLElBQUMsQ0FBQSxNQUFELENBQUEsQ0FBUyxDQUFDLE1BRFosSUFFRSxJQUFDLENBQUEsTUFBRCxDQUFBLENBQVMsQ0FBQyxNQUFNLENBQUMsSUFGbkIsSUFHRSxJQUFDLENBQUEsTUFBRCxDQUFBLENBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBSmhCOztzQkFNVixNQUFBLEdBQVEsU0FBQTthQUNOLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQTtJQURNOzs7OztBQVhWIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgVXRpbGl0eVxuICBzYXZlRmlsZTogLT5cbiAgICBAZWRpdG9yKCkuc2F2ZSgpIGlmIEBmaWxlUGF0aCgpXG5cbiAgZmlsZVBhdGg6IC0+XG4gICAgQGVkaXRvcigpIGFuZFxuICAgICAgQGVkaXRvcigpLmJ1ZmZlciBhbmRcbiAgICAgIEBlZGl0b3IoKS5idWZmZXIuZmlsZSBhbmRcbiAgICAgIEBlZGl0b3IoKS5idWZmZXIuZmlsZS5wYXRoXG5cbiAgZWRpdG9yOiAtPlxuICAgIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuIl19
