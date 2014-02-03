module.exports = function(bs){
var HTTP = require('http'), HTTPS = require('https'), URL = require('url'), fn = bs.fn, FS_ROOT, FS_ROOTS = {root:bs.root()};
(function( HTTP, URL, FS_ROOTS ){ //core
	var os = require('os'), query = require('querystring'), crypto = require('crypto'), fs = require('fs'), p = require('path'),
		http, mk;
	fn( 'os', function(k){return os[k]();} ),
	fn( 'escape', function(v){return query.escape(v);} ),
	fn( 'unescape', function(v){return query.unescape(v);} ),
	fn( 'cgiparse', function(v){return query.parse(v);} ),
	fn( 'cgistringify', function(v){return query.stringify(v);} ),
	fn( 'crypt', function( type, v ){
		var t0;
		switch(type){
		case'sha256': return t0 = crypto.createHash('sha256'), t0.update(v), t0.digest('hex');
		}
	} ),
	fn( 'path', function( path, context ){
		if( path.substr(0,5) == 'http:' || path.substr(0,5) == 'https:' ) return path;
		return p.resolve( context ? FS_ROOTS[context] || context : FS_ROOTS[FS_ROOT], path );
	} ),
	fn( 'file', function( end, path, v ){
		var t0, t1, dir, i, j, k;
		if( v ){
			dir = path.split( t0 = path.lastIndexOf('\\') == -1 ? '/' : '\\' ), t1 = dir.slice( 0, -1 );
			do t1.pop(); while( !fs.existsSync(t1.join(t0)) )
			for( i = t1.length, j = dir.length ; i < j ; i++ ){
				k = dir.slice( 0, i ).join(t0);
				if( !fs.existsSync(k) ) fs.mkdirSync(k);
			}
			if( !end ) return fs.writeFileSync( path, v );
			fs.writeFile( path, v, function(e){return end( e ? null : 1, e );} );
		}else{
			if( !fs.existsSync(path) ) return null;
			if( !end ) return fs.readFileSync(path);
			fs.readFile( path, function( e, d ){return end( d || null, e );});
		}
	} ),
	fn( 'stream', function( path, open, e ){
		var t0;
		if( !fs.existsSync(path) ){
			if( e ) e();
			return null;
		}
		t0 = fs.createReadStream(path);
		if( open ) t0.once( 'open', open );
		if( e ) t0.once( 'error', e );
		return t0;
	} ),
	fn( 'js', (function(){
		var id = 0, c = bs.__callback = {}, js = function( data, load, end ){
			var t0, i;
			if( load ){
				if( data.charAt( data.length - 1 )=='=' ) data += 'bs.__callback.' + ( i = 'c' + (id++) ), c[i] = function(){delete c[i], end.apply( null, arguments );};
				bs.get( function(v){
					var t0;
					if( v.indexOf('module.exports') > -1 || v.indexOf('exports') > -1 ) end( ( t0 = new module.constructor, t0.paths = module.paths, t0._compile(v), t0.exports ) );
					else try{new Function( 'bs', v )(bs);}catch(e){bs.err( 0, e );}
					load();
				}, data );
			}else if( data.indexOf('module.exports') > -1 || data.indexOf('exports') > -1 ) end( ( t0 = new module.constructor, t0.paths = module.paths, t0._compile(data), t0.exports ) );
			else try{new Function( 'bs', data )(bs);}catch(e){bs.err( 0, e );}
		};
		return function(end){
			var i, j, arg, load;
			arg = arguments, i = 1, j = arg.length;
			if( end ) ( load = function(){i < j ? js( bs.path(arg[i++]), load, end ) : end();} )();
			else while( i < j ) js(bs.file( null, bs.path(arg[i++]) ));
		};
	})() ),
	http = (function(){
		var op = {}, maxSize = 2 * 1024 * 1024, h = bs.param.header, head = function(){
			var t0 = {}, i = 0, j = h.length;
			while( i < j ) t0[h[i++]] = h[i++];
			return t0;
		};
		return function( type, end, url, arg ){
			var t0, t1, response;
			if( url.substr( 0, 5 ) == 'http:' || url.substr( 0, 6 ) == 'https:' ){
				if( !end ) return bs.err( 0, 'http need callback!' ), null;
				response = function(rs){
					var t0 = '';
					rs.on( 'data', function(v){
						t0 += v;
						if( t0.length > maxSize ) this.pause(), rs.writeHead(413), rs.end('Too Large'), end( null, 'Too Large' );
					} ).on( 'end', function(){
						if( !t0 ) rs.end(), end( null, 'No data' );
						else end( t0, rs );
					} );
				},
				t0 = URL.parse(url), op.hostname = t0.hostname, op.method = type, op.port = t0.port, op.path = t0.path, op.headers = head(h),
				op.headers['Content-Type'] = ( type == 'GET' ? 'text/plain' : 'application/x-www-form-urlencoded' ) + '; charset=UTF-8',
				op.headers['Content-Length'] = type == 'GET' ? 0 : Buffer.byteLength( t1 = bs.param(arg) ),
				( t0 = HTTP.request( op, response ) ).on( 'error', function(e){end( null, e );} );
				if( type != 'GET' ) t0.write(t1);
				t0.end();
			}else return bs.file( end && function(v){return v.toString();}, bs.path(url.split('?')[0]) ).toString();
		};
	})(),
	mk = function(m){return function( end, url ){return http( m, end, bs.url(url), arguments );};},
	fn( 'get', function( $end, $path ){return http( 'GET', $end, bs.$url( $path, arguments ) );} ),
	fn( 'post', mk('POST') ), fn( 'put', mk('PUT') ), fn( 'delete', mk('DELETE') ),
	fn( 'ck', (function(){
		return function( k, v, expire, path, domain ){
			var t0, t1;
			if( $v === undefined ) return bs.$unescape(clientCookie[$k]||'');
			if( $k.charAt(0) == '@' ) t0 = 1, $k = $k.substr(1);
			t0 = $k + '=' + ( bs.$escape($v) || '' ) + 
				';Path=' + ( $path || '/' ) + 
				( t0 ? ';HttpOnly' : '' ) + 
				( domain ? ';Domain=' + domain : '' );
			if( $v === null ) (t1 = new Date).setTime( t1.getTime() - 86400000 ),
				t0 += ';expires=' + t0.toUTCString() + ';Max-Age=0';
			else if( $expire ) (t1 = new Date).setTime( t1.getTime() + $expire * 86400000 ),
				t0 += ';expires=' + t1.toUTCString() + ';Max-Age=' + ( $expire * 86400 );
			cookie[$k] = t0;
		};
	})() );
})( HTTP, URL, FS_ROOTS ),
(function(){ //db
	var type, i;
	type = 'execute,recordset,stream,transation'.split(','); for( i in type ) type[type[i]] = 1;
	bs.cls( 'db', function( fn, bs ){
		fn.NEW = function( sel, type ){
			if( !bs.DB[type] ) return bs.err( 0, 'no db connector for ' + type );
			this.__db = new bs.DB[type]();
		},
		fn.S = function(){return this.__db.S( arguments );},
		fn.open = function(){return this.__db.open();},
		fn.close = function(){return this.__db.close();};
		fn.execute = function(q){return this.__db.execute(q);},
		fn.recordset = function( q, end ){this.__db.recordset( q, end );},
		fn.stream = function( q, end ){this.__db.stream( q, end );};
		fn.transation = function( q, end ){this.__db.transation( q, end );};
	} ),
	bs.cls( 'sql', function( fn, bs ){
		var key, i, r0 = /[']/g, r1 = /--/g, toDB = function(v){return typeof v == 'string' ? v.replace( r0, "''" ).replace( r1, '' ) : v;};
		key = 'db,type,query'.split(','); for( i in key ) key[key[i]] = 1;
		fn.NEW = function(){this.type = 'recordset';},
		fn.S = function(){
			var i, j, k, v, t0;
			i = 0, j = arguments.length;
			while( i < j ){
				k = arguments[i++], v = arguments[i++];
				if( k === null ) return this.END();
				if( key[k] ){
					if( v === undefined ) return this[k];
					if( k != 'type' || type[v] ) this[k] = v;
				}else return bs.err( 0, 'undefined key ' + k );
			}
		},
		fn.run = function(end){
			var t0, t1, i, j, k;
			t0 = {}, i = 1, j = arguments.length;
			while( i < j ) t0[k = arguments[i++]] = toDB(arguments[i++]);
			if( i = this.query.splice ){
				this.type = 'transaction';
				t1 = this.query.slice(0);
				while( i-- ) t1[i] = bs.tmpl( t1[i], t0 );
				t0 = t1;
			}else t0 = bs.tmpl( this.query, t0 );
			//console.log( t0 );
			return bs.db(this.db)[this.type]( t0, end );
		};
	} );
})(),
(function( HTTP, HTTPS, URL ){
	var countryCode = require('./i18n'), mime = require('./mime'), staticHeader = {'Content-Type':0}, curr,
	err = function( $code, $v ){rp.writeHead( $code, (staticHeader['Content-Type'] = 'text/html', staticHeader) ), rp.end( $v || '' );},
	ckParser = function(){
		var t0, t1, i;
		curr.clientCookie = {};
		if( t0 = rq.headers.cookie ){
			t0 = t0.split(';'), i = t0.length;
			while( i-- ) t0[i] = bs.trim( t0[i].split('=') ), curr.clientCookie[t0[i][0]] = t0[i][1];
		}
	};
	bs.obj( 'WEB', (function(){
		var flush, r0, r1;
		r0 = /[<]/g, r1 = /\n|\r\n|\r/g,
		sessionName = '__bsNode', id = 0,
		flush = {
			0:['Server', 'projectBS on node.js'],
			1:['Content-Type', 'text/html; charset=utf-8'],
			2:['Content-Length', 0]
		};
		return {
			pause:function(){curr.pause = 1;},
			pass:function(){curr.next();},
			site:function(){return curr;},
			exit:function(html){curr.pause = 1, err( 200, html );},
			flush:function(){
				var t0, k;
				if( curr.flushed ) return;
				curr.flushed = 1;
				for(k in cookie) curr.head[head.length] = ['Set-Cookie', curr.cookie[k]];
				curr.head.push( flush[0], flush[1], ( t0 = curr.response.join(''), flush[2][1] = Buffer.byteLength( t0, 'utf8' ), flush[2] ) ),
				curr.rp.writeHead( 200, curr.head ), curr.rp.end( t0 );
			},
			application:function(){
				var i, j, k, v;
				i = 0, j = arguments.length;
				while( i < j ){
					k = arguments[i++], v = arguments[i++];
					if( v === undefined ) return curr.application[k];
					else if( v === null ) delete curr.application[k];
					else curr.application[k] = v;
				}
				return v;
			},
			session:function(){
				var t0, t1, i, j, k, v;
				i = 0, j = arguments.length;
				while( i < j ){
					k = arguments[i++], v = arguments[i++];
					if( v === undefined ) return curr.currSession ? curr.currSession[k] : null;
					else if( v === null && curr.currSession ) delete curr.currSession[k];
					else{
						if( !curr.currSession ){
							t0 = curr.session;
							while( t0[t1 = bs.crypt( 'sha256', ''+bs.rand( 1000, 9999 ) + (id++) + bs.rand( 1000, 9999 ) )] );
							bs.ck( sessionName, t1 );
							curr.currSession = t0[t1] = {__t:Date.now()};
						}
						curr.currSession[k] = v;
					}
				}
				return v;
			},
			head:function( k, v ){curr.head[curr.head.length] = [k, v];},
			method:function(){return curr.method;},
			request:function(k){return curr.rq[k]},
			requestHeader:function(k){return curr.rq.headers[k];},
			response:function(){
				var i = 0, j = arguments.length;
				while( i < j ) curr.response[curr.response.length] = arguments[i++];
			},
			url:function(){return curr.url;},
			urlPath:function(){return curr.path;},
			urlFile:function(){return curr.file;},
			get:function(k){return curr.getData[k];},
			post:function(k){return curr.postData[k];},
			file:function(k){return curr.postFile[k];},
			data:function( k, v ){return v === undefined ? curr.data[k] : ( curr.data[k] = v );},
			redirect:function( url, isClient ){
				curr.pause = 1;
				if( isClient ) curr.rp.writeHead( 200, {'Content-Type':'text/html; charset=utf-8'} ), rp.end( '<script>location.href="' + url + '";</script>');
				else curr.rp.writeHead( 301, {Location:url} ), curr.rp.end();
			},
			i18n:function( group, key ){
				var t0 = curr.i18n||curr.i18nD, t1;
				if( !t0 ) return err( 200, 'no locale:' + curr.i18n + ',' + curr.i18nD );
				if( !( t1 = curr.i18nTxt[t0] ) ) return err( 200, 'undefined locale:' + t0 );
				if( !( t1 = t1[group] ) ) return err( 200, 'undefined group:' + group );
				return t1[key];
			},
			i18nAddDefault:function( locale, data ){
				if( curr.i18nD ) return bs.err( 0, 'default already exist:' + curr.i18nD );
				if( !countryCode[locale] ) return bs.err( 0, 'invaild locale:' + locale );
				curr.i18nD = locale, curr.i18nTxt[locale] = data;
			},
			i18nAdd:function( locale, data ){
				var t0, t1, d1, i, j;
				if( !countryCode[locale] ) return bs.err( 0,  'invaild locale:' + locale );
				t0 = curr.i18nTxt[curr.i18nD];
				for( i in t0 ) if( t0.hasOwnProperty(i) ){
					if( !( i in data ) ) return bs.err( 0, 'no key: data[' + i +']' );
					t1 = t0[i], d1 = data[i];
					for( j in t1 ) if( t1.hasOwnProperty(j) ){
						if( !( j in d1 )  ) return bs.err( 0, 'no key: $data[' + i +'][' + j + ']' );
					}
				}
				curr.i18nTxt[locale] = data;
			},
			db2html:function(str){return str.replace( r0, '&lt;' ).replace( r1, '<br/>' );}
		};
	})() ),
	bs.cls( 'Site', function( fn, bs ){
		var port, fs, runRule, defaultRouter, tmplEnd;
		port = function( https, sites, port ){
			var f = function( rq, rp ){
				var t0, t1, t2, i, j, k, v;
				t0 = URL.parse( 'http://' + rq.headers.host + rq.url ), t1 = t0.hostname, i = 0, j = sites.length;
				while( i < j ){
					k = sites[i++], v = sites[i++];
					if( k == t1 ) v.request( t0, rq, rp );
				}
			};
			HTTP.createServer( f ).on('error', function(e){bs.err( 0, e );}).listen(port);
			console.log( 'http:' + port + ' started' );
			if( https ){
				HTTPS.createServer( https, f ).on('error', function(e){bs.err(e);}).listen(https.port);
				console.log( 'https:' + https.port + ' started' );
			}
		},
		fs = function(path){
			if( curr.cache ) return fs[path] || ( fs[path] = bs.file( null, path ).toString() );
			return bs.file( null, path ).toString();
		},
		runRule = function( v, isPass ){
			if( isPass ) curr.pause = 0;
			switch( typeof v ){
			case'string':return new Function( 'bs', f(bs.path(v)) )(bs);
			case'function':return v();
			case'object':if( v.splice ) return v[0][v[1]]();
			}
			if( isPass && !curr.pause ) curr.pass();
		},
		defaultRouter = ['template', '@.html'],
		tmplEnd = function(v){bs.WEB.response(v), bs.WEB.next();},
		
		fn.index = 'index', fn.cache = 1, fn.sessionTime = 1000 * 60 * 20, 
		fn.template = function( url, template, data, end ){bs.jpage.cache = this.cache, end(bs.jpage( template, data, null, url ));},
		fn.pass = function(){this.pause = 0, process.nextTick(this.next);},
		fn.start = function(){
			var self = this, start, https, t0, i, j;
			this.rulesArr = [];
			for( i in this.rules ) if( this.rules.hasOwnProperty(i) ) this.rulesArr[this.rulesArr.length] = i;
			this.rulesArr.sort( function( a, b ){return a.length - b.length;} );
			FS_ROOT[self.__k] = self.root;
			if( i = this.i18n.length ) while(i--) runRule( this.i18n[i] );
			if( this.https ) https = {
				key:fs(bs.path( this.https.key, this.root )),
				cert:fs(bs.path( this.https.cert, this.root )),
				port:self.https.port || 443
			};
			start = function(){
				var i, j;
				i = 0, j = self.url.length;
				self.next = function(){
					var domain, t0;
					self.next = null, self.isStarted = 1;
					while( i < j ){
						domain = self.url[i++], t0 = self.url[i++];
						if( !port[t0] ) port( https, port[t0] = [], t0 );
						if( port[t0].indexOf( domain ) == -1 ) port[t0].push( domain, self );
					}
				},
				curr = self, runRule( self.siteStart, 1 );
			};
			if( this.db.length ){
				for( i = 0, j = this.db.length, t0 = [start] ; i < j ; i++ ) t0[t0.length] = this.db[i], t0[t0.length] = 'last';
				bs.plugin.apply( null, t0 );
			}else start();
		},
		fn.NEW = function(sel){
			var self = this, router, onData, k;
			this.form = bs.Form(sel),
			this.url = [], this.i18n = [], this.i18nTxt = {}, this.i18nD = '', this.isStarted = 0,
			this.rules = {'':defaultRouter}, this.application = {}, this.session = {}, this.db = [],
			this.head = [], this.response = [], this.mime = {};
			for( k in mime )if( mime.hasOwnProperty( k ) ) t0[k] = mime[k];
			this.request = function( url, rq, rp ){
				var t0, t1, i, j, k;
				curr = this, t0 = this.path = url.pathname.substr(1);
				//language detect
				this.i18n = 0;
				if( countryCode[t0 = rq.headers.lang] ) this.i18n = t0;
				else if( t0 = rq.headers['accept-language'] ){
					t0 = t0.split(';');
					for( i = 0, j = t0.length ; i < j ; i++ ){
						t1 = t0[i].split(','), k = t1.length;
						while( k-- ){
							if( countryCode[t1[k]] ){
								this.i18n = t1[k];
								break;
							}
						}
						if( this.i18n ) break;
					}
				}
				if( t0.indexOf( '..' ) > -1 || t0.indexOf( './' ) > -1 ) return err( 404, 'no file<br>'+ t0 );
				if( !t0 || t0.substr( t0.length - 1 ) == '/' ) this.file = this.index;
				else{
					( i = t0.lastIndexOf( '/' ) + 1 ) ? ( this.file = t0.substr(i), this.path = t0.substring(0,i) ) : ( this.file = t0, this.path = '' );
					if( ( i = this.file.lastIndexOf( '.' ) ) > -1 && this.file.charAt(0) != '@' ) return ( t0 = this.mime[this.file.substr( i + 1 )] ) ? 
						bs.stream( bs.path( this.path + this.file ),
							function(){rp.writeHead( 200, ( staticHeader['Content-Type'] = t0, staticHeader ) ), this.pipe(rp);},
                            function( $e ){err( 404, 'no file<br>' + self.path + self.file );}
						) : err( 404, 'no file<br>' + self.path + self.file );
				}
				this.rq = rq, this.rp = rp,
				this.head.length = this.response.length = flushed = 0, this.retry = 1,
				this.getData = bs.cgiparse( url.query ), ckParser(), this.data = {}, this.cookie = {};
				if( this.currSession = this.session[t0 = bs.ck(sessionName)] ){
					Date.now() - this.currSession.__t > this.sessionTime ? ( delete this.session[t0], this.currSession = null ) : ( this.currSession.__t = Date.now() );
				}
				( this.method = rq.method ) == 'GET' ? ( this.postData = this.postFile = null, process.nextTick(router) ) : this.form.parse(router);
			},
			router = function(){
				try{
					self.next = function(){
						var currRule, idx, t0, i;
						t0 = self.rulesArr, i = t0.length, 
						self.next = function(){
							var t0, t1, i, j, r0, k, l;
							if( idx < currRule.length ){
								try{
									i = currRule[idx++], j = currRule[idx++];
									if( typeof j == 'string' ) j = j.replace( '@', '@'+file ), j = j.charAt(0) == '/' ? j.substr(1) : ( this.path + j ), t0 = bs.path(j);
									self.pause = 0;
									switch(i){
									case'template':self.template( t0, fs(t0), null, tmplEnd ); break;
									case'static':bs.WEB.response( fs(t0) ); break;
									case'script':new Function( 'bs', fs(t0) )(bs); break;
									case'require':require(t0)(bs); break;
									case'function':runRule(j); break;
									default: self.pass();
									}
									if( !self.pause ) self.pass();
								}catch(e){
									if( self.retry-- ) self.head.length = self.response.length = 0, self.data = {}, self.cookie = {}, self.path = self.path + self.file + '/', self.file = self.index, router();
									else{
										r0 = /at /g,
										t0 = '<h1>Server error</h1>'+
											'<hr><b>path, file:</b><br>['+self.path+'], [' + self.file +']'+
											'<hr><b>rule: </b>'+i+'(idx:'+idx+') <b>target: </b>'+j+
											'<hr><b>error:</b><br>',
										t1 = Object.getOwnPropertyNames(e), k = t1.length;
										while( k-- ) t0 += '<b>' + t1[k] +'</b>: '+( e[t1[k]].replace ? e[t1[k]].replace( r0, '<br>at ' ) : e[t1[k]] )+'<br>';
										err( 500, t0 );
									}
								}
							}else self.next = bs.WEB.flush, runRule( self.pageEnd, 1 );
						};
						while( i-- )if( self.path.indexOf( t0[i] ) > -1 ) return currRule = self.rules[t0[i]], idx = 0, self.next();
						err( 500, '<h1>server error</h1><div>Error: no matched rules ' + self.path + self.file );
					};
					runRule( self.pageStart, 1 );
				}catch(e){
					err( 500, '<h1>server error</h1><div>Error: ' + e + '</div>router' );
				}
			}
		},
		fn.S = function(){
			var t0, i, j, k, v;
			i = 0, j = arguments.length;
			while( i < j ){
				k = arguments[i++], v = arguments[i++];
				if( k === null ){
					if( this.isStarted ) this.stop();
					this.END();
					return null;
				}else if( v !== undefined ){
					switch( k ){
					case'https':this.https = v; break;
					case'i18n':case'db': this[k][this[k].length] = v; break;
					case'url':
						v = bs.trim( v.split(':') );
						if( this.url.indexOf( v[0] ) == -1 ) this.url.push( v[0], parseInt( v[1] || '8001' ) );
						break;
					case'cache':this.cache = v; break;
					case'root':this.root = bs.path( v, 'root' ); break;
					case'sessionTime':case'template':case'index':this[k] = v; break;
					case'siteStart':case'pageStart':case'pageEnd':this[k] = typeof v == 'string' ? v + ( v.indexOf('.js') == -1 ? '.js' : '' ) : v; break;
					case'upload':this.form.S( k, v ); break;
					case'postMax':case'fileMax':this.form.S( k, v * 1024 * 1024 ); break;
					default:if( k.charAt(0) == '.' ) this.mime[k.substr(1)] = v;
					}
				}
			}
			return this[k];
		},
		fn.router = (function(){
			var key, i;
			key = 'template,static,script,require,function'.split(','), i = key.length;
			while( i--) key[key[i]] = 1;
			return function(){
				var i, j, k, v, m, n;
				i = 0, j = arguments.length;
				while( i < j ){
					k = arguments[i++], v = arguments[i++];
					if( v === null ) delete this.rules[k];
					else if( v !== undefined ){
						if( v.splice ){
							for( m = 0, n = v.length ; m < n ; m += 2 ) if( !key[v[m]] ) return bs.err( 0, 'invalid router type:' + v[m] );
							this.rules[k] = v;
						}else bs.err( 0, 'invalid router:'+v );
					}
				}
				return v;
			};
		})(),
		fn.stop = function(){
			var domain, port, i, j;
			i = 0, j = this.url.length;
			while( i < j ){
				domain = this.url[i++], port = this.url[i++];
				if( port[port] && ( k = port[port].indexOf(domain) ) > -1 ) port[port].splice( k, 2 );
			}
		};
	} ),
	bs.cls( 'Form', function( fn, bs ){
		var key, i, parser, Upfile;
		key = 'encoding,keepExtensions,postMax,fileMax,upload'.split(',');
		for( i in key ) key[key[i]] = 1;
		Upfile = function( name, file ){
			this.name = name,
			this.file = file;
		},
		Upfile.prototype.save = function(path){
			bs.file( null, path, this.file );
		},
		parser = function bodyParser( rq, buf ){
			var i, j, k, t0, bboundary, blen, bline, bbuf, mkey, mfi, mfn, rawSt, rawEd, ret;
			ret = {data:{}, file:{}},
			t0 = rq.headers['content-type'],
			bboundary = new Buffer( '--' + t0.substr( t0.lastIndexOf( '=' ) + 1) ),
			i = 0, j = buf.length;
			while( i < j ){
				if( buf[i] == bboundary[0] && buf[i+1] == bboundary[1] ){
					blen = i+bboundary.length,
					t0 = buf.slice(i, blen);
					if( t0.toString() == bboundary.toString() ){
						rawEd = i - 2;
						if( rawSt ){
							if( mfn )
								bbuf = new Buffer(rawEd - rawSt),
								buf.copy( bbuf, 0, rawSt, rawEd ),
								ret.file[mkey] = new Upfile( mfn, bbuf );
							else ret.data[mkey] = bs.$unescape( $buf.slice( rawSt, rawEd ).toString() );
							rawSt = 0, mkey = null, mfn = null;
						}
						bline = 0, k = i;
						while( k < j ){
							if( buf[k] === 13 && buf[k+1] === 10 ){
								bline++;
								if( bline == 2 ){
									t0 = buf.slice(i, k).toString();
									if( t0.indexOf('filename') > -1 )
										mfi = t0.split( ';' ),
										mkey = mfi[1].substring( mfi[1].indexOf( '"' )+1, mfi[1].lastIndexOf( '"' ) ),
										mfn = mfi[2].substring( mfi[2].indexOf( '"' )+1, mfi[2].lastIndexOf( '"' ) );
									else if( t0.indexOf('name') > -1 )
										mkey = t0.substring( t0.indexOf( '"' )+1, t0.lastIndexOf( '"' ) );
								}else if( bline == 3 ){
									t0 = buf.slice(i, k).toString();
									if( t0 ) rawSt = k + 4;
									else if( mkey ) rawSt = k + 2;
									break;
								}
								i = k + 2;
							}
							k++;
						}
						i++;
					}else i++;
				}else i++;
			}
			return ret;
		},
		fn.encoding = 'utf-8', fn.keepExtensions = 1, fn.fileMax = 2 * 1024 * 1024, fn.postMax = 5 * 1024 * 1024,
		fn.S = function(){
			var i, j, k, v;
			i = 0, j = arguments.length;
			while( i < j ){
				k = arguments[i++], v = arguments[i++];
				if( key[k] ){
					if( v === undefined ) return this[k];
					else if( v === null ) delete this[k];
					else this[k] = v;
				}
			}
		},
		fn.parse = function(end){
			var t0 = new Buffer(''), self = this;
			rq.on( 'data', function(v){
				t0 = Buffer.concat([t0, v]);
				if( t0.length > self.postMax ) t0 = null, this.pause(), err( 413, 'too large post' );
			} ).on( 'end', function(){
				var type;
				if( t0 === null ) return rp.end();
				type = rq.headers['content-type'];
				if( type.indexOf('x-www-form-urlencoded') > -1 ){
					curr.postData = bs.cgiparse( t0.toString() );
					curr.postFile = null, end();
				}else if( type.indexOf('multipart') > -1 ){
					t0 = parser( rq, t0 ),
					curr.postData = t0.data, curr.postFile = t0.file,
					end();
				}
			} );
		};
	} );
})( HTTP, HTTPS, URL );
fn( 'jpage', (function(){
	var jp = function(v){this.v = v;}, cache={}, b = '<%', e = '%>', err = [], line = [],
	r0=/\\/g, r1=/["]|\n|\r\n|\r/g, r2=/at /g, r3=/["]|[<]|\t|[ ][ ]|\n|\r\n|\r/g, r4 = /\n|\r\n|\r/g, r5=/[<]|\t|[ ][ ]/g,
	toCode = function(_0){switch(_0){case'"':return'\\"'; case'\n':case'\r\n':case'\r':return'\\n'; default:return _0;}},
	toHtml = function(_0){switch(_0){case'"':return'\\"'; case'<':return'&lt;';case'\t':return'&nbsp; &nbsp; ';
		case'  ':return'&nbsp; '; case'\n':case'\r\n':case'\r':return'<br>'; default:return _0;}},
	jpage = function( s, data, renderer, id ){
		var str, t0, t1, i, j, k, v, m, importer, render;
		if( !( jpage.cache && ( v = cache[id] ) ) ){
			if( s instanceof jp ) v = s.v;
			else{
				str = ( s.substr( 0, 2 ) == '#T' ? ( s = bs.Dom(s).S('@text') ) : s.substr( s.length - 5 ) == '.html' ? bs.get( null, s ) : s ).split(b);
				v = 'try{', i = 0, j = str.length;
				while( i < j ){
					t0 = str[i++];
					if( ( k = t0.indexOf(e) ) > -1 ) t1 = t0.substring( 0, k ), t0 = t0.substr( k + 2 ), 
						v += '$$E[$$E.length]="<%' + t1.replace( r0, '\\\\' ).replace( r3, toHtml ) + '%>";' +
							( t1.charAt(0) == '=' ? 'ECHO(' + t1.substr(1) + ')' : t1 ) + 
							';$$L[0]+=' + t1.split(r2).length + ';';
					v += 'ECHO($$E[$$E.length]="' + t0.replace( r0, '\\\\' ).replace( r1, toCode ) + '"),$$L[0]+=' + t0.split(r4).length + ';';
				}
				v += '}catch(e){return e;}';
			}
			t0 = s.v ? s : new jp(v);
			if( jpage.cache && id ) cache[id] = v;
		}
		t1 = '', importer = function(url){render(jpage( url, data, null, jpage.cache ? url : 0 ));},
		render = renderer ? function(v){t1 += v, renderer(v);} : function(v){t1 += v;};
		try{
			line[0] = err.length = 0, i = new Function( 'ECHO,IMPORT,$$E,$$L,$,bs', v )( render, importer, err, line, data, bs );
			if( !( i instanceof Error ) ) i = 0;
		}catch(e){i = e;}
		if( i ){
			str = '<h1>Invalid template error: bs.jpage</h1><hr>';
			if( m = err.length ) str += '<b>code: </b>error occured line number - '+line[0]+'<br>'+err[err.length-1]+'<hr>';
			j = Object.getOwnPropertyNames(i), k = j.length;
			while( k-- ) str += '<b>' + j[k] +'</b>: '+( i[j[k]].replace ? i[j[k]].replace( r2, '<br>at ' ) : i[j[k]] )+'<br>';
			str += '<hr><b>template:</b><br>';
			k = s.replace ? s.split(r4) : s.v.split(r4);
			for( i = 0, j = k.length ; i < j ; i++ ) str += '<div'+( m && ( i + 1 == line[0] )?' style="background:#faa"' : '' ) + '><b>' + ( i + 1 ) + ':</b> ' + k[i].replace( r5, toHtml ) + '</div>';
			return str;
		}
		return t1;
	};
	jpage.cache = 1;
	return jpage;
})() );

};