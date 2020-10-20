(function() {
  var $, ResizeHandle,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $ = require('atom-space-pen-views').$;

  module.exports = ResizeHandle = (function() {
    function ResizeHandle(view) {
      this.resizeStopped = bind(this.resizeStopped, this);
      this.resizeStarted = bind(this.resizeStarted, this);
      this.resizeTreeView = bind(this.resizeTreeView, this);
      this.resizeToFitContent = bind(this.resizeToFitContent, this);
      this.view = view;
      this.view.on('dblclick', '.ruby-test-resize-handle', this.resizeToFitContent);
      this.view.on('mousedown', '.ruby-test-resize-handle', this.resizeStarted);
      this.panelBody = this.view.find('.panel-body');
      this.resultsEl = this.view.results;
    }

    ResizeHandle.prototype.resizeToFitContent = function() {
      this.panelBody.height(1);
      return this.panelBody.height(Math.max(this.resultsEl.outerHeight(), 40));
    };

    ResizeHandle.prototype.resizeTreeView = function(_arg) {
      var statusBarHeight, testBarHeight, workspaceHeight;
      workspaceHeight = $('.workspace').outerHeight();
      statusBarHeight = $('.status-bar').outerHeight();
      testBarHeight = $('.ruby-test .panel-heading').outerHeight();
      return this.panelBody.height(workspaceHeight - _arg.pageY - statusBarHeight - testBarHeight - 28);
    };

    ResizeHandle.prototype.resizeStarted = function() {
      $(document.body).on('mousemove', this.resizeTreeView);
      return $(document.body).on('mouseup', this.resizeStopped);
    };

    ResizeHandle.prototype.resizeStopped = function() {
      $(document.body).off('mousemove', this.resizeTreeView);
      return $(document.body).off('mouseup', this.resizeStopped);
    };

    return ResizeHandle;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9hYmVsYS8uYXRvbS9wYWNrYWdlcy9hdG9tLXRlc3QtcnVubmVyL2xpYi9yZXNpemUtaGFuZGxlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsZUFBQTtJQUFBOztFQUFDLElBQUssT0FBQSxDQUFRLHNCQUFSOztFQUVOLE1BQU0sQ0FBQyxPQUFQLEdBQ1E7SUFDUyxzQkFBQyxJQUFEOzs7OztNQUNYLElBQUMsQ0FBQSxJQUFELEdBQVE7TUFDUixJQUFDLENBQUEsSUFBSSxDQUFDLEVBQU4sQ0FBUyxVQUFULEVBQXFCLDBCQUFyQixFQUFpRCxJQUFDLENBQUEsa0JBQWxEO01BQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxFQUFOLENBQVMsV0FBVCxFQUFzQiwwQkFBdEIsRUFBa0QsSUFBQyxDQUFBLGFBQW5EO01BQ0EsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBVyxhQUFYO01BQ2IsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUFDLENBQUEsSUFBSSxDQUFDO0lBTFI7OzJCQU9iLGtCQUFBLEdBQW9CLFNBQUE7TUFDbEIsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQWtCLENBQWxCO2FBQ0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQWtCLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBQyxDQUFBLFNBQVMsQ0FBQyxXQUFYLENBQUEsQ0FBVCxFQUFtQyxFQUFuQyxDQUFsQjtJQUZrQjs7MkJBSXBCLGNBQUEsR0FBZ0IsU0FBQyxJQUFEO0FBQ2QsVUFBQTtNQUFBLGVBQUEsR0FBa0IsQ0FBQSxDQUFFLFlBQUYsQ0FBZSxDQUFDLFdBQWhCLENBQUE7TUFDbEIsZUFBQSxHQUFrQixDQUFBLENBQUUsYUFBRixDQUFnQixDQUFDLFdBQWpCLENBQUE7TUFDbEIsYUFBQSxHQUFnQixDQUFBLENBQUUsMkJBQUYsQ0FBOEIsQ0FBQyxXQUEvQixDQUFBO2FBQ2hCLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxDQUFrQixlQUFBLEdBQWtCLElBQUksQ0FBQyxLQUF2QixHQUErQixlQUEvQixHQUFpRCxhQUFqRCxHQUFpRSxFQUFuRjtJQUpjOzsyQkFNaEIsYUFBQSxHQUFlLFNBQUE7TUFDYixDQUFBLENBQUUsUUFBUSxDQUFDLElBQVgsQ0FBZ0IsQ0FBQyxFQUFqQixDQUFvQixXQUFwQixFQUFpQyxJQUFDLENBQUEsY0FBbEM7YUFDQSxDQUFBLENBQUUsUUFBUSxDQUFDLElBQVgsQ0FBZ0IsQ0FBQyxFQUFqQixDQUFvQixTQUFwQixFQUErQixJQUFDLENBQUEsYUFBaEM7SUFGYTs7MkJBSWYsYUFBQSxHQUFlLFNBQUE7TUFDYixDQUFBLENBQUUsUUFBUSxDQUFDLElBQVgsQ0FBZ0IsQ0FBQyxHQUFqQixDQUFxQixXQUFyQixFQUFrQyxJQUFDLENBQUEsY0FBbkM7YUFDQSxDQUFBLENBQUUsUUFBUSxDQUFDLElBQVgsQ0FBZ0IsQ0FBQyxHQUFqQixDQUFxQixTQUFyQixFQUFnQyxJQUFDLENBQUEsYUFBakM7SUFGYTs7Ozs7QUF6Qm5CIiwic291cmNlc0NvbnRlbnQiOlsieyR9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgY2xhc3MgUmVzaXplSGFuZGxlXG4gICAgY29uc3RydWN0b3I6ICh2aWV3KSAtPlxuICAgICAgQHZpZXcgPSB2aWV3XG4gICAgICBAdmlldy5vbiAnZGJsY2xpY2snLCAnLnJ1YnktdGVzdC1yZXNpemUtaGFuZGxlJywgQHJlc2l6ZVRvRml0Q29udGVudFxuICAgICAgQHZpZXcub24gJ21vdXNlZG93bicsICcucnVieS10ZXN0LXJlc2l6ZS1oYW5kbGUnLCBAcmVzaXplU3RhcnRlZFxuICAgICAgQHBhbmVsQm9keSA9IEB2aWV3LmZpbmQoJy5wYW5lbC1ib2R5JylcbiAgICAgIEByZXN1bHRzRWwgPSBAdmlldy5yZXN1bHRzXG5cbiAgICByZXNpemVUb0ZpdENvbnRlbnQ6ID0+XG4gICAgICBAcGFuZWxCb2R5LmhlaWdodCgxKVxuICAgICAgQHBhbmVsQm9keS5oZWlnaHQoTWF0aC5tYXgoQHJlc3VsdHNFbC5vdXRlckhlaWdodCgpLCA0MCkpXG5cbiAgICByZXNpemVUcmVlVmlldzogKF9hcmcpID0+XG4gICAgICB3b3Jrc3BhY2VIZWlnaHQgPSAkKCcud29ya3NwYWNlJykub3V0ZXJIZWlnaHQoKVxuICAgICAgc3RhdHVzQmFySGVpZ2h0ID0gJCgnLnN0YXR1cy1iYXInKS5vdXRlckhlaWdodCgpXG4gICAgICB0ZXN0QmFySGVpZ2h0ID0gJCgnLnJ1YnktdGVzdCAucGFuZWwtaGVhZGluZycpLm91dGVySGVpZ2h0KClcbiAgICAgIEBwYW5lbEJvZHkuaGVpZ2h0KHdvcmtzcGFjZUhlaWdodCAtIF9hcmcucGFnZVkgLSBzdGF0dXNCYXJIZWlnaHQgLSB0ZXN0QmFySGVpZ2h0IC0gMjgpXG5cbiAgICByZXNpemVTdGFydGVkOiA9PlxuICAgICAgJChkb2N1bWVudC5ib2R5KS5vbiAnbW91c2Vtb3ZlJywgQHJlc2l6ZVRyZWVWaWV3XG4gICAgICAkKGRvY3VtZW50LmJvZHkpLm9uICdtb3VzZXVwJywgQHJlc2l6ZVN0b3BwZWRcblxuICAgIHJlc2l6ZVN0b3BwZWQ6ID0+XG4gICAgICAkKGRvY3VtZW50LmJvZHkpLm9mZignbW91c2Vtb3ZlJywgQHJlc2l6ZVRyZWVWaWV3KVxuICAgICAgJChkb2N1bWVudC5ib2R5KS5vZmYoJ21vdXNldXAnLCBAcmVzaXplU3RvcHBlZClcbiJdfQ==
