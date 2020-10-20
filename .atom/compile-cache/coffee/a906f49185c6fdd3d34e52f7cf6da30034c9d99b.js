(function() {
  var AtomRunner, AtomRunnerView, ConfigObserver, fs, p, spawn, url,
    slice = [].slice;

  ConfigObserver = require('atom').ConfigObserver;

  spawn = require('child_process').spawn;

  fs = require('fs');

  url = require('url');

  p = require('path');

  AtomRunnerView = require('./atom-runner-view');

  AtomRunner = (function() {
    function AtomRunner() {}

    AtomRunner.prototype.config = {
      showOutputWindow: {
        title: 'Show Output Pane',
        description: 'Displays the output pane when running commands. Uncheck to hide output.',
        type: 'boolean',
        "default": true,
        order: 1
      },
      paneSplitDirection: {
        title: 'Pane Split Direction',
        description: 'The direction to split when opening the output pane.',
        type: 'string',
        "default": 'Right',
        "enum": ['Right', 'Down', 'Up', 'Left']
      }
    };

    AtomRunner.prototype.cfg = {
      ext: 'runner.extensions',
      scope: 'runner.scopes'
    };

    AtomRunner.prototype.defaultExtensionMap = {
      'spec.coffee': 'mocha',
      'ps1': 'powershell -file',
      '_test.go': 'go test'
    };

    AtomRunner.prototype.defaultScopeMap = {
      coffee: 'coffee',
      js: 'node',
      ruby: 'ruby',
      python: 'python',
      go: 'go run',
      shell: 'bash',
      powershell: 'powershell -noninteractive -noprofile -c -'
    };

    AtomRunner.prototype.timer = null;

    AtomRunner.prototype.extensionMap = null;

    AtomRunner.prototype.scopeMap = null;

    AtomRunner.prototype.splitFuncDefault = 'splitRight';

    AtomRunner.prototype.splitFuncs = {
      Right: 'splitRight',
      Left: 'splitLeft',
      Up: 'splitUp',
      Down: 'splitDown'
    };

    AtomRunner.prototype.debug = function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return console.debug.apply(console, ['[atom-runner]'].concat(slice.call(args)));
    };

    AtomRunner.prototype.initEnv = function() {
      var out, pid, ref, shell;
      if (process.platform === 'darwin') {
        ref = [process.env.SHELL || 'bash', ''], shell = ref[0], out = ref[1];
        this.debug('Importing ENV from', shell);
        pid = spawn(shell, ['--login', '-c', 'env']);
        pid.stdout.on('data', function(chunk) {
          return out += chunk;
        });
        pid.on('error', (function(_this) {
          return function() {
            return _this.debug('Failed to import ENV from', shell);
          };
        })(this));
        pid.on('close', (function(_this) {
          return function() {
            var i, len, line, match, ref1, results;
            ref1 = out.split('\n');
            results = [];
            for (i = 0, len = ref1.length; i < len; i++) {
              line = ref1[i];
              match = line.match(/^(\S+?)=(.+)/);
              if (match) {
                results.push(process.env[match[1]] = match[2]);
              } else {
                results.push(void 0);
              }
            }
            return results;
          };
        })(this));
        return pid.stdin.end();
      }
    };

    AtomRunner.prototype.destroy = function() {
      atom.config.unobserve(this.cfg.ext);
      return atom.config.unobserve(this.cfg.scope);
    };

    AtomRunner.prototype.activate = function() {
      this.initEnv();
      atom.config.setDefaults(this.cfg.ext, this.defaultExtensionMap);
      atom.config.setDefaults(this.cfg.scope, this.defaultScopeMap);
      atom.config.observe(this.cfg.ext, (function(_this) {
        return function() {
          return _this.extensionMap = atom.config.get(_this.cfg.ext);
        };
      })(this));
      atom.config.observe(this.cfg.scope, (function(_this) {
        return function() {
          return _this.scopeMap = atom.config.get(_this.cfg.scope);
        };
      })(this));
      atom.commands.add('atom-workspace', 'run:file', (function(_this) {
        return function() {
          return _this.run(false);
        };
      })(this));
      atom.commands.add('atom-workspace', 'run:selection', (function(_this) {
        return function() {
          return _this.run(true);
        };
      })(this));
      atom.commands.add('atom-workspace', 'run:stop', (function(_this) {
        return function() {
          return _this.stop();
        };
      })(this));
      atom.commands.add('atom-workspace', 'run:close', (function(_this) {
        return function() {
          return _this.stopAndClose();
        };
      })(this));
      return atom.commands.add('.atom-runner', 'run:copy', (function(_this) {
        return function() {
          return atom.clipboard.write(window.getSelection().toString());
        };
      })(this));
    };

    AtomRunner.prototype.run = function(selection) {
      var cmd, dir, dirfunc, editor, pane, panes, path, ref, view;
      editor = atom.workspace.getActiveTextEditor();
      if (editor == null) {
        return;
      }
      path = editor.getPath();
      cmd = this.commandFor(editor, selection);
      if (cmd == null) {
        console.warn("No registered executable for file '" + path + "'");
        return;
      }
      if (atom.config.get('atom-runner.showOutputWindow')) {
        ref = this.runnerView(), pane = ref.pane, view = ref.view;
        if (view == null) {
          view = new AtomRunnerView(editor.getTitle());
          panes = atom.workspace.getPanes();
          dir = atom.config.get('atom-runner.paneSplitDirection');
          dirfunc = this.splitFuncs[dir] || this.splitFuncDefault;
          pane = panes[panes.length - 1][dirfunc](view);
        }
      } else {
        view = {
          mocked: true,
          append: function(text, type) {
            if (type === 'stderr') {
              return console.error(text);
            } else {
              return console.log(text);
            }
          },
          scrollToBottom: function() {},
          clear: function() {},
          footer: function() {}
        };
      }
      if (!view.mocked) {
        view.setTitle(editor.getTitle());
        pane.activateItem(view);
      }
      return this.execute(cmd, editor, view, selection);
    };

    AtomRunner.prototype.stop = function(view) {
      if (this.child) {
        if (view == null) {
          view = this.runnerView().view;
        }
        if (view && (view.isOnDom() != null)) {
          view.append('^C', 'stdin');
        } else {
          this.debug('Killed child', this.child.pid);
        }
        this.child.kill('SIGINT');
        if (this.child.killed) {
          this.child = null;
        }
      }
      if (this.timer) {
        clearInterval(this.timer);
      }
      return this.timer = null;
    };

    AtomRunner.prototype.stopAndClose = function() {
      var pane, ref, view;
      ref = this.runnerView(), pane = ref.pane, view = ref.view;
      if (pane != null) {
        pane.removeItem(view);
      }
      return this.stop(view);
    };

    AtomRunner.prototype.execute = function(cmd, editor, view, selection) {
      var args, currentPid, dir, err, splitCmd, startTime;
      this.stop();
      view.clear();
      args = [];
      if (editor.getPath()) {
        editor.save();
        if (!selection) {
          args.push(editor.getPath());
        }
      }
      splitCmd = cmd.split(/\s+/);
      if (splitCmd.length > 1) {
        cmd = splitCmd[0];
        args = splitCmd.slice(1).concat(args);
      }
      try {
        dir = atom.project.getPaths()[0] || '.';
        try {
          if (!fs.statSync(dir).isDirectory()) {
            throw new Error("Bad dir");
          }
        } catch (error) {
          dir = p.dirname(dir);
        }
        this.child = spawn(cmd, args, {
          cwd: dir
        });
        this.timer = setInterval(((function(_this) {
          return function() {
            return view.appendFooter('.');
          };
        })(this)), 750);
        currentPid = this.child.pid;
        this.child.on('error', (function(_this) {
          return function(err) {
            if (err.message.match(/\bENOENT$/)) {
              view.append('Unable to find command: ' + cmd + '\n', 'stderr');
              view.append('Are you sure PATH is configured correctly?\n\n', 'stderr');
              view.append('ENV PATH: ' + process.env.PATH + '\n\n', 'stderr');
            }
            view.append(err.stack, 'stderr');
            view.scrollToBottom();
            _this.child = null;
            if (_this.timer) {
              return clearInterval(_this.timer);
            }
          };
        })(this));
        this.child.stderr.on('data', (function(_this) {
          return function(data) {
            view.append(data, 'stderr');
            return view.scrollToBottom();
          };
        })(this));
        this.child.stdout.on('data', (function(_this) {
          return function(data) {
            view.append(data, 'stdout');
            return view.scrollToBottom();
          };
        })(this));
        this.child.on('close', (function(_this) {
          return function(code, signal) {
            var time;
            if (_this.child && _this.child.pid === currentPid) {
              time = (new Date - startTime) / 1000;
              view.appendFooter(" Exited with code=" + code + " in " + time + " seconds.");
              view.scrollToBottom();
              if (_this.timer) {
                return clearInterval(_this.timer);
              }
            }
          };
        })(this));
      } catch (error) {
        err = error;
        view.append(err.stack, 'stderr');
        view.scrollToBottom();
        this.stop();
      }
      startTime = new Date;
      try {
        if (selection) {
          this.child.stdin.write(editor.getLastSelection().getText());
        } else if (!editor.getPath()) {
          this.child.stdin.write(editor.getText());
        }
        this.child.stdin.end();
      } catch (error) {}
      return view.footer("Running: " + cmd + " (cwd=" + (editor.getPath()) + " pid=" + this.child.pid + ").");
    };

    AtomRunner.prototype.commandFor = function(editor, selection) {
      var boundary, ext, i, j, len, len1, name, ref, ref1, scope, shebang;
      shebang = this.commandForShebang(editor);
      if (shebang != null) {
        return shebang;
      }
      if (!selection) {
        if (editor.getPath() != null) {
          ref = Object.keys(this.extensionMap).sort(function(a, b) {
            return b.length - a.length;
          });
          for (i = 0, len = ref.length; i < len; i++) {
            ext = ref[i];
            boundary = ext.match(/^\b/) ? '' : '\\b';
            if (editor.getPath().match(boundary + ext + '$')) {
              return this.extensionMap[ext];
            }
          }
        }
      }
      scope = editor.getLastCursor().getScopeDescriptor().scopes[0];
      ref1 = Object.keys(this.scopeMap);
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        name = ref1[j];
        if (scope.match('^source\\.' + name + '\\b')) {
          return this.scopeMap[name];
        }
      }
    };

    AtomRunner.prototype.commandForShebang = function(editor) {
      var match;
      match = editor.lineTextForBufferRow(0).match(/^#!\s*(.+)/);
      return match && match[1];
    };

    AtomRunner.prototype.runnerView = function() {
      var i, j, len, len1, pane, ref, ref1, view;
      ref = atom.workspace.getPanes();
      for (i = 0, len = ref.length; i < len; i++) {
        pane = ref[i];
        ref1 = pane.getItems();
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          view = ref1[j];
          if (view instanceof AtomRunnerView) {
            return {
              pane: pane,
              view: view
            };
          }
        }
      }
      return {
        pane: null,
        view: null
      };
    };

    return AtomRunner;

  })();

  module.exports = new AtomRunner;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9hYmVsYS8uYXRvbS9wYWNrYWdlcy9hdG9tLXJ1bm5lci9saWIvYXRvbS1ydW5uZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSw2REFBQTtJQUFBOztFQUFDLGlCQUFrQixPQUFBLENBQVEsTUFBUjs7RUFFbkIsS0FBQSxHQUFRLE9BQUEsQ0FBUSxlQUFSLENBQXdCLENBQUM7O0VBQ2pDLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxHQUFBLEdBQU0sT0FBQSxDQUFRLEtBQVI7O0VBQ04sQ0FBQSxHQUFJLE9BQUEsQ0FBUSxNQUFSOztFQUVKLGNBQUEsR0FBaUIsT0FBQSxDQUFRLG9CQUFSOztFQUVYOzs7eUJBQ0osTUFBQSxHQUNFO01BQUEsZ0JBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxrQkFBUDtRQUNBLFdBQUEsRUFBYSx5RUFEYjtRQUVBLElBQUEsRUFBTSxTQUZOO1FBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQUhUO1FBSUEsS0FBQSxFQUFPLENBSlA7T0FERjtNQU1BLGtCQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sc0JBQVA7UUFDQSxXQUFBLEVBQWEsc0RBRGI7UUFFQSxJQUFBLEVBQU0sUUFGTjtRQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsT0FIVDtRQUlBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxPQUFELEVBQVUsTUFBVixFQUFrQixJQUFsQixFQUF3QixNQUF4QixDQUpOO09BUEY7Ozt5QkFhRixHQUFBLEdBQ0U7TUFBQSxHQUFBLEVBQUssbUJBQUw7TUFDQSxLQUFBLEVBQU8sZUFEUDs7O3lCQUdGLG1CQUFBLEdBQ0U7TUFBQSxhQUFBLEVBQWUsT0FBZjtNQUNBLEtBQUEsRUFBTyxrQkFEUDtNQUVBLFVBQUEsRUFBWSxTQUZaOzs7eUJBSUYsZUFBQSxHQUNFO01BQUEsTUFBQSxFQUFRLFFBQVI7TUFDQSxF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QUFmLEdBQXNCLEtBQWxDLENBQUg7QUFDRSxpQkFBTyxJQUFDLENBQUEsUUFBUyxDQUFBLElBQUEsRUFEbkI7O0FBREY7SUFoQlU7O3lCQW9CWixpQkFBQSxHQUFtQixTQUFDLE1BQUQ7QUFDakIsVUFBQTtNQUFBLEtBQUEsR0FBUSxNQUFNLENBQUMsb0JBQVAsQ0FBNEIsQ0FBNUIsQ0FBOEIsQ0FBQyxLQUEvQixDQUFxQyxZQUFyQzthQUNSLEtBQUEsSUFBVSxLQUFNLENBQUEsQ0FBQTtJQUZDOzt5QkFJbkIsVUFBQSxHQUFZLFNBQUE7QUFDVixVQUFBO0FBQUE7QUFBQSxXQUFBLHFDQUFBOztBQUNFO0FBQUEsYUFBQSx3Q0FBQTs7VUFDRSxJQUFtQyxJQUFBLFlBQWdCLGNBQW5EO0FBQUEsbUJBQU87Y0FBQyxJQUFBLEVBQU0sSUFBUDtjQUFhLElBQUEsRUFBTSxJQUFuQjtjQUFQOztBQURGO0FBREY7YUFHQTtRQUFDLElBQUEsRUFBTSxJQUFQO1FBQWEsSUFBQSxFQUFNLElBQW5COztJQUpVOzs7Ozs7RUFPZCxNQUFNLENBQUMsT0FBUCxHQUFpQixJQUFJO0FBdE9yQiIsInNvdXJjZXNDb250ZW50IjpbIntDb25maWdPYnNlcnZlcn0gPSByZXF1aXJlICdhdG9tJ1xuXG5zcGF3biA9IHJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKS5zcGF3blxuZnMgPSByZXF1aXJlKCdmcycpXG51cmwgPSByZXF1aXJlKCd1cmwnKVxucCA9IHJlcXVpcmUoJ3BhdGgnKVxuXG5BdG9tUnVubmVyVmlldyA9IHJlcXVpcmUgJy4vYXRvbS1ydW5uZXItdmlldydcblxuY2xhc3MgQXRvbVJ1bm5lclxuICBjb25maWc6XG4gICAgc2hvd091dHB1dFdpbmRvdzpcbiAgICAgIHRpdGxlOiAnU2hvdyBPdXRwdXQgUGFuZSdcbiAgICAgIGRlc2NyaXB0aW9uOiAnRGlzcGxheXMgdGhlIG91dHB1dCBwYW5lIHdoZW4gcnVubmluZyBjb21tYW5kcy4gVW5jaGVjayB0byBoaWRlIG91dHB1dC4nXG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIG9yZGVyOiAxXG4gICAgcGFuZVNwbGl0RGlyZWN0aW9uOlxuICAgICAgdGl0bGU6ICdQYW5lIFNwbGl0IERpcmVjdGlvbidcbiAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIGRpcmVjdGlvbiB0byBzcGxpdCB3aGVuIG9wZW5pbmcgdGhlIG91dHB1dCBwYW5lLidcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAnUmlnaHQnXG4gICAgICBlbnVtOiBbJ1JpZ2h0JywgJ0Rvd24nLCAnVXAnLCAnTGVmdCddXG5cbiAgY2ZnOlxuICAgIGV4dDogJ3J1bm5lci5leHRlbnNpb25zJ1xuICAgIHNjb3BlOiAncnVubmVyLnNjb3BlcydcblxuICBkZWZhdWx0RXh0ZW5zaW9uTWFwOlxuICAgICdzcGVjLmNvZmZlZSc6ICdtb2NoYSdcbiAgICAncHMxJzogJ3Bvd2Vyc2hlbGwgLWZpbGUnXG4gICAgJ190ZXN0LmdvJzogJ2dvIHRlc3QnXG5cbiAgZGVmYXVsdFNjb3BlTWFwOlxuICAgIGNvZmZlZTogJ2NvZmZlZSdcbiAgICBqczogJ25vZGUnXG4gICAgcnVieTogJ3J1YnknXG4gICAgcHl0aG9uOiAncHl0aG9uJ1xuICAgIGdvOiAnZ28gcnVuJ1xuICAgIHNoZWxsOiAnYmFzaCdcbiAgICBwb3dlcnNoZWxsOiAncG93ZXJzaGVsbCAtbm9uaW50ZXJhY3RpdmUgLW5vcHJvZmlsZSAtYyAtJ1xuXG4gIHRpbWVyOiBudWxsXG4gIGV4dGVuc2lvbk1hcDogbnVsbFxuICBzY29wZU1hcDogbnVsbFxuICBzcGxpdEZ1bmNEZWZhdWx0OiAnc3BsaXRSaWdodCdcbiAgc3BsaXRGdW5jczpcbiAgICBSaWdodDogJ3NwbGl0UmlnaHQnXG4gICAgTGVmdDogJ3NwbGl0TGVmdCdcbiAgICBVcDogJ3NwbGl0VXAnXG4gICAgRG93bjogJ3NwbGl0RG93bidcblxuICBkZWJ1ZzogKGFyZ3MuLi4pIC0+XG4gICAgY29uc29sZS5kZWJ1ZygnW2F0b20tcnVubmVyXScsIGFyZ3MuLi4pXG5cbiAgaW5pdEVudjogLT5cbiAgICBpZiBwcm9jZXNzLnBsYXRmb3JtID09ICdkYXJ3aW4nXG4gICAgICBbc2hlbGwsIG91dF0gPSBbcHJvY2Vzcy5lbnYuU0hFTEwgfHwgJ2Jhc2gnLCAnJ11cbiAgICAgIEBkZWJ1ZygnSW1wb3J0aW5nIEVOViBmcm9tJywgc2hlbGwpXG4gICAgICBwaWQgPSBzcGF3bihzaGVsbCwgWyctLWxvZ2luJywgJy1jJywgJ2VudiddKVxuICAgICAgcGlkLnN0ZG91dC5vbiAnZGF0YScsIChjaHVuaykgLT4gb3V0ICs9IGNodW5rXG4gICAgICBwaWQub24gJ2Vycm9yJywgPT5cbiAgICAgICAgQGRlYnVnKCdGYWlsZWQgdG8gaW1wb3J0IEVOViBmcm9tJywgc2hlbGwpXG4gICAgICBwaWQub24gJ2Nsb3NlJywgPT5cbiAgICAgICAgZm9yIGxpbmUgaW4gb3V0LnNwbGl0KCdcXG4nKVxuICAgICAgICAgIG1hdGNoID0gbGluZS5tYXRjaCgvXihcXFMrPyk9KC4rKS8pXG4gICAgICAgICAgcHJvY2Vzcy5lbnZbbWF0Y2hbMV1dID0gbWF0Y2hbMl0gaWYgbWF0Y2hcbiAgICAgIHBpZC5zdGRpbi5lbmQoKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgYXRvbS5jb25maWcudW5vYnNlcnZlIEBjZmcuZXh0XG4gICAgYXRvbS5jb25maWcudW5vYnNlcnZlIEBjZmcuc2NvcGVcblxuICBhY3RpdmF0ZTogLT5cbiAgICBAaW5pdEVudigpXG4gICAgYXRvbS5jb25maWcuc2V0RGVmYXVsdHMgQGNmZy5leHQsIEBkZWZhdWx0RXh0ZW5zaW9uTWFwXG4gICAgYXRvbS5jb25maWcuc2V0RGVmYXVsdHMgQGNmZy5zY29wZSwgQGRlZmF1bHRTY29wZU1hcFxuICAgIGF0b20uY29uZmlnLm9ic2VydmUgQGNmZy5leHQsID0+XG4gICAgICBAZXh0ZW5zaW9uTWFwID0gYXRvbS5jb25maWcuZ2V0KEBjZmcuZXh0KVxuICAgIGF0b20uY29uZmlnLm9ic2VydmUgQGNmZy5zY29wZSwgPT5cbiAgICAgIEBzY29wZU1hcCA9IGF0b20uY29uZmlnLmdldChAY2ZnLnNjb3BlKVxuICAgIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdydW46ZmlsZScsID0+IEBydW4oZmFsc2UpXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ3J1bjpzZWxlY3Rpb24nLCA9PiBAcnVuKHRydWUpXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ3J1bjpzdG9wJywgPT4gQHN0b3AoKVxuICAgIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdydW46Y2xvc2UnLCA9PiBAc3RvcEFuZENsb3NlKClcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCAnLmF0b20tcnVubmVyJywgJ3J1bjpjb3B5JywgPT5cbiAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKHdpbmRvdy5nZXRTZWxlY3Rpb24oKS50b1N0cmluZygpKVxuXG4gIHJ1bjogKHNlbGVjdGlvbikgLT5cbiAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICByZXR1cm4gdW5sZXNzIGVkaXRvcj9cblxuICAgIHBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgY21kID0gQGNvbW1hbmRGb3IoZWRpdG9yLCBzZWxlY3Rpb24pXG4gICAgdW5sZXNzIGNtZD9cbiAgICAgIGNvbnNvbGUud2FybihcIk5vIHJlZ2lzdGVyZWQgZXhlY3V0YWJsZSBmb3IgZmlsZSAnI3twYXRofSdcIilcbiAgICAgIHJldHVyblxuXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdhdG9tLXJ1bm5lci5zaG93T3V0cHV0V2luZG93JylcbiAgICAgIHtwYW5lLCB2aWV3fSA9IEBydW5uZXJWaWV3KClcbiAgICAgIGlmIG5vdCB2aWV3P1xuICAgICAgICB2aWV3ID0gbmV3IEF0b21SdW5uZXJWaWV3KGVkaXRvci5nZXRUaXRsZSgpKVxuICAgICAgICBwYW5lcyA9IGF0b20ud29ya3NwYWNlLmdldFBhbmVzKClcbiAgICAgICAgZGlyID0gYXRvbS5jb25maWcuZ2V0KCdhdG9tLXJ1bm5lci5wYW5lU3BsaXREaXJlY3Rpb24nKVxuICAgICAgICBkaXJmdW5jID0gQHNwbGl0RnVuY3NbZGlyXSB8fCBAc3BsaXRGdW5jRGVmYXVsdFxuICAgICAgICBwYW5lID0gcGFuZXNbcGFuZXMubGVuZ3RoIC0gMV1bZGlyZnVuY10odmlldylcbiAgICBlbHNlXG4gICAgICB2aWV3ID1cbiAgICAgICAgbW9ja2VkOiB0cnVlXG4gICAgICAgIGFwcGVuZDogKHRleHQsIHR5cGUpIC0+XG4gICAgICAgICAgaWYgdHlwZSA9PSAnc3RkZXJyJ1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcih0ZXh0KVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRleHQpXG4gICAgICAgIHNjcm9sbFRvQm90dG9tOiAtPlxuICAgICAgICBjbGVhcjogLT5cbiAgICAgICAgZm9vdGVyOiAtPlxuXG4gICAgdW5sZXNzIHZpZXcubW9ja2VkXG4gICAgICB2aWV3LnNldFRpdGxlKGVkaXRvci5nZXRUaXRsZSgpKVxuICAgICAgcGFuZS5hY3RpdmF0ZUl0ZW0odmlldylcblxuICAgIEBleGVjdXRlKGNtZCwgZWRpdG9yLCB2aWV3LCBzZWxlY3Rpb24pXG5cbiAgc3RvcDogKHZpZXcpIC0+XG4gICAgaWYgQGNoaWxkXG4gICAgICB2aWV3ID89IEBydW5uZXJWaWV3KCkudmlld1xuICAgICAgaWYgdmlldyBhbmQgdmlldy5pc09uRG9tKCk/XG4gICAgICAgIHZpZXcuYXBwZW5kKCdeQycsICdzdGRpbicpXG4gICAgICBlbHNlXG4gICAgICAgIEBkZWJ1ZygnS2lsbGVkIGNoaWxkJywgQGNoaWxkLnBpZClcbiAgICAgIEBjaGlsZC5raWxsKCdTSUdJTlQnKVxuICAgICAgaWYgQGNoaWxkLmtpbGxlZFxuICAgICAgICBAY2hpbGQgPSBudWxsXG4gICAgY2xlYXJJbnRlcnZhbChAdGltZXIpIGlmIEB0aW1lclxuICAgIEB0aW1lciA9IG51bGxcblxuICBzdG9wQW5kQ2xvc2U6IC0+XG4gICAge3BhbmUsIHZpZXd9ID0gQHJ1bm5lclZpZXcoKVxuICAgIHBhbmU/LnJlbW92ZUl0ZW0odmlldylcbiAgICBAc3RvcCh2aWV3KVxuXG4gIGV4ZWN1dGU6IChjbWQsIGVkaXRvciwgdmlldywgc2VsZWN0aW9uKSAtPlxuICAgIEBzdG9wKClcbiAgICB2aWV3LmNsZWFyKClcblxuICAgIGFyZ3MgPSBbXVxuICAgIGlmIGVkaXRvci5nZXRQYXRoKClcbiAgICAgIGVkaXRvci5zYXZlKClcbiAgICAgIGFyZ3MucHVzaChlZGl0b3IuZ2V0UGF0aCgpKSBpZiAhc2VsZWN0aW9uXG4gICAgc3BsaXRDbWQgPSBjbWQuc3BsaXQoL1xccysvKVxuICAgIGlmIHNwbGl0Q21kLmxlbmd0aCA+IDFcbiAgICAgIGNtZCA9IHNwbGl0Q21kWzBdXG4gICAgICBhcmdzID0gc3BsaXRDbWQuc2xpY2UoMSkuY29uY2F0KGFyZ3MpXG4gICAgdHJ5XG4gICAgICBkaXIgPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVswXSB8fCAnLidcbiAgICAgIHRyeVxuICAgICAgICBpZiBub3QgZnMuc3RhdFN5bmMoZGlyKS5pc0RpcmVjdG9yeSgpXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQmFkIGRpclwiKVxuICAgICAgY2F0Y2hcbiAgICAgICAgZGlyID0gcC5kaXJuYW1lKGRpcilcbiAgICAgIEBjaGlsZCA9IHNwYXduKGNtZCwgYXJncywgY3dkOiBkaXIpXG4gICAgICBAdGltZXIgPSBzZXRJbnRlcnZhbCgoPT4gdmlldy5hcHBlbmRGb290ZXIoJy4nKSksIDc1MClcbiAgICAgIGN1cnJlbnRQaWQgPSBAY2hpbGQucGlkXG4gICAgICBAY2hpbGQub24gJ2Vycm9yJywgKGVycikgPT5cbiAgICAgICAgaWYgZXJyLm1lc3NhZ2UubWF0Y2goL1xcYkVOT0VOVCQvKVxuICAgICAgICAgIHZpZXcuYXBwZW5kKCdVbmFibGUgdG8gZmluZCBjb21tYW5kOiAnICsgY21kICsgJ1xcbicsICdzdGRlcnInKVxuICAgICAgICAgIHZpZXcuYXBwZW5kKCdBcmUgeW91IHN1cmUgUEFUSCBpcyBjb25maWd1cmVkIGNvcnJlY3RseT9cXG5cXG4nLCAnc3RkZXJyJylcbiAgICAgICAgICB2aWV3LmFwcGVuZCgnRU5WIFBBVEg6ICcgKyBwcm9jZXNzLmVudi5QQVRIICsgJ1xcblxcbicsICdzdGRlcnInKVxuICAgICAgICB2aWV3LmFwcGVuZChlcnIuc3RhY2ssICdzdGRlcnInKVxuICAgICAgICB2aWV3LnNjcm9sbFRvQm90dG9tKClcbiAgICAgICAgQGNoaWxkID0gbnVsbFxuICAgICAgICBjbGVhckludGVydmFsKEB0aW1lcikgaWYgQHRpbWVyXG4gICAgICBAY2hpbGQuc3RkZXJyLm9uICdkYXRhJywgKGRhdGEpID0+XG4gICAgICAgIHZpZXcuYXBwZW5kKGRhdGEsICdzdGRlcnInKVxuICAgICAgICB2aWV3LnNjcm9sbFRvQm90dG9tKClcbiAgICAgIEBjaGlsZC5zdGRvdXQub24gJ2RhdGEnLCAoZGF0YSkgPT5cbiAgICAgICAgdmlldy5hcHBlbmQoZGF0YSwgJ3N0ZG91dCcpXG4gICAgICAgIHZpZXcuc2Nyb2xsVG9Cb3R0b20oKVxuICAgICAgQGNoaWxkLm9uICdjbG9zZScsIChjb2RlLCBzaWduYWwpID0+XG4gICAgICAgIGlmIEBjaGlsZCAmJiBAY2hpbGQucGlkID09IGN1cnJlbnRQaWRcbiAgICAgICAgICB0aW1lID0gKChuZXcgRGF0ZSAtIHN0YXJ0VGltZSkgLyAxMDAwKVxuICAgICAgICAgIHZpZXcuYXBwZW5kRm9vdGVyKFwiIEV4aXRlZCB3aXRoIGNvZGU9I3tjb2RlfSBpbiAje3RpbWV9IHNlY29uZHMuXCIpXG4gICAgICAgICAgdmlldy5zY3JvbGxUb0JvdHRvbSgpXG4gICAgICAgICAgY2xlYXJJbnRlcnZhbChAdGltZXIpIGlmIEB0aW1lclxuICAgIGNhdGNoIGVyclxuICAgICAgdmlldy5hcHBlbmQoZXJyLnN0YWNrLCAnc3RkZXJyJylcbiAgICAgIHZpZXcuc2Nyb2xsVG9Cb3R0b20oKVxuICAgICAgQHN0b3AoKVxuXG4gICAgc3RhcnRUaW1lID0gbmV3IERhdGVcbiAgICB0cnlcbiAgICAgIGlmIHNlbGVjdGlvblxuICAgICAgICBAY2hpbGQuc3RkaW4ud3JpdGUoZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKS5nZXRUZXh0KCkpXG4gICAgICBlbHNlIGlmICFlZGl0b3IuZ2V0UGF0aCgpXG4gICAgICAgIEBjaGlsZC5zdGRpbi53cml0ZShlZGl0b3IuZ2V0VGV4dCgpKVxuICAgICAgQGNoaWxkLnN0ZGluLmVuZCgpXG4gICAgdmlldy5mb290ZXIoXCJSdW5uaW5nOiAje2NtZH0gKGN3ZD0je2VkaXRvci5nZXRQYXRoKCl9IHBpZD0je0BjaGlsZC5waWR9KS5cIilcblxuICBjb21tYW5kRm9yOiAoZWRpdG9yLCBzZWxlY3Rpb24pIC0+XG4gICAgIyB0cnkgdG8gZmluZCBhIHNoZWJhbmdcbiAgICBzaGViYW5nID0gQGNvbW1hbmRGb3JTaGViYW5nKGVkaXRvcilcbiAgICByZXR1cm4gc2hlYmFuZyBpZiBzaGViYW5nP1xuXG4gICAgIyBEb24ndCBsb29rdXAgYnkgZXh0ZW5zaW9uIGZyb20gc2VsZWN0aW9uLlxuICAgIGlmICghc2VsZWN0aW9uKVxuICAgICAgIyB0cnkgdG8gbG9va3VwIGJ5IGV4dGVuc2lvblxuICAgICAgaWYgZWRpdG9yLmdldFBhdGgoKT9cbiAgICAgICAgZm9yIGV4dCBpbiBPYmplY3Qua2V5cyhAZXh0ZW5zaW9uTWFwKS5zb3J0KChhLGIpIC0+IGIubGVuZ3RoIC0gYS5sZW5ndGgpXG4gICAgICAgICAgYm91bmRhcnkgPSBpZiBleHQubWF0Y2goL15cXGIvKSB0aGVuICcnIGVsc2UgJ1xcXFxiJ1xuICAgICAgICAgIGlmIGVkaXRvci5nZXRQYXRoKCkubWF0Y2goYm91bmRhcnkgKyBleHQgKyAnJCcpXG4gICAgICAgICAgICByZXR1cm4gQGV4dGVuc2lvbk1hcFtleHRdXG5cbiAgICAjIGxvb2t1cCBieSBncmFtbWFyXG4gICAgc2NvcGUgPSBlZGl0b3IuZ2V0TGFzdEN1cnNvcigpLmdldFNjb3BlRGVzY3JpcHRvcigpLnNjb3Blc1swXVxuICAgIGZvciBuYW1lIGluIE9iamVjdC5rZXlzKEBzY29wZU1hcClcbiAgICAgIGlmIHNjb3BlLm1hdGNoKCdec291cmNlXFxcXC4nICsgbmFtZSArICdcXFxcYicpXG4gICAgICAgIHJldHVybiBAc2NvcGVNYXBbbmFtZV1cblxuICBjb21tYW5kRm9yU2hlYmFuZzogKGVkaXRvcikgLT5cbiAgICBtYXRjaCA9IGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdygwKS5tYXRjaCgvXiMhXFxzKiguKykvKVxuICAgIG1hdGNoIGFuZCBtYXRjaFsxXVxuXG4gIHJ1bm5lclZpZXc6IC0+XG4gICAgZm9yIHBhbmUgaW4gYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZXMoKVxuICAgICAgZm9yIHZpZXcgaW4gcGFuZS5nZXRJdGVtcygpXG4gICAgICAgIHJldHVybiB7cGFuZTogcGFuZSwgdmlldzogdmlld30gaWYgdmlldyBpbnN0YW5jZW9mIEF0b21SdW5uZXJWaWV3XG4gICAge3BhbmU6IG51bGwsIHZpZXc6IG51bGx9XG5cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgQXRvbVJ1bm5lclxuIl19
