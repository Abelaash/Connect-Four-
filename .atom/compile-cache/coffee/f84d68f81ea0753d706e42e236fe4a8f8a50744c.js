(function() {
  var AnsiToHtml, AtomRunnerView, ScrollView,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ScrollView = require('atom-space-pen-views').ScrollView;

  AnsiToHtml = require('ansi-to-html');

  module.exports = AtomRunnerView = (function(superClass) {
    extend(AtomRunnerView, superClass);

    atom.deserializers.add(AtomRunnerView);

    AtomRunnerView.deserialize = function(arg) {
      var footer, output, title, view;
      title = arg.title, output = arg.output, footer = arg.footer;
      view = new AtomRunnerView(title);
      view._output.html(output);
      view._footer.html(footer);
      return view;
    };

    AtomRunnerView.content = function() {
      return this.div({
        "class": 'atom-runner',
        tabindex: -1
      }, (function(_this) {
        return function() {
          _this.h1('Atom Runner');
          _this.pre({
            "class": 'output'
          });
          return _this.div({
            "class": 'footer'
          });
        };
      })(this));
    };

    function AtomRunnerView(title) {
      AtomRunnerView.__super__.constructor.apply(this, arguments);
      this._output = this.find('.output');
      this._footer = this.find('.footer');
      this.setTitle(title);
    }

    AtomRunnerView.prototype.serialize = function() {
      return {
        deserializer: 'AtomRunnerView',
        title: this.title,
        output: this._output.html(),
        footer: this._footer.html()
      };
    };

    AtomRunnerView.prototype.getTitle = function() {
      return "Atom Runner: " + this.title;
    };

    AtomRunnerView.prototype.setTitle = function(title) {
      this.title = title;
      return this.find('h1').html(this.getTitle());
    };

    AtomRunnerView.prototype.clear = function() {
      this._output.html('');
      return this._footer.html('');
    };

    AtomRunnerView.prototype.append = function(text, className) {
      var node, span;
      span = document.createElement('span');
      node = document.createTextNode(text);
      span.appendChild(node);
      span.innerHTML = new AnsiToHtml().toHtml(span.innerHTML);
      span.className = className || 'stdout';
      return this._output.append(span);
    };

    AtomRunnerView.prototype.appendFooter = function(text) {
      return this._footer.html(this._footer.html() + text);
    };

    AtomRunnerView.prototype.footer = function(text) {
      return this._footer.html(text);
    };

    return AtomRunnerView;

  })(ScrollView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9hYmVsYS8uYXRvbS9wYWNrYWdlcy9hdG9tLXJ1bm5lci9saWIvYXRvbS1ydW5uZXItdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHNDQUFBO0lBQUE7OztFQUFDLGFBQWMsT0FBQSxDQUFRLHNCQUFSOztFQUNmLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUNNOzs7SUFDSixJQUFJLENBQUMsYUFBYSxDQUFDLEdBQW5CLENBQXVCLGNBQXZCOztJQUVBLGNBQUMsQ0FBQSxXQUFELEdBQWMsU0FBQyxHQUFEO0FBQ1osVUFBQTtNQURjLG1CQUFPLHFCQUFRO01BQzdCLElBQUEsR0FBTyxJQUFJLGNBQUosQ0FBbUIsS0FBbkI7TUFDUCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQWIsQ0FBa0IsTUFBbEI7TUFDQSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQWIsQ0FBa0IsTUFBbEI7YUFDQTtJQUpZOztJQU1kLGNBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGFBQVA7UUFBc0IsUUFBQSxFQUFVLENBQUMsQ0FBakM7T0FBTCxFQUF5QyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDdkMsS0FBQyxDQUFBLEVBQUQsQ0FBSSxhQUFKO1VBQ0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sUUFBUDtXQUFMO2lCQUNBLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFFBQVA7V0FBTDtRQUh1QztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekM7SUFEUTs7SUFNRyx3QkFBQyxLQUFEO01BQ1gsaURBQUEsU0FBQTtNQUVBLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBQyxDQUFBLElBQUQsQ0FBTSxTQUFOO01BQ1gsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFDLENBQUEsSUFBRCxDQUFNLFNBQU47TUFDWCxJQUFDLENBQUEsUUFBRCxDQUFVLEtBQVY7SUFMVzs7NkJBT2IsU0FBQSxHQUFXLFNBQUE7YUFDVDtRQUFBLFlBQUEsRUFBYyxnQkFBZDtRQUNBLEtBQUEsRUFBTyxJQUFDLENBQUEsS0FEUjtRQUVBLE1BQUEsRUFBUSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBQSxDQUZSO1FBR0EsTUFBQSxFQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFBLENBSFI7O0lBRFM7OzZCQU1YLFFBQUEsR0FBVSxTQUFBO2FBQ1IsZUFBQSxHQUFnQixJQUFDLENBQUE7SUFEVDs7NkJBR1YsUUFBQSxHQUFVLFNBQUMsS0FBRDtNQUNSLElBQUMsQ0FBQSxLQUFELEdBQVM7YUFDVCxJQUFDLENBQUEsSUFBRCxDQUFNLElBQU4sQ0FBVyxDQUFDLElBQVosQ0FBaUIsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFqQjtJQUZROzs2QkFJVixLQUFBLEdBQU8sU0FBQTtNQUNMLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLEVBQWQ7YUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxFQUFkO0lBRks7OzZCQUlQLE1BQUEsR0FBUSxTQUFDLElBQUQsRUFBTyxTQUFQO0FBQ04sVUFBQTtNQUFBLElBQUEsR0FBTyxRQUFRLENBQUMsYUFBVCxDQUF1QixNQUF2QjtNQUNQLElBQUEsR0FBTyxRQUFRLENBQUMsY0FBVCxDQUF3QixJQUF4QjtNQUNQLElBQUksQ0FBQyxXQUFMLENBQWlCLElBQWpCO01BQ0EsSUFBSSxDQUFDLFNBQUwsR0FBaUIsSUFBSSxVQUFKLENBQUEsQ0FBZ0IsQ0FBQyxNQUFqQixDQUF3QixJQUFJLENBQUMsU0FBN0I7TUFDakIsSUFBSSxDQUFDLFNBQUwsR0FBaUIsU0FBQSxJQUFhO2FBQzlCLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFnQixJQUFoQjtJQU5NOzs2QkFRUixZQUFBLEdBQWMsU0FBQyxJQUFEO2FBQ1osSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQUEsQ0FBQSxHQUFrQixJQUFoQztJQURZOzs2QkFHZCxNQUFBLEdBQVEsU0FBQyxJQUFEO2FBQ04sSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsSUFBZDtJQURNOzs7O0tBbERtQjtBQUo3QiIsInNvdXJjZXNDb250ZW50IjpbIntTY3JvbGxWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuQW5zaVRvSHRtbCA9IHJlcXVpcmUgJ2Fuc2ktdG8taHRtbCdcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgQXRvbVJ1bm5lclZpZXcgZXh0ZW5kcyBTY3JvbGxWaWV3XG4gIGF0b20uZGVzZXJpYWxpemVycy5hZGQodGhpcylcblxuICBAZGVzZXJpYWxpemU6ICh7dGl0bGUsIG91dHB1dCwgZm9vdGVyfSkgLT5cbiAgICB2aWV3ID0gbmV3IEF0b21SdW5uZXJWaWV3KHRpdGxlKVxuICAgIHZpZXcuX291dHB1dC5odG1sKG91dHB1dClcbiAgICB2aWV3Ll9mb290ZXIuaHRtbChmb290ZXIpXG4gICAgdmlld1xuXG4gIEBjb250ZW50OiAtPlxuICAgIEBkaXYgY2xhc3M6ICdhdG9tLXJ1bm5lcicsIHRhYmluZGV4OiAtMSwgPT5cbiAgICAgIEBoMSAnQXRvbSBSdW5uZXInXG4gICAgICBAcHJlIGNsYXNzOiAnb3V0cHV0J1xuICAgICAgQGRpdiBjbGFzczogJ2Zvb3RlcidcblxuICBjb25zdHJ1Y3RvcjogKHRpdGxlKSAtPlxuICAgIHN1cGVyXG5cbiAgICBAX291dHB1dCA9IEBmaW5kKCcub3V0cHV0JylcbiAgICBAX2Zvb3RlciA9IEBmaW5kKCcuZm9vdGVyJylcbiAgICBAc2V0VGl0bGUodGl0bGUpXG5cbiAgc2VyaWFsaXplOiAtPlxuICAgIGRlc2VyaWFsaXplcjogJ0F0b21SdW5uZXJWaWV3J1xuICAgIHRpdGxlOiBAdGl0bGVcbiAgICBvdXRwdXQ6IEBfb3V0cHV0Lmh0bWwoKVxuICAgIGZvb3RlcjogQF9mb290ZXIuaHRtbCgpXG5cbiAgZ2V0VGl0bGU6IC0+XG4gICAgXCJBdG9tIFJ1bm5lcjogI3tAdGl0bGV9XCJcblxuICBzZXRUaXRsZTogKHRpdGxlKSAtPlxuICAgIEB0aXRsZSA9IHRpdGxlXG4gICAgQGZpbmQoJ2gxJykuaHRtbChAZ2V0VGl0bGUoKSlcblxuICBjbGVhcjogLT5cbiAgICBAX291dHB1dC5odG1sKCcnKVxuICAgIEBfZm9vdGVyLmh0bWwoJycpXG5cbiAgYXBwZW5kOiAodGV4dCwgY2xhc3NOYW1lKSAtPlxuICAgIHNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICBub2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGV4dClcbiAgICBzcGFuLmFwcGVuZENoaWxkKG5vZGUpXG4gICAgc3Bhbi5pbm5lckhUTUwgPSBuZXcgQW5zaVRvSHRtbCgpLnRvSHRtbChzcGFuLmlubmVySFRNTClcbiAgICBzcGFuLmNsYXNzTmFtZSA9IGNsYXNzTmFtZSB8fCAnc3Rkb3V0J1xuICAgIEBfb3V0cHV0LmFwcGVuZChzcGFuKVxuICBcbiAgYXBwZW5kRm9vdGVyOiAodGV4dCkgLT5cbiAgICBAX2Zvb3Rlci5odG1sKEBfZm9vdGVyLmh0bWwoKSArIHRleHQpXG5cbiAgZm9vdGVyOiAodGV4dCkgLT5cbiAgICBAX2Zvb3Rlci5odG1sKHRleHQpXG4iXX0=
