(function() {
  var RubyTestView;

  RubyTestView = require('./ruby-test-view');

  module.exports = {
    config: {
      minitestAllCommand: {
        title: "Minitest command: Run all tests",
        type: 'string',
        "default": "ruby -I test test"
      },
      minitestFileCommand: {
        title: "Minitest command: Run test file",
        type: 'string',
        "default": "ruby -I test {relative_path}"
      },
      minitestSingleCommand: {
        title: "Minitest command: Run current test",
        type: 'string',
        "default": "ruby {relative_path} -n \"/{regex}/\""
      },
      testAllCommand: {
        title: "Ruby Test command: Run all tests",
        type: 'string',
        "default": "ruby -I test test"
      },
      testFileCommand: {
        title: "Ruby Test command: Run test in file",
        type: 'string',
        "default": "ruby -I test {relative_path}"
      },
      testSingleCommand: {
        title: "Ruby Test command: Run test at line number",
        type: 'string',
        "default": "ruby -I test {relative_path}:{line_number}"
      },
      rspecAllCommand: {
        title: "RSpec command: run all specs",
        type: 'string',
        "default": "rspec --tty spec"
      },
      rspecFileCommand: {
        title: "RSpec command: run spec file",
        type: 'string',
        "default": "rspec --tty {relative_path}"
      },
      rspecSingleCommand: {
        title: "RSpec command: run spec at current line",
        type: 'string',
        "default": "rspec --tty {relative_path}:{line_number}"
      },
      cucumberAllCommand: {
        title: "Cucumber command: Run all features",
        type: 'string',
        "default": "cucumber --color features"
      },
      cucumberFileCommand: {
        title: "Cucumber command: Run features file",
        type: 'string',
        "default": "cucumber --color {relative_path}"
      },
      cucumberSingleCommand: {
        title: "Cucumber command: Run features at current line",
        type: 'string',
        "default": "cucumber --color {relative_path}:{line_number}"
      },
      pythonAllCommand: {
        title: "Unittest command: Run all python test files",
        type: 'string',
        "default": "python {relative_path}"
      },
      pythonFileCommand: {
        title: "Unittest command: Run python file",
        type: 'string',
        "default": "python {relative_path}"
      },
      pythonSingleCommand: {
        title: "Unittest command: Run python file at current line",
        type: 'string',
        "default": "python {relative_path}"
      },
      shell: {
        type: 'string',
        "default": "bash"
      },
      specFramework: {
        type: 'string',
        "default": '',
        "enum": ['', 'rspec', 'minitest'],
        description: 'RSpec and Minitest spec files look very similar to each other, and ruby-test often can\'t tell them apart. Choose your preferred *_spec.rb framework.'
      },
      testFramework: {
        type: 'string',
        "default": '',
        "enum": ['', 'minitest', 'test'],
        description: 'Minitest test files and Test::Unit files look very similar to each other, and ruby-test often can\'t tell them apart. Choose your preferred *_test.rb framework.'
      }
    },
    rubyTestView: null,
    activate: function(state) {
      return this.rubyTestView = new RubyTestView(state.rubyTestViewState);
    },
    deactivate: function() {
      return this.rubyTestView.destroy();
    },
    serialize: function() {
      return {
        rubyTestViewState: this.rubyTestView.serialize()
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9hYmVsYS8uYXRvbS9wYWNrYWdlcy9hdG9tLXRlc3QtcnVubmVyL2xpYi9ydWJ5LXRlc3QuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGtCQUFSOztFQUVmLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxNQUFBLEVBQ0U7TUFBQSxrQkFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLGlDQUFQO1FBQ0EsSUFBQSxFQUFNLFFBRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLG1CQUZUO09BREY7TUFJQSxtQkFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLGlDQUFQO1FBQ0EsSUFBQSxFQUFNLFFBRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLDhCQUZUO09BTEY7TUFRQSxxQkFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLG9DQUFQO1FBQ0EsSUFBQSxFQUFNLFFBRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLHVDQUZUO09BVEY7TUFZQSxjQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sa0NBQVA7UUFDQSxJQUFBLEVBQU0sUUFETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsbUJBRlQ7T0FiRjtNQWdCQSxlQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8scUNBQVA7UUFDQSxJQUFBLEVBQU0sUUFETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsOEJBRlQ7T0FqQkY7TUFvQkEsaUJBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyw0Q0FBUDtRQUNBLElBQUEsRUFBTSxRQUROO1FBRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyw0Q0FGVDtPQXJCRjtNQXdCQSxlQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sOEJBQVA7UUFDQSxJQUFBLEVBQU0sUUFETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsa0JBRlQ7T0F6QkY7TUE0QkEsZ0JBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyw4QkFBUDtRQUNBLElBQUEsRUFBTSxRQUROO1FBRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyw2QkFGVDtPQTdCRjtNQWdDQSxrQkFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLHlDQUFQO1FBQ0EsSUFBQSxFQUFNLFFBRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLDJDQUZUO09BakNGO01Bb0NBLGtCQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sb0NBQVA7UUFDQSxJQUFBLEVBQU0sUUFETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsMkJBRlQ7T0FyQ0Y7TUF3Q0EsbUJBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxxQ0FBUDtRQUNBLElBQUEsRUFBTSxRQUROO1FBRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxrQ0FGVDtPQXpDRjtNQTRDQSxxQkFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLGdEQUFQO1FBQ0EsSUFBQSxFQUFNLFFBRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLGdEQUZUO09BN0NGO01BZ0RBLGdCQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sNkNBQVA7UUFDQSxJQUFBLEVBQU0sUUFETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsd0JBRlQ7T0FqREY7TUFvREEsaUJBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxtQ0FBUDtRQUNBLElBQUEsRUFBTSxRQUROO1FBRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyx3QkFGVDtPQXJERjtNQXdEQSxtQkFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLG1EQUFQO1FBQ0EsSUFBQSxFQUFNLFFBRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLHdCQUZUO09BekRGO01BNERBLEtBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxNQURUO09BN0RGO01BK0RBLGFBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQURUO1FBRUEsQ0FBQSxJQUFBLENBQUEsRUFBTSxDQUFDLEVBQUQsRUFBSyxPQUFMLEVBQWMsVUFBZCxDQUZOO1FBR0EsV0FBQSxFQUFhLHVKQUhiO09BaEVGO01Bb0VBLGFBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQURUO1FBRUEsQ0FBQSxJQUFBLENBQUEsRUFBTSxDQUFDLEVBQUQsRUFBSyxVQUFMLEVBQWlCLE1BQWpCLENBRk47UUFHQSxXQUFBLEVBQWEsa0tBSGI7T0FyRUY7S0FERjtJQTJFQSxZQUFBLEVBQWMsSUEzRWQ7SUE2RUEsUUFBQSxFQUFVLFNBQUMsS0FBRDthQUNSLElBQUMsQ0FBQSxZQUFELEdBQWdCLElBQUksWUFBSixDQUFpQixLQUFLLENBQUMsaUJBQXZCO0lBRFIsQ0E3RVY7SUFnRkEsVUFBQSxFQUFZLFNBQUE7YUFDVixJQUFDLENBQUEsWUFBWSxDQUFDLE9BQWQsQ0FBQTtJQURVLENBaEZaO0lBbUZBLFNBQUEsRUFBVyxTQUFBO2FBQ1Q7UUFBQSxpQkFBQSxFQUFtQixJQUFDLENBQUEsWUFBWSxDQUFDLFNBQWQsQ0FBQSxDQUFuQjs7SUFEUyxDQW5GWDs7QUFIRiIsInNvdXJjZXNDb250ZW50IjpbIlJ1YnlUZXN0VmlldyA9IHJlcXVpcmUgJy4vcnVieS10ZXN0LXZpZXcnXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgY29uZmlnOlxuICAgIG1pbml0ZXN0QWxsQ29tbWFuZDpcbiAgICAgIHRpdGxlOiBcIk1pbml0ZXN0IGNvbW1hbmQ6IFJ1biBhbGwgdGVzdHNcIlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IFwicnVieSAtSSB0ZXN0IHRlc3RcIlxuICAgIG1pbml0ZXN0RmlsZUNvbW1hbmQ6XG4gICAgICB0aXRsZTogXCJNaW5pdGVzdCBjb21tYW5kOiBSdW4gdGVzdCBmaWxlXCJcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiBcInJ1YnkgLUkgdGVzdCB7cmVsYXRpdmVfcGF0aH1cIlxuICAgIG1pbml0ZXN0U2luZ2xlQ29tbWFuZDpcbiAgICAgIHRpdGxlOiBcIk1pbml0ZXN0IGNvbW1hbmQ6IFJ1biBjdXJyZW50IHRlc3RcIlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IFwicnVieSB7cmVsYXRpdmVfcGF0aH0gLW4gXFxcIi97cmVnZXh9L1xcXCJcIlxuICAgIHRlc3RBbGxDb21tYW5kOlxuICAgICAgdGl0bGU6IFwiUnVieSBUZXN0IGNvbW1hbmQ6IFJ1biBhbGwgdGVzdHNcIlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IFwicnVieSAtSSB0ZXN0IHRlc3RcIlxuICAgIHRlc3RGaWxlQ29tbWFuZDpcbiAgICAgIHRpdGxlOiBcIlJ1YnkgVGVzdCBjb21tYW5kOiBSdW4gdGVzdCBpbiBmaWxlXCJcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiBcInJ1YnkgLUkgdGVzdCB7cmVsYXRpdmVfcGF0aH1cIlxuICAgIHRlc3RTaW5nbGVDb21tYW5kOlxuICAgICAgdGl0bGU6IFwiUnVieSBUZXN0IGNvbW1hbmQ6IFJ1biB0ZXN0IGF0IGxpbmUgbnVtYmVyXCJcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiBcInJ1YnkgLUkgdGVzdCB7cmVsYXRpdmVfcGF0aH06e2xpbmVfbnVtYmVyfVwiXG4gICAgcnNwZWNBbGxDb21tYW5kOlxuICAgICAgdGl0bGU6IFwiUlNwZWMgY29tbWFuZDogcnVuIGFsbCBzcGVjc1wiXG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGRlZmF1bHQ6IFwicnNwZWMgLS10dHkgc3BlY1wiXG4gICAgcnNwZWNGaWxlQ29tbWFuZDpcbiAgICAgIHRpdGxlOiBcIlJTcGVjIGNvbW1hbmQ6IHJ1biBzcGVjIGZpbGVcIlxuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZWZhdWx0OiBcInJzcGVjIC0tdHR5IHtyZWxhdGl2ZV9wYXRofVwiXG4gICAgcnNwZWNTaW5nbGVDb21tYW5kOlxuICAgICAgdGl0bGU6IFwiUlNwZWMgY29tbWFuZDogcnVuIHNwZWMgYXQgY3VycmVudCBsaW5lXCJcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVmYXVsdDogXCJyc3BlYyAtLXR0eSB7cmVsYXRpdmVfcGF0aH06e2xpbmVfbnVtYmVyfVwiXG4gICAgY3VjdW1iZXJBbGxDb21tYW5kOlxuICAgICAgdGl0bGU6IFwiQ3VjdW1iZXIgY29tbWFuZDogUnVuIGFsbCBmZWF0dXJlc1wiXG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGRlZmF1bHQ6IFwiY3VjdW1iZXIgLS1jb2xvciBmZWF0dXJlc1wiXG4gICAgY3VjdW1iZXJGaWxlQ29tbWFuZDpcbiAgICAgIHRpdGxlOiBcIkN1Y3VtYmVyIGNvbW1hbmQ6IFJ1biBmZWF0dXJlcyBmaWxlXCJcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVmYXVsdDogXCJjdWN1bWJlciAtLWNvbG9yIHtyZWxhdGl2ZV9wYXRofVwiXG4gICAgY3VjdW1iZXJTaW5nbGVDb21tYW5kOlxuICAgICAgdGl0bGU6IFwiQ3VjdW1iZXIgY29tbWFuZDogUnVuIGZlYXR1cmVzIGF0IGN1cnJlbnQgbGluZVwiXG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGRlZmF1bHQ6IFwiY3VjdW1iZXIgLS1jb2xvciB7cmVsYXRpdmVfcGF0aH06e2xpbmVfbnVtYmVyfVwiXG4gICAgcHl0aG9uQWxsQ29tbWFuZDogI1RPRE86IGZpeG1lXG4gICAgICB0aXRsZTogXCJVbml0dGVzdCBjb21tYW5kOiBSdW4gYWxsIHB5dGhvbiB0ZXN0IGZpbGVzXCJcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVmYXVsdDogXCJweXRob24ge3JlbGF0aXZlX3BhdGh9XCJcbiAgICBweXRob25GaWxlQ29tbWFuZDpcbiAgICAgIHRpdGxlOiBcIlVuaXR0ZXN0IGNvbW1hbmQ6IFJ1biBweXRob24gZmlsZVwiXG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGRlZmF1bHQ6IFwicHl0aG9uIHtyZWxhdGl2ZV9wYXRofVwiXG4gICAgcHl0aG9uU2luZ2xlQ29tbWFuZDogI1RPRE86IGZpeG1lXG4gICAgICB0aXRsZTogXCJVbml0dGVzdCBjb21tYW5kOiBSdW4gcHl0aG9uIGZpbGUgYXQgY3VycmVudCBsaW5lXCJcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVmYXVsdDogXCJweXRob24ge3JlbGF0aXZlX3BhdGh9XCJcbiAgICBzaGVsbDpcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVmYXVsdDogXCJiYXNoXCJcbiAgICBzcGVjRnJhbWV3b3JrOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICcnXG4gICAgICBlbnVtOiBbJycsICdyc3BlYycsICdtaW5pdGVzdCddXG4gICAgICBkZXNjcmlwdGlvbjogJ1JTcGVjIGFuZCBNaW5pdGVzdCBzcGVjIGZpbGVzIGxvb2sgdmVyeSBzaW1pbGFyIHRvIGVhY2ggb3RoZXIsIGFuZCBydWJ5LXRlc3Qgb2Z0ZW4gY2FuXFwndCB0ZWxsIHRoZW0gYXBhcnQuIENob29zZSB5b3VyIHByZWZlcnJlZCAqX3NwZWMucmIgZnJhbWV3b3JrLidcbiAgICB0ZXN0RnJhbWV3b3JrOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICcnXG4gICAgICBlbnVtOiBbJycsICdtaW5pdGVzdCcsICd0ZXN0J11cbiAgICAgIGRlc2NyaXB0aW9uOiAnTWluaXRlc3QgdGVzdCBmaWxlcyBhbmQgVGVzdDo6VW5pdCBmaWxlcyBsb29rIHZlcnkgc2ltaWxhciB0byBlYWNoIG90aGVyLCBhbmQgcnVieS10ZXN0IG9mdGVuIGNhblxcJ3QgdGVsbCB0aGVtIGFwYXJ0LiBDaG9vc2UgeW91ciBwcmVmZXJyZWQgKl90ZXN0LnJiIGZyYW1ld29yay4nXG5cbiAgcnVieVRlc3RWaWV3OiBudWxsXG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICBAcnVieVRlc3RWaWV3ID0gbmV3IFJ1YnlUZXN0VmlldyhzdGF0ZS5ydWJ5VGVzdFZpZXdTdGF0ZSlcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBydWJ5VGVzdFZpZXcuZGVzdHJveSgpXG5cbiAgc2VyaWFsaXplOiAtPlxuICAgIHJ1YnlUZXN0Vmlld1N0YXRlOiBAcnVieVRlc3RWaWV3LnNlcmlhbGl6ZSgpXG4iXX0=
