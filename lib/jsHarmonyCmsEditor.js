/*!
Copyright 2021 apHarmony

This file is part of jsHarmony.

jsHarmony is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

jsHarmony is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with this package.  If not, see <http://www.gnu.org/licenses/>.
*/

;(function(){

  var jsHarmonyCmsEditor = (function(){
    function jsHarmonyCmsEditor(config){
      var _this = this;
      var _GET = {};

      //==========
      //Parameters
      //==========
      config = extend({
        access_keys: [],                //Array(string) CMS Editor Access Keys (set to '*' to disable access key check)
      }, config);

      //=================
      //Public Properties
      //=================
      this.onError = function(err){ console.error(err.message); };  //function(err){ }

      //=================
      //Private Properties
      //=================
      extend(this, config);

      this.liveRenderActive = false;
      this.liveRenderTriggers = [];
      this.timers = {};

      this.isLoading = false;
      this.loadQueue = [];

      //Constructor
      this.onInit = function(){
        _GET = _this.parseGET();
        if(_this.isInEditor()) _this.initEditor();
      }

      //================
      //Public Functions
      //================

      //Returns true if page is opened from CMS Editor
      this.isInEditor = function(){ return !!_GET.jshcms_token; }


      //==================
      //Internal Functions
      //==================

      //CMS Editor
      //----------

      this.initEditor = function(){
        if(!_GET.jshcms_token) return;
        if(!_GET.jshcms_access_key) return alert('Missing CMS Access Key querystring parameter');
        if(!_GET.jshcms_url) return alert('Missing CMS URL querystring parameter');
        if(!document || (document.compatMode !== 'CSS1Compat')) return alert('CMS Editor requires Standards Document mode.  Please add "<!DOCTYPE html>" to the top of the HTML');
        _this.startLoading(_this);
        _this.validateAccessKey(_GET.jshcms_access_key, _GET.jshcms_url, _GET._, function(err, valid){
          if(!valid) return alert('Invalid CMS Access Key');
          //Load CMS JS
          var entry_url = _GET.jshcms_url+'js/jsHarmonyCMS.js';
          _this.loadScript(entry_url, function(){
            _this.stopLoading(_this);
          });
        });
      }

      this.validateAccessKey = function(access_key, server_url, timestamp, callback){
        access_key = access_key.toString();
        server_url = server_url.toLowerCase();
        timestamp = parseInt(timestamp||'');
        if(!timestamp || (timestamp < (new Date().getTime() - 7 * 24 * 60 * 60 * 1000)) || (timestamp > (new Date().getTime() + 24 * 60 * 60 * 1000))) return callback(null, false);
        if(access_key.length < 64) return
        var access_hash = access_key.substr(32);
        var access_salt = '';
        for(var i=0;i<8;i++){
          var salt_part = parseInt(access_key.substr(i*4,4), 16);
          var domain_part = parseInt(access_hash.substr(i*4,4), 16);
          access_salt += _this.pad((salt_part ^ domain_part).toString(16).toLowerCase(), '0', 4);
        }
        if(!Array.isArray(_this.access_keys)) _this.access_keys = [_this.access_keys];
        var foundMatch = false;
        _this.eachParallel(_this.access_keys, function(test_key, idx, validate_cb){
          var test_key = (test_key||'').toString();
          if(test_key == '*'){ foundMatch = true; return validate_cb(); }
          if(!test_key || (test_key.length < 64)) return validate_cb();
          var test_domain_hash = test_key.substr(32);
          var test_salt = '';
          for(var i=0;i<8;i++){
            var test_salt_part = parseInt(test_key.substr(i*4,4), 16);
            var test_domain_part = parseInt(test_domain_hash.substr(i*4,4), 16);
            test_salt += _this.pad((test_salt_part ^ test_domain_part).toString(16).toLowerCase(), '0', 4);
          }
          if(access_salt!==test_salt) return validate_cb();
          window.crypto.subtle.digest('SHA-256', Uint8Array.from((test_salt+'-'+server_url).split('').map(function(chr){ return chr.charCodeAt(0); }))).then(function(rslt){
            var domain_hash = Array.prototype.slice.call(new Uint8Array(rslt)).map(function(b){ return ('00' + b.toString(16)).slice(-2); }).join('');
            if(domain_hash!==test_domain_hash) return validate_cb();
            window.crypto.subtle.digest('SHA-256', Uint8Array.from((test_salt+'-'+server_url+'-'+(timestamp||'').toString()).split('').map(function(chr){ return chr.charCodeAt(0); }))).then(function(rslt){
              var test_access_hash = Array.prototype.slice.call(new Uint8Array(rslt)).map(function(b){ return ('00' + b.toString(16)).slice(-2); }).join('');
              if(access_hash!==test_access_hash) return validate_cb();
              foundMatch = true;
              return validate_cb();
            }, function(err){ return validate_cb(err); });
          }, function(err){ return validate_cb(err); });
        }, function(err){
          if(err) return callback(err);
          return callback(null, foundMatch);
        });
      }

      //Live Render
      //-----------

      this.liveRenderRefreshAll = function(){
        if(!_this.liveRenderActive) return;
        var allTriggers = this.liveRenderTriggers.slice(0);
        for(var i=0;i<allTriggers.length;i++){
          _this.liveRenderRefresh(allTriggers[i]);
        }
      }

      this.liveRenderRefresh = function(trigger){
        if(!trigger.selector) return;

        var isSelectorFunc = (typeof(trigger.selector) === 'function');
        var nodes = (isSelectorFunc ? trigger.selector() : document.querySelectorAll(trigger.selector));
        var newNodes = [];
        for(var i=0;i<nodes.length;i++){
          var foundNode = false;
          for(var j=0;j<trigger.lastNodes.length;j++){
            if(nodes[i]==trigger.lastNodes[j]){ foundNode = true; break; }
          }
          if(!foundNode) newNodes.push(nodes[i]);
        }
        trigger.lastNodes = nodes;
        for(var i=0;i<newNodes.length;i++){
          var obj = newNodes[i];
          if(trigger.options.addClass){
            if(obj.classList.contains('jshcms_rendered_'+trigger.id)) continue;
            obj.classList.add('jshcms_rendered_'+trigger.id);
          }
          trigger.action(obj);
        }
      }

      this.liveRender = function(sel, action, options, onComplete){
        action = action || function(){};
        onComplete = onComplete || function(){};
        options = options || {};
        if(!('addClass' in options)) options.addClass = true;
        var newTrigger = { selector: sel, action: action, lastNodes: [], onComplete: onComplete, options: options, id: _this.liveRenderTriggers.length+1 };
        _this.liveRenderTriggers.push(newTrigger);
        _this.liveRenderRefresh(newTrigger);
        if(_this.liveRenderActive) return;
        _this.liveRenderActive = true;

        document.addEventListener('readystatechange', function(){
          _this.liveRenderRefreshAll();
        });
        var observer = null;
        if(document){
          observer = new MutationObserver(function(mutationsList, observer){ _this.liveRenderRefreshAll(); });
          observer.observe(document, { childList: true, subtree: true });
        }
        setTimeout(function(){
          if(observer) observer.disconnect();
          _this.liveRenderRefreshAll();
          for(var i=0;i<_this.liveRenderTriggers.length;i++) _this.liveRenderTriggers[i].onComplete();
          for(var i=0;i<_this.liveRenderTriggers.length;i++){
            var triggerClass = 'jshcms_rendered_'+_this.liveRenderTriggers[i].id;
            var triggerObjects = document.querySelectorAll('.'+triggerClass);
            for(var j=0;j<triggerObjects.length;j++) triggerObjects[j].classList.remove(triggerClass);
          }
          _this.liveRenderTriggers = [];
          _this.liveRenderActive = false;
        }, 0);
      }

      //Utility - JS Extensions
      //-----------------------

      function extend(dst, src){
        if(src){
          for(var key in src) dst[key] = src[key];
        }
        return dst;
      }
      this.extend = extend;

      this.eachParallel = function(arr, f, callback){
        var f_complete = [];
        var err_returned = false;
        for(var i=0;i<arr.length;i++) f_complete.push(false);
        for(var i=0;i<arr.length;i++){
          (function(){
            var idx = i;
            f(arr[idx], idx, function(err){
              if(err_returned) return;
              if(err){
                err_returned = true;
                return callback(err);
              }
              else{
                f_complete[idx] = true;
                var allComplete = true;
                for(var j=0;j<f_complete.length;j++){ if(!f_complete[j]) allComplete = false; }
                if(allComplete) return callback();
              }
            });
          })();
        }
      }

      this.pad = function(val, padding, length) {
        var rslt = val.toString();
        while (rslt.length < length) rslt = padding + rslt;
        return rslt;
      }

      //Utility - Network
      //-----------------

      this.loadScript = function(url, cb){
        var script = document.createElement('script');
        if(cb) script.onload = cb;
        script.src = url;
        if(script.classList) script.classList.add('removeOnPublish');
        document.head.appendChild(script);
      }

      this.parseGET = function (qs) {
        if (typeof qs == 'undefined') qs = window.location.search;
        if (qs == "" || qs.length == 1) return {};
        if (qs[0] == '?' || qs[0] == '#') qs = qs.substr(1);
        var qsa = qs.split('&');
        var b = {};
        for (var i = 0; i < qsa.length; i++) {
          var p = qsa[i].split('=', 2);
          if (p.length == 1)
            b[p[0]] = "";
          else
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
        return b;
      };

      //Utility - DOM
      //-------------

      this.fade = function(id, obj, direction, duration, delay, step){
        if(id in _this.timers) window.clearTimeout(_this.timers[id]);
        if(delay){ _this.timers[id] = setTimeout(function(){ _this.fade(id, obj, direction, duration, 0, step) }, delay); return; }
        var FRAMES = (duration / 100);
        if(typeof step == 'undefined') step = Math.round(((direction==1) ? obj.style.opacity : (1-obj.style.opacity)) * FRAMES);
        obj.style.opacity = (direction==1) ? (step / FRAMES) : (1 - step / FRAMES);
        if(step >= FRAMES){
          if(direction==-1) obj.style.display = 'none';
        }
        else {
          _this.timers[id] = setTimeout(function(){ _this.fade(id, obj, direction, duration, 0, step+1); }, duration / FRAMES);
        }
      }

      this.fadeIn = function(id, obj, duration, delay, step){ _this.fade(id, obj, 1, duration, delay, step); }
      this.fadeOut = function(id, obj, duration, delay, step){ _this.fade(id, obj, -1, duration, delay, step); }

      //Utility - Loader
      //----------------

      this.startLoading = function(obj, options){
        options = _this.extend({
          fadeIn: false,
        }, options);
        var foundObj = false;
        for(var i=0;i<this.loadQueue.length;i++){ if(obj===this.loadQueue[i]) foundObj = true; }
        if(!foundObj) this.loadQueue.push(obj);

        if(this.isLoading) return;
        this.isLoading = true;

        var loader_obj = document.getElementById('jsHarmonyCmsEditorLoading');

        if(loader_obj){
          loader_obj.style.opacity = (options.fadeIn ? 0 : 1);
          loader_obj.style.display = 'block';
          if(options.fadeIn) _this.fadeIn('jsHarmonyCmsEditorLoading', loader_obj, 1000, 500);
        }
        else {
          _this.liveRender(
            function(){ if(document && document.body) return [document.body]; return []; },
            function(obj){
              loader_obj = document.createElement('div');
              loader_obj.id = 'jsHarmonyCmsEditorLoading';
              loader_obj.style.backgroundColor = 'rgba(255,255,255,1)';
              loader_obj.style.position = 'fixed';
              loader_obj.style.top = '0px';
              loader_obj.style.left = '0px';
              loader_obj.style.bottom = '0px';
              loader_obj.style.width = '100%';
              loader_obj.style.zIndex = 2147483643;
              loader_obj.style.cursor = 'wait';
              loader_obj.style.opacity = (options.fadeIn ? 0 : 1);
              document.body.appendChild(loader_obj);

              var loader_img_container = document.createElement('div');
              loader_img_container.style.position = 'absolute';
              loader_img_container.style.top = '50%';
              loader_img_container.style.left = '50%';
              loader_obj.appendChild(loader_img_container);

              var loader_img = document.createElement('img');
              loader_img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzgiIGhlaWdodD0iMzgiIHZpZXdCb3g9IjAgMCAzOCAzOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBzdHJva2U9IiNhYWEiPg0KICAgIDxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+DQogICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEgMSkiIHN0cm9rZS13aWR0aD0iMiI+DQogICAgICAgICAgICA8Y2lyY2xlIHN0cm9rZS1vcGFjaXR5PSIuNSIgY3g9IjE4IiBjeT0iMTgiIHI9IjE4Ii8+DQogICAgICAgICAgICA8cGF0aCBkPSJNMzYgMThjMC05Ljk0LTguMDYtMTgtMTgtMTgiPg0KICAgICAgICAgICAgICAgIDxhbmltYXRlVHJhbnNmb3JtDQogICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZU5hbWU9InRyYW5zZm9ybSINCiAgICAgICAgICAgICAgICAgICAgdHlwZT0icm90YXRlIg0KICAgICAgICAgICAgICAgICAgICBmcm9tPSIwIDE4IDE4Ig0KICAgICAgICAgICAgICAgICAgICB0bz0iMzYwIDE4IDE4Ig0KICAgICAgICAgICAgICAgICAgICBkdXI9IjFzIg0KICAgICAgICAgICAgICAgICAgICByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIvPg0KICAgICAgICAgICAgPC9wYXRoPg0KICAgICAgICA8L2c+DQogICAgPC9nPg0KPC9zdmc+';
              loader_img.style.height = '100px';
              loader_img.style.width = '100px';
              loader_img.style.position = 'relative';
              loader_img.style.top = '-50px';
              loader_img.style.left = '-50px';
              loader_img_container.appendChild(loader_img);

              if(options.fadeIn) _this.fadeIn('jsHarmonyCmsEditorLoading', loader_obj, 1000, 500);
            },
            { addClass: false }
          );
        }
      }

      this.stopLoading = function(obj){
        for(var i=0;i<this.loadQueue.length;i++){ if(obj===this.loadQueue[i]){ this.loadQueue.splice(i, 1); i--; } }
        if(this.loadQueue.length) return;

        this.isLoading = false;
        _this.fadeOut('jsHarmonyCmsEditorLoading', document.getElementById('jsHarmonyCmsEditorLoading'), 500);
      }

      //Call Constructor
      _this.onInit();
    }
    return jsHarmonyCmsEditor;
  })();

  var sysSelf = (typeof self != 'undefined') && self || {};
  var sysGlobal = ((typeof global != 'undefined') && global) || sysSelf;
  var sysModule = (typeof module != 'undefined') && module;

  if(sysModule) sysModule.exports = exports = jsHarmonyCmsEditor;
  if(!('jsHarmonyCmsEditor' in sysGlobal)) sysGlobal.jsHarmonyCmsEditor = jsHarmonyCmsEditor;
  if(!('jsHarmonyCmsEditor' in sysSelf)) sysSelf.jsHarmonyCmsEditor = jsHarmonyCmsEditor;
  return jsHarmonyCmsEditor;

}).call(this);