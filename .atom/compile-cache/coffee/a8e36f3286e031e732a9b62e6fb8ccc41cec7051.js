(function() {
  var BufferedProcess, ChildProcess, _;

  _ = require('underscore-plus');

  ChildProcess = require('child_process');

  module.exports = BufferedProcess = (function() {
    function BufferedProcess(arg1, outputCharacters) {
      var args, cmdArgs, cmdOptions, command, exit, exitCode, options, panel, processExited, ref, stderr, stderrClosed, stdout, stdoutClosed, triggerExitCallback;
      ref = arg1 != null ? arg1 : {}, command = ref.command, args = ref.args, options = ref.options, stdout = ref.stdout, stderr = ref.stderr, exit = ref.exit, panel = ref.panel;
      if (outputCharacters == null) {
        outputCharacters = false;
      }
      if (options == null) {
        options = {};
      }
      if (process.platform === "win32") {
        if (args != null) {
          cmdArgs = args.map(function(arg) {
            if ((command === 'explorer.exe' || command === 'explorer') && /^\/[a-zA-Z]+,.*$/.test(arg)) {
              return arg;
            } else {
              return "\"" + (arg.replace(/"/g, '\\"')) + "\"";
            }
          });
        } else {
          cmdArgs = [];
        }
        if (/\s/.test(command)) {
          cmdArgs.unshift("\"" + command + "\"");
        } else {
          cmdArgs.unshift(command);
        }
        cmdArgs = ['/s', '/c', "\"" + (cmdArgs.join(' ')) + "\""];
        cmdOptions = _.clone(options);
        cmdOptions.windowsVerbatimArguments = true;
        this.process = ChildProcess.spawn(process.env.comspec || 'cmd.exe', cmdArgs, cmdOptions);
      } else {
        this.process = ChildProcess.spawn(command, args, options);
      }
      this.killed = false;
      stdoutClosed = true;
      stderrClosed = true;
      processExited = true;
      exitCode = 0;
      triggerExitCallback = function() {
        if (this.killed) {
          return;
        }
        if (stdoutClosed && stderrClosed && processExited) {
          return typeof exit === "function" ? exit(exitCode) : void 0;
        }
      };
      if (stdout) {
        stdoutClosed = false;
        this.bufferStream(this.process.stdout, stdout, outputCharacters, function() {
          stdoutClosed = true;
          return triggerExitCallback();
        });
      }
      if (stderr) {
        stderrClosed = false;
        this.bufferStream(this.process.stderr, stderr, outputCharacters, function() {
          stderrClosed = true;
          return triggerExitCallback();
        });
      }
      if (exit) {
        processExited = false;
        this.process.on('exit', function(code) {
          exitCode = code;
          if (exitCode === 0) {
            panel.closePanel();
          }
          processExited = true;
          return triggerExitCallback();
        });
      }
    }

    BufferedProcess.prototype.bufferStream = function(stream, onLines, outputCharacters, onDone) {
      var buffered;
      stream.setEncoding('utf8');
      buffered = '';
      stream.on('data', (function(_this) {
        return function(data) {
          var lastNewlineIndex;
          if (_this.killed) {
            return;
          }
          if (!outputCharacters) {
            buffered += data;
            lastNewlineIndex = buffered.lastIndexOf('\n');
            if (lastNewlineIndex !== -1) {
              onLines(buffered.substring(0, lastNewlineIndex + 1));
              return buffered = buffered.substring(lastNewlineIndex + 1);
            }
          } else {
            return onLines(data);
          }
        };
      })(this));
      return stream.on('close', (function(_this) {
        return function() {
          if (_this.killed) {
            return;
          }
          if (buffered.length > 0) {
            onLines(buffered);
          }
          return onDone();
        };
      })(this));
    };

    BufferedProcess.prototype.killOnWindows = function() {
      var args, cmd, output, parentPid, wmicProcess;
      parentPid = this.process.pid;
      cmd = 'wmic';
      args = ['process', 'where', "(ParentProcessId=" + parentPid + ")", 'get', 'processid'];
      wmicProcess = ChildProcess.spawn(cmd, args);
      wmicProcess.on('error', function() {});
      output = '';
      wmicProcess.stdout.on('data', function(data) {
        return output += data;
      });
      return wmicProcess.stdout.on('close', (function(_this) {
        return function() {
          var i, len, pid, pidsToKill;
          pidsToKill = output.split(/\s+/).filter(function(pid) {
            return /^\d+$/.test(pid);
          }).map(function(pid) {
            return parseInt(pid);
          }).filter(function(pid) {
            return pid !== parentPid && (0 < pid && pid < 2e308);
          });
          for (i = 0, len = pidsToKill.length; i < len; i++) {
            pid = pidsToKill[i];
            try {
              process.kill(pid);
            } catch (error) {}
          }
          return _this.killProcess();
        };
      })(this));
    };

    BufferedProcess.prototype.killProcess = function() {
      var ref;
      if ((ref = this.process) != null) {
        ref.kill();
      }
      return this.process = null;
    };

    BufferedProcess.prototype.kill = function() {
      if (this.killed) {
        return;
      }
      this.killed = true;
      if (process.platform === 'win32') {
        this.killOnWindows();
      } else {
        this.killProcess();
      }
      return void 0;
    };

    return BufferedProcess;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9hYmVsYS8uYXRvbS9wYWNrYWdlcy9hdG9tLXRlc3QtcnVubmVyL2xpYi9idWZmZXJlZC1wcm9jZXNzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSixZQUFBLEdBQWUsT0FBQSxDQUFRLGVBQVI7O0VBZ0JmLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFzQlMseUJBQUMsSUFBRCxFQUEyRCxnQkFBM0Q7QUFDWCxVQUFBOzJCQURZLE9BQXNELElBQXJELHVCQUFTLGlCQUFNLHVCQUFTLHFCQUFRLHFCQUFRLGlCQUFNOztRQUFXLG1CQUFpQjs7O1FBQ3ZGLFVBQVc7O01BRVgsSUFBRyxPQUFPLENBQUMsUUFBUixLQUFvQixPQUF2QjtRQUVFLElBQUcsWUFBSDtVQUNFLE9BQUEsR0FBVSxJQUFJLENBQUMsR0FBTCxDQUFTLFNBQUMsR0FBRDtZQUNqQixJQUFHLENBQUEsT0FBQSxLQUFZLGNBQVosSUFBQSxPQUFBLEtBQTRCLFVBQTVCLENBQUEsSUFBNEMsa0JBQWtCLENBQUMsSUFBbkIsQ0FBd0IsR0FBeEIsQ0FBL0M7cUJBR0UsSUFIRjthQUFBLE1BQUE7cUJBS0UsSUFBQSxHQUFJLENBQUMsR0FBRyxDQUFDLE9BQUosQ0FBWSxJQUFaLEVBQWtCLEtBQWxCLENBQUQsQ0FBSixHQUE4QixLQUxoQzs7VUFEaUIsQ0FBVCxFQURaO1NBQUEsTUFBQTtVQVNFLE9BQUEsR0FBVSxHQVRaOztRQVVBLElBQUcsSUFBSSxDQUFDLElBQUwsQ0FBVSxPQUFWLENBQUg7VUFDRSxPQUFPLENBQUMsT0FBUixDQUFnQixJQUFBLEdBQUssT0FBTCxHQUFhLElBQTdCLEVBREY7U0FBQSxNQUFBO1VBR0UsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsT0FBaEIsRUFIRjs7UUFJQSxPQUFBLEdBQVUsQ0FBQyxJQUFE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O2FBQUE7QUFERjtpQkFHQSxLQUFDLENBQUEsV0FBRCxDQUFBO1FBVDZCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEvQjtJQWZhOzs4QkEwQmYsV0FBQSxHQUFhLFNBQUE7QUFDWCxVQUFBOztXQUFRLENBQUUsSUFBVixDQUFBOzthQUNBLElBQUMsQ0FBQSxPQUFELEdBQVc7SUFGQTs7OEJBS2IsSUFBQSxHQUFNLFNBQUE7TUFDSixJQUFVLElBQUMsQ0FBQSxNQUFYO0FBQUEsZUFBQTs7TUFFQSxJQUFDLENBQUEsTUFBRCxHQUFVO01BQ1YsSUFBRyxPQUFPLENBQUMsUUFBUixLQUFvQixPQUF2QjtRQUNFLElBQUMsQ0FBQSxhQUFELENBQUEsRUFERjtPQUFBLE1BQUE7UUFHRSxJQUFDLENBQUEsV0FBRCxDQUFBLEVBSEY7O2FBS0E7SUFUSTs7Ozs7QUEvSlIiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuQ2hpbGRQcm9jZXNzID0gcmVxdWlyZSAnY2hpbGRfcHJvY2VzcydcblxuIyBQdWJsaWM6IEEgd3JhcHBlciB3aGljaCBwcm92aWRlcyBzdGFuZGFyZCBlcnJvci9vdXRwdXQgbGluZSBidWZmZXJpbmcgZm9yXG4jIE5vZGUncyBDaGlsZFByb2Nlc3MuXG4jXG4jICMjIFJlcXVpcmluZyBpbiBwYWNrYWdlc1xuI1xuIyBgYGBjb2ZmZWVcbiMge0J1ZmZlcmVkUHJvY2Vzc30gPSByZXF1aXJlICdhdG9tJ1xuI1xuIyBjb21tYW5kID0gJ3BzJ1xuIyBhcmdzID0gWyctZWYnXVxuIyBzdGRvdXQgPSAob3V0cHV0KSAtPiBjb25zb2xlLmxvZyhvdXRwdXQpXG4jIGV4aXQgPSAoY29kZSkgLT4gY29uc29sZS5sb2coXCJwcyAtZWYgZXhpdGVkIHdpdGggI3tjb2RlfVwiKVxuIyBwcm9jZXNzID0gbmV3IEJ1ZmZlcmVkUHJvY2Vzcyh7Y29tbWFuZCwgYXJncywgc3Rkb3V0LCBleGl0fSlcbiMgYGBgXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBCdWZmZXJlZFByb2Nlc3NcbiAgIyBQdWJsaWM6IFJ1bnMgdGhlIGdpdmVuIGNvbW1hbmQgYnkgc3Bhd25pbmcgYSBuZXcgY2hpbGQgcHJvY2Vzcy5cbiAgI1xuICAjIG9wdGlvbnMgLSBBbiB7T2JqZWN0fSB3aXRoIHRoZSBmb2xsb3dpbmcga2V5czpcbiAgIyAgIDpjb21tYW5kIC0gVGhlIHtTdHJpbmd9IGNvbW1hbmQgdG8gZXhlY3V0ZS5cbiAgIyAgIDphcmdzIC0gVGhlIHtBcnJheX0gb2YgYXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIGNvbW1hbmQgKG9wdGlvbmFsKS5cbiAgIyAgIDpvcHRpb25zIC0gVGhlIG9wdGlvbnMge09iamVjdH0gdG8gcGFzcyB0byBOb2RlJ3MgYENoaWxkUHJvY2Vzcy5zcGF3bmBcbiAgIyAgICAgICAgICAgICAgbWV0aG9kIChvcHRpb25hbCkuXG4gICMgICA6c3Rkb3V0IC0gVGhlIGNhbGxiYWNrIHtGdW5jdGlvbn0gdGhhdCByZWNlaXZlcyBhIHNpbmdsZSBhcmd1bWVudCB3aGljaFxuICAjICAgICAgICAgICAgIGNvbnRhaW5zIHRoZSBzdGFuZGFyZCBvdXRwdXQgZnJvbSB0aGUgY29tbWFuZC4gVGhlIGNhbGxiYWNrIGlzXG4gICMgICAgICAgICAgICAgY2FsbGVkIGFzIGRhdGEgaXMgcmVjZWl2ZWQgYnV0IGl0J3MgYnVmZmVyZWQgdG8gZW5zdXJlIG9ubHlcbiAgIyAgICAgICAgICAgICBjb21wbGV0ZSBsaW5lcyBhcmUgcGFzc2VkIHVudGlsIHRoZSBzb3VyY2Ugc3RyZWFtIGNsb3Nlcy4gQWZ0ZXJcbiAgIyAgICAgICAgICAgICB0aGUgc291cmNlIHN0cmVhbSBoYXMgY2xvc2VkIGFsbCByZW1haW5pbmcgZGF0YSBpcyBzZW50IGluIGFcbiAgIyAgICAgICAgICAgICBmaW5hbCBjYWxsIChvcHRpb25hbCkuXG4gICMgICA6c3RkZXJyIC0gVGhlIGNhbGxiYWNrIHtGdW5jdGlvbn0gdGhhdCByZWNlaXZlcyBhIHNpbmdsZSBhcmd1bWVudCB3aGljaFxuICAjICAgICAgICAgICAgIGNvbnRhaW5zIHRoZSBzdGFuZGFyZCBlcnJvciBvdXRwdXQgZnJvbSB0aGUgY29tbWFuZC4gVGhlXG4gICMgICAgICAgICAgICAgY2FsbGJhY2sgaXMgY2FsbGVkIGFzIGRhdGEgaXMgcmVjZWl2ZWQgYnV0IGl0J3MgYnVmZmVyZWQgdG9cbiAgIyAgICAgICAgICAgICBlbnN1cmUgb25seSBjb21wbGV0ZSBsaW5lcyBhcmUgcGFzc2VkIHVudGlsIHRoZSBzb3VyY2Ugc3RyZWFtXG4gICMgICAgICAgICAgICAgY2xvc2VzLiBBZnRlciB0aGUgc291cmNlIHN0cmVhbSBoYXMgY2xvc2VkIGFsbCByZW1haW5pbmcgZGF0YVxuICAjICAgICAgICAgICAgIGlzIHNlbnQgaW4gYSBmaW5hbCBjYWxsIChvcHRpb25hbCkuXG4gICMgICA6ZXhpdCAtIFRoZSBjYWxsYmFjayB7RnVuY3Rpb259IHdoaWNoIHJlY2VpdmVzIGEgc2luZ2xlIGFyZ3VtZW50XG4gICMgICAgICAgICAgIGNvbnRhaW5pbmcgdGhlIGV4aXQgc3RhdHVzIChvcHRpb25hbCkuXG4gIGNvbnN0cnVjdG9yOiAoe2NvbW1hbmQsIGFyZ3MsIG9wdGlvbnMsIHN0ZG91dCwgc3RkZXJyLCBleGl0LCBwYW5lbH09e30sIG91dHB1dENoYXJhY3RlcnM9ZmFsc2UpIC0+XG4gICAgb3B0aW9ucyA/PSB7fVxuICAgICMgUmVsYXRlZCB0byBqb3llbnQvbm9kZSMyMzE4XG4gICAgaWYgcHJvY2Vzcy5wbGF0Zm9ybSBpcyBcIndpbjMyXCJcbiAgICAgICMgUXVvdGUgYWxsIGFyZ3VtZW50cyBhbmQgZXNjYXBlcyBpbm5lciBxdW90ZXNcbiAgICAgIGlmIGFyZ3M/XG4gICAgICAgIGNtZEFyZ3MgPSBhcmdzLm1hcCAoYXJnKSAtPlxuICAgICAgICAgIGlmIGNvbW1hbmQgaW4gWydleHBsb3Jlci5leGUnLCAnZXhwbG9yZXInXSBhbmQgL15cXC9bYS16QS1aXSssLiokLy50ZXN0KGFyZylcbiAgICAgICAgICAgICMgRG9uJ3Qgd3JhcCAvcm9vdCxDOlxcZm9sZGVyIHN0eWxlIGFyZ3VtZW50cyB0byBleHBsb3JlciBjYWxscyBpblxuICAgICAgICAgICAgIyBxdW90ZXMgc2luY2UgdGhleSB3aWxsIG5vdCBiZSBpbnRlcnByZXRlZCBjb3JyZWN0bHkgaWYgdGhleSBhcmVcbiAgICAgICAgICAgIGFyZ1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIFwiXFxcIiN7YXJnLnJlcGxhY2UoL1wiL2csICdcXFxcXCInKX1cXFwiXCJcbiAgICAgIGVsc2VcbiAgICAgICAgY21kQXJncyA9IFtdXG4gICAgICBpZiAvXFxzLy50ZXN0KGNvbW1hbmQpXG4gICAgICAgIGNtZEFyZ3MudW5zaGlmdChcIlxcXCIje2NvbW1hbmR9XFxcIlwiKVxuICAgICAgZWxzZVxuICAgICAgICBjbWRBcmdzLnVuc2hpZnQoY29tbWFuZClcbiAgICAgIGNtZEFyZ3MgPSBbJy9zJywgJy9jJywgXCJcXFwiI3tjbWRBcmdzLmpvaW4oJyAnKX1cXFwiXCJdXG4gICAgICBjbWRPcHRpb25zID0gXy5jbG9uZShvcHRpb25zKVxuICAgICAgY21kT3B0aW9ucy53aW5kb3dzVmVyYmF0aW1Bcmd1bWVudHMgPSB0cnVlXG4gICAgICBAcHJvY2VzcyA9IENoaWxkUHJvY2Vzcy5zcGF3bihwcm9jZXNzLmVudi5jb21zcGVjIG9yICdjbWQuZXhlJywgY21kQXJncywgY21kT3B0aW9ucylcbiAgICBlbHNlXG4gICAgICBAcHJvY2VzcyA9IENoaWxkUHJvY2Vzcy5zcGF3bihjb21tYW5kLCBhcmdzLCBvcHRpb25zKVxuICAgIEBraWxsZWQgPSBmYWxzZVxuXG4gICAgc3Rkb3V0Q2xvc2VkID0gdHJ1ZVxuICAgIHN0ZGVyckNsb3NlZCA9IHRydWVcbiAgICBwcm9jZXNzRXhpdGVkID0gdHJ1ZVxuICAgIGV4aXRDb2RlID0gMFxuICAgIHRyaWdnZXJFeGl0Q2FsbGJhY2sgPSAtPlxuICAgICAgcmV0dXJuIGlmIEBraWxsZWRcbiAgICAgIGlmIHN0ZG91dENsb3NlZCBhbmQgc3RkZXJyQ2xvc2VkIGFuZCBwcm9jZXNzRXhpdGVkXG4gICAgICAgIGV4aXQ/KGV4aXRDb2RlKVxuXG4gICAgaWYgc3Rkb3V0XG4gICAgICBzdGRvdXRDbG9zZWQgPSBmYWxzZVxuICAgICAgQGJ1ZmZlclN0cmVhbSBAcHJvY2Vzcy5zdGRvdXQsIHN0ZG91dCwgb3V0cHV0Q2hhcmFjdGVycywgLT5cbiAgICAgICAgc3Rkb3V0Q2xvc2VkID0gdHJ1ZVxuICAgICAgICB0cmlnZ2VyRXhpdENhbGxiYWNrKClcblxuICAgIGlmIHN0ZGVyclxuICAgICAgc3RkZXJyQ2xvc2VkID0gZmFsc2VcbiAgICAgIEBidWZmZXJTdHJlYW0gQHByb2Nlc3Muc3RkZXJyLCBzdGRlcnIsIG91dHB1dENoYXJhY3RlcnMsIC0+XG4gICAgICAgIHN0ZGVyckNsb3NlZCA9IHRydWVcbiAgICAgICAgdHJpZ2dlckV4aXRDYWxsYmFjaygpXG5cbiAgICBpZiBleGl0XG4gICAgICBwcm9jZXNzRXhpdGVkID0gZmFsc2VcbiAgICAgIEBwcm9jZXNzLm9uICdleGl0JywgKGNvZGUpIC0+XG4gICAgICAgIGV4aXRDb2RlID0gY29kZVxuXG4gICAgICAgIGlmIGV4aXRDb2RlID09IDBcbiAgICAgICAgICBwYW5lbC5jbG9zZVBhbmVsKClcblxuICAgICAgICBwcm9jZXNzRXhpdGVkID0gdHJ1ZVxuICAgICAgICB0cmlnZ2VyRXhpdENhbGxiYWNrKClcblxuICAjIEhlbHBlciBtZXRob2QgdG8gcGFzcyBkYXRhIGxpbmUgYnkgbGluZS5cbiAgI1xuICAjIHN0cmVhbSAtIFRoZSBTdHJlYW0gdG8gcmVhZCBmcm9tLlxuICAjIG9uTGluZXMgLSBUaGUgY2FsbGJhY2sgdG8gY2FsbCB3aXRoIGVhY2ggbGluZSBvZiBkYXRhLlxuICAjIG9uRG9uZSAtIFRoZSBjYWxsYmFjayB0byBjYWxsIHdoZW4gdGhlIHN0cmVhbSBoYXMgY2xvc2VkLlxuICBidWZmZXJTdHJlYW06IChzdHJlYW0sIG9uTGluZXMsIG91dHB1dENoYXJhY3RlcnMsIG9uRG9uZSkgLT5cbiAgICBzdHJlYW0uc2V0RW5jb2RpbmcoJ3V0ZjgnKVxuICAgIGJ1ZmZlcmVkID0gJydcblxuICAgIHN0cmVhbS5vbiAnZGF0YScsIChkYXRhKSA9PlxuICAgICAgcmV0dXJuIGlmIEBraWxsZWRcbiAgICAgIGlmICFvdXRwdXRDaGFyYWN0ZXJzXG4gICAgICAgIGJ1ZmZlcmVkICs9IGRhdGFcbiAgICAgICAgbGFzdE5ld2xpbmVJbmRleCA9IGJ1ZmZlcmVkLmxhc3RJbmRleE9mKCdcXG4nKVxuICAgICAgICBpZiBsYXN0TmV3bGluZUluZGV4IGlzbnQgLTFcbiAgICAgICAgICBvbkxpbmVzKGJ1ZmZlcmVkLnN1YnN0cmluZygwLCBsYXN0TmV3bGluZUluZGV4ICsgMSkpXG4gICAgICAgICAgYnVmZmVyZWQgPSBidWZmZXJlZC5zdWJzdHJpbmcobGFzdE5ld2xpbmVJbmRleCArIDEpXG4gICAgICBlbHNlXG4gICAgICAgIG9uTGluZXMoZGF0YSlcblxuICAgIHN0cmVhbS5vbiAnY2xvc2UnLCA9PlxuICAgICAgcmV0dXJuIGlmIEBraWxsZWRcbiAgICAgIG9uTGluZXMoYnVmZmVyZWQpIGlmIGJ1ZmZlcmVkLmxlbmd0aCA+IDBcbiAgICAgIG9uRG9uZSgpXG5cbiAgIyBLaWxsIGFsbCBjaGlsZCBwcm9jZXNzZXMgb2YgdGhlIHNwYXduZWQgY21kLmV4ZSBwcm9jZXNzIG9uIFdpbmRvd3MuXG4gICNcbiAgIyBUaGlzIGlzIHJlcXVpcmVkIHNpbmNlIGtpbGxpbmcgdGhlIGNtZC5leGUgZG9lcyBub3QgdGVybWluYXRlIGNoaWxkXG4gICMgcHJvY2Vzc2VzLlxuICBraWxsT25XaW5kb3dzOiAtPlxuICAgIHBhcmVudFBpZCA9IEBwcm9jZXNzLnBpZFxuICAgIGNtZCA9ICd3bWljJ1xuICAgIGFyZ3MgPSBbXG4gICAgICAncHJvY2VzcydcbiAgICAgICd3aGVyZSdcbiAgICAgIFwiKFBhcmVudFByb2Nlc3NJZD0je3BhcmVudFBpZH0pXCJcbiAgICAgICdnZXQnXG4gICAgICAncHJvY2Vzc2lkJ1xuICAgIF1cblxuICAgIHdtaWNQcm9jZXNzID0gQ2hpbGRQcm9jZXNzLnNwYXduKGNtZCwgYXJncylcbiAgICB3bWljUHJvY2Vzcy5vbiAnZXJyb3InLCAtPiAjIGlnbm9yZSBlcnJvcnNcbiAgICBvdXRwdXQgPSAnJ1xuICAgIHdtaWNQcm9jZXNzLnN0ZG91dC5vbiAnZGF0YScsIChkYXRhKSAtPiBvdXRwdXQgKz0gZGF0YVxuICAgIHdtaWNQcm9jZXNzLnN0ZG91dC5vbiAnY2xvc2UnLCA9PlxuICAgICAgcGlkc1RvS2lsbCA9IG91dHB1dC5zcGxpdCgvXFxzKy8pXG4gICAgICAgICAgICAgICAgICAgIC5maWx0ZXIgKHBpZCkgLT4gL15cXGQrJC8udGVzdChwaWQpXG4gICAgICAgICAgICAgICAgICAgIC5tYXAgKHBpZCkgLT4gcGFyc2VJbnQocGlkKVxuICAgICAgICAgICAgICAgICAgICAuZmlsdGVyIChwaWQpIC0+IHBpZCBpc250IHBhcmVudFBpZCBhbmQgMCA8IHBpZCA8IEluZmluaXR5XG5cbiAgICAgIGZvciBwaWQgaW4gcGlkc1RvS2lsbFxuICAgICAgICB0cnlcbiAgICAgICAgICBwcm9jZXNzLmtpbGwocGlkKVxuICAgICAgQGtpbGxQcm9jZXNzKClcblxuICBraWxsUHJvY2VzczogLT5cbiAgICBAcHJvY2Vzcz8ua2lsbCgpXG4gICAgQHByb2Nlc3MgPSBudWxsXG5cbiAgIyBQdWJsaWM6IFRlcm1pbmF0ZSB0aGUgcHJvY2Vzcy5cbiAga2lsbDogLT5cbiAgICByZXR1cm4gaWYgQGtpbGxlZFxuXG4gICAgQGtpbGxlZCA9IHRydWVcbiAgICBpZiBwcm9jZXNzLnBsYXRmb3JtIGlzICd3aW4zMidcbiAgICAgIEBraWxsT25XaW5kb3dzKClcbiAgICBlbHNlXG4gICAgICBAa2lsbFByb2Nlc3MoKVxuXG4gICAgdW5kZWZpbmVkXG4iXX0=
