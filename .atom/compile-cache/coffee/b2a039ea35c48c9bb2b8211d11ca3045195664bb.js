(function() {
  var BufferedProcess, ShellRunner,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    slice = [].slice;

  BufferedProcess = require('./buffered-process');

  module.exports = ShellRunner = (function() {
    ShellRunner.prototype.processor = BufferedProcess;

    function ShellRunner(params) {
      this.stderr = bind(this.stderr, this);
      this.stdout = bind(this.stdout, this);
      this.initialize(params);
    }

    ShellRunner.prototype.initialize = function(params) {
      this.params = params || (function() {
        throw "Missing ::params argument";
      })();
      this.write = params.write || (function() {
        throw "Missing ::write parameter";
      })();
      this.exit = params.exit || (function() {
        throw "Missing ::exit parameter";
      })();
      this.command = params.command || (function() {
        throw "Missing ::command parameter";
      })();
      this.currentShell = params.currentShell || (function() {
        throw "Missing ::currentShell parameter";
      })();
      return this.panel = params.panel || (function() {
        throw "Missing ::panel parameter";
      })();
    };

    ShellRunner.prototype.run = function() {
      return this.process = this.newProcess(this.fullCommand());
    };

    ShellRunner.prototype.fullCommand = function() {
      return this._joinAnd("cd " + (this.escape(this.params.cwd())), (this.params.command()) + "; exit\n");
    };

    ShellRunner.prototype.escape = function(str) {
      var ch, charsToEscape, i, len, out;
      charsToEscape = "\\ \t\"'$()[]<>&|*;~`#";
      out = '';
      for (i = 0, len = str.length; i < len; i++) {
        ch = str[i];
        if (charsToEscape.indexOf(ch) >= 0) {
          out += '\\' + ch;
        } else {
          out += ch;
        }
      }
      return out;
    };

    ShellRunner.prototype.kill = function() {
      if (this.process != null) {
        return this.process.kill('SIGKILL');
      }
    };

    ShellRunner.prototype.stdout = function(output) {
      return this.params.write(output);
    };

    ShellRunner.prototype.stderr = function(output) {
      return this.params.write(output);
    };

    ShellRunner.prototype.newProcess = function(testCommand) {
      var args, command, options, outputCharacters, params, process;
      command = this.currentShell;
      args = ['-l', '-c', testCommand];
      options = {
        cwd: this.params.cwd
      };
      console.log("ruby-test: Running test:", {
        command: command,
        args: args,
        cwd: this.params.cwd()
      });
      params = {
        command: command,
        args: args,
        options: options,
        stdout: this.stdout,
        stderr: this.stderr,
        exit: this.exit,
        panel: this.panel
      };
      outputCharacters = true;
      process = new this.processor(params, outputCharacters);
      return process;
    };

    ShellRunner.prototype._joinAnd = function() {
      var commands, joiner;
      commands = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      joiner = /fish/.test(this.currentShell) ? '; and ' : ' && ';
      return commands.join(joiner);
    };

    return ShellRunner;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9hYmVsYS8uYXRvbS9wYWNrYWdlcy9hdG9tLXRlc3QtcnVubmVyL2xpYi9zaGVsbC1ydW5uZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSw0QkFBQTtJQUFBOzs7RUFBQSxlQUFBLEdBQWtCLE9BQUEsQ0FBUSxvQkFBUjs7RUFFbEIsTUFBTSxDQUFDLE9BQVAsR0FDUTswQkFDSixTQUFBLEdBQVc7O0lBRUUscUJBQUMsTUFBRDs7O01BQ1gsSUFBQyxDQUFBLFVBQUQsQ0FBWSxNQUFaO0lBRFc7OzBCQUdiLFVBQUEsR0FBWSxTQUFDLE1BQUQ7TUFDVixJQUFDLENBQUEsTUFBRCxHQUFVLE1BQUE7QUFBVSxjQUFNOztNQUMxQixJQUFDLENBQUEsS0FBRCxHQUFTLE1BQU0sQ0FBQyxLQUFQO0FBQWdCLGNBQU07O01BQy9CLElBQUMsQ0FBQSxJQUFELEdBQVEsTUFBTSxDQUFDLElBQVA7QUFBZSxjQUFNOztNQUM3QixJQUFDLENBQUEsT0FBRCxHQUFXLE1BQU0sQ0FBQyxPQUFQO0FBQWtCLGNBQU07O01BQ25DLElBQUMsQ0FBQSxZQUFELEdBQWdCLE1BQU0sQ0FBQyxZQUFQO0FBQXVCLGNBQU07O2FBQzdDLElBQUMsQ0FBQSxLQUFELEdBQVMsTUFBTSxDQUFDLEtBQVA7QUFBZ0IsY0FBTTs7SUFOckI7OzBCQVFaLEdBQUEsR0FBSyxTQUFBO2FBQ0gsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFDLENBQUEsVUFBRCxDQUFZLElBQUMsQ0FBQSxXQUFELENBQUEsQ0FBWjtJQURSOzswQkFHTCxXQUFBLEdBQWEsU0FBQTthQUNYLElBQUMsQ0FBQSxRQUFELENBQVUsS0FBQSxHQUFLLENBQUMsSUFBQyxDQUFBLE1BQUQsQ0FBUSxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBQSxDQUFSLENBQUQsQ0FBZixFQUE0QyxDQUFDLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBUixDQUFBLENBQUQsQ0FBQSxHQUFtQixVQUEvRDtJQURXOzswQkFHYixNQUFBLEdBQVEsU0FBQyxHQUFEO0FBQ04sVUFBQTtNQUFBLGFBQUEsR0FBZ0I7TUFDaEIsR0FBQSxHQUFNO0FBQ04sV0FBQSxxQ0FBQTs7UUFDRSxJQUFHLGFBQWEsQ0FBQyxPQUFkLENBQXNCLEVBQXRCLENBQUEsSUFBNkIsQ0FBaEM7VUFDRSxHQUFBLElBQU8sSUFBQSxHQUFPLEdBRGhCO1NBQUEsTUFBQTtVQUdFLEdBQUEsSUFBTyxHQUhUOztBQURGO2FBS0E7SUFSTTs7MEJBVVIsSUFBQSxHQUFNLFNBQUE7TUFDSixJQUFHLG9CQUFIO2VBQ0UsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsU0FBZCxFQURGOztJQURJOzswQkFJTixNQUFBLEdBQVEsU0FBQyxNQUFEO2FBQ04sSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFSLENBQWMsTUFBZDtJQURNOzswQkFHUixNQUFBLEdBQVEsU0FBQyxNQUFEO2FBQ04sSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFSLENBQWMsTUFBZDtJQURNOzswQkFHUixVQUFBLEdBQVksU0FBQyxXQUFEO0FBQ1YsVUFBQTtNQUFBLE9BQUEsR0FBVSxJQUFDLENBQUE7TUFDWCxJQUFBLEdBQU8sQ0FBQyxJQUFELEVBQU8sSUFBUCxFQUFhLFdBQWI7TUFDUCxPQUFBLEdBQVU7UUFBRSxHQUFBLEVBQUssSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFmOztNQUNWLE9BQU8sQ0FBQyxHQUFSLENBQVksMEJBQVosRUFBd0M7UUFBQyxPQUFBLEVBQVMsT0FBVjtRQUFtQixJQUFBLEVBQU0sSUFBekI7UUFBK0IsR0FBQSxFQUFLLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFBLENBQXBDO09BQXhDO01BQ0EsTUFBQSxHQUFTO1FBQUUsU0FBQSxPQUFGO1FBQVcsTUFBQSxJQUFYO1FBQWlCLFNBQUEsT0FBakI7UUFBMkIsUUFBRCxJQUFDLENBQUEsTUFBM0I7UUFBb0MsUUFBRCxJQUFDLENBQUEsTUFBcEM7UUFBNkMsTUFBRCxJQUFDLENBQUEsSUFBN0M7UUFBb0QsT0FBRCxJQUFDLENBQUEsS0FBcEQ7O01BQ1QsZ0JBQUEsR0FBbUI7TUFDbkIsT0FBQSxHQUFVLElBQUksSUFBQyxDQUFBLFNBQUwsQ0FBZSxNQUFmLEVBQXVCLGdCQUF2QjthQUNWO0lBUlU7OzBCQVVaLFFBQUEsR0FBVSxTQUFBO0FBQ1IsVUFBQTtNQURTO01BQ1QsTUFBQSxHQUFZLE1BQU0sQ0FBQyxJQUFQLENBQVksSUFBQyxDQUFBLFlBQWIsQ0FBSCxHQUFtQyxRQUFuQyxHQUFpRDthQUMxRCxRQUFRLENBQUMsSUFBVCxDQUFjLE1BQWQ7SUFGUTs7Ozs7QUFyRGQiLCJzb3VyY2VzQ29udGVudCI6WyJCdWZmZXJlZFByb2Nlc3MgPSByZXF1aXJlICcuL2J1ZmZlcmVkLXByb2Nlc3MnXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgY2xhc3MgU2hlbGxSdW5uZXJcbiAgICBwcm9jZXNzb3I6IEJ1ZmZlcmVkUHJvY2Vzc1xuXG4gICAgY29uc3RydWN0b3I6IChwYXJhbXMpIC0+XG4gICAgICBAaW5pdGlhbGl6ZShwYXJhbXMpXG5cbiAgICBpbml0aWFsaXplOiAocGFyYW1zKSAtPlxuICAgICAgQHBhcmFtcyA9IHBhcmFtcyB8fCB0aHJvdyBcIk1pc3NpbmcgOjpwYXJhbXMgYXJndW1lbnRcIlxuICAgICAgQHdyaXRlID0gcGFyYW1zLndyaXRlIHx8IHRocm93IFwiTWlzc2luZyA6OndyaXRlIHBhcmFtZXRlclwiXG4gICAgICBAZXhpdCA9IHBhcmFtcy5leGl0IHx8IHRocm93IFwiTWlzc2luZyA6OmV4aXQgcGFyYW1ldGVyXCJcbiAgICAgIEBjb21tYW5kID0gcGFyYW1zLmNvbW1hbmQgfHwgdGhyb3cgXCJNaXNzaW5nIDo6Y29tbWFuZCBwYXJhbWV0ZXJcIlxuICAgICAgQGN1cnJlbnRTaGVsbCA9IHBhcmFtcy5jdXJyZW50U2hlbGwgfHwgdGhyb3cgXCJNaXNzaW5nIDo6Y3VycmVudFNoZWxsIHBhcmFtZXRlclwiXG4gICAgICBAcGFuZWwgPSBwYXJhbXMucGFuZWwgfHwgdGhyb3cgXCJNaXNzaW5nIDo6cGFuZWwgcGFyYW1ldGVyXCJcblxuICAgIHJ1bjogLT5cbiAgICAgIEBwcm9jZXNzID0gQG5ld1Byb2Nlc3MoQGZ1bGxDb21tYW5kKCkpXG5cbiAgICBmdWxsQ29tbWFuZDogLT5cbiAgICAgIEBfam9pbkFuZChcImNkICN7QGVzY2FwZShAcGFyYW1zLmN3ZCgpKX1cIiwgXCIje0BwYXJhbXMuY29tbWFuZCgpfTsgZXhpdFxcblwiKVxuXG4gICAgZXNjYXBlOiAoc3RyKSAtPlxuICAgICAgY2hhcnNUb0VzY2FwZSA9IFwiXFxcXCBcXHRcXFwiJyQoKVtdPD4mfCo7fmAjXCJcbiAgICAgIG91dCA9ICcnXG4gICAgICBmb3IgY2ggaW4gc3RyXG4gICAgICAgIGlmIGNoYXJzVG9Fc2NhcGUuaW5kZXhPZihjaCkgPj0gMFxuICAgICAgICAgIG91dCArPSAnXFxcXCcgKyBjaFxuICAgICAgICBlbHNlXG4gICAgICAgICAgb3V0ICs9IGNoXG4gICAgICBvdXRcblxuICAgIGtpbGw6IC0+XG4gICAgICBpZiBAcHJvY2Vzcz9cbiAgICAgICAgQHByb2Nlc3Mua2lsbCgnU0lHS0lMTCcpXG5cbiAgICBzdGRvdXQ6IChvdXRwdXQpID0+XG4gICAgICBAcGFyYW1zLndyaXRlIG91dHB1dFxuXG4gICAgc3RkZXJyOiAob3V0cHV0KSA9PlxuICAgICAgQHBhcmFtcy53cml0ZSBvdXRwdXRcblxuICAgIG5ld1Byb2Nlc3M6ICh0ZXN0Q29tbWFuZCkgLT5cbiAgICAgIGNvbW1hbmQgPSBAY3VycmVudFNoZWxsXG4gICAgICBhcmdzID0gWyctbCcsICctYycsIHRlc3RDb21tYW5kXVxuICAgICAgb3B0aW9ucyA9IHsgY3dkOiBAcGFyYW1zLmN3ZCB9XG4gICAgICBjb25zb2xlLmxvZyBcInJ1YnktdGVzdDogUnVubmluZyB0ZXN0OlwiLCB7Y29tbWFuZDogY29tbWFuZCwgYXJnczogYXJncywgY3dkOiBAcGFyYW1zLmN3ZCgpfVxuICAgICAgcGFyYW1zID0geyBjb21tYW5kLCBhcmdzLCBvcHRpb25zLCBAc3Rkb3V0LCBAc3RkZXJyLCBAZXhpdCwgQHBhbmVsIH1cbiAgICAgIG91dHB1dENoYXJhY3RlcnMgPSB0cnVlXG4gICAgICBwcm9jZXNzID0gbmV3IEBwcm9jZXNzb3IgcGFyYW1zLCBvdXRwdXRDaGFyYWN0ZXJzXG4gICAgICBwcm9jZXNzXG5cbiAgICBfam9pbkFuZDogKGNvbW1hbmRzLi4uKSAtPlxuICAgICAgam9pbmVyID0gaWYgL2Zpc2gvLnRlc3QoQGN1cnJlbnRTaGVsbCkgdGhlbiAnOyBhbmQgJyBlbHNlICcgJiYgJ1xuICAgICAgY29tbWFuZHMuam9pbihqb2luZXIpXG4iXX0=
