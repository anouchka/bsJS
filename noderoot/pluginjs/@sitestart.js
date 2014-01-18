if( bs.$os( 'hostname' ) == 'hika' ) bs.db( 'd@mysql' ).$( 'url', 'localhost:3306', 'id', 'root', 'pw', '1234', 'db', 'hika01' );
else bs.db( 'd@mysql' ).$( 'url', '10.0.0.1:3306', 'id', 'hika01', 'pw', 'projectbs00', 'db', 'hika01' );

bs.sql( 'cat' ).$( 'db', 'd@mysql', 'query', "select cat_rowid,title from cat" );

bs.sql( 'login' ).$( 'db', 'd@mysql', 'query', "select member_rowid,email,nick,thumb from member where email='@email@' and pw='@pw@'" );
bs.sql( 'join' ).$( 'db', 'd@mysql', 'query', "insert into member(email,pw,nick,thumb)values('@email@','@pw@','@nick@','@thumb@')" );

bs.sql( 'Plist' ).$( 'db', 'd@mysql', 'query', 
	"select p.plugin_rowid,t.title type,p.title,p.uname,p.thumb,c.title cat,DATE_FORMAT(regdate,'%Y.%m.%d %H:%i')regdate from plugin p,plugintype t, cat c "+
	"where p.plugintype_rowid=t.plugintype_rowid and p.cat_rowid=c.cat_rowid and p.member_rowid=@id@ order by regdate desc limit @p@,@rpp@" );
bs.sql( 'Padd' ).$( 'db', 'd@mysql', 'query', 
	"insert into plugin(member_rowid,plugintype_rowid,uname,title,contents,cat_rowid,thumb)values("+
	"@id@,@type@,'@uname@','@title@','@description@',@cat@,'@thumb@')"
);
bs.sql( 'Pview' ).$( 'db', 'd@mysql', 'query', 
	"select p.plugin_rowid,t.title type,p.title,p.contents,p.uname,p.thumb,c.title cat,DATE_FORMAT(regdate,'%Y.%m.%d %H:%i')regdate from plugin p,plugintype t, cat c "+
	"where p.plugintype_rowid=t.plugintype_rowid and p.cat_rowid=c.cat_rowid and p.plugin_rowid=@r@" );

bs.sql( 'Vlist' ).$( 'db', 'd@mysql', 'query', "select ver_rowid,version,DATE_FORMAT(freezeDate,'%y.%m.%d %H:%i')freezedate,DATE_FORMAT(editdate,'%y.%m.%d %H:%i')editdate,code,contents from ver where plugin_rowid=@r@ order by version" );
bs.sql( 'Vadd' ).$( 'db', 'd@mysql', 'query', "insert into ver(plugin_rowid,version)values(@r@,@version@)" );
bs.sql( 'Vupdate' ).$( 'db', 'd@mysql', 'query', "update ver set code='@code@',contents='@contents@',editdate=CURRENT_TIMESTAMP()where ver_rowid=@vr@" );
bs.sql( 'Vfreezable' ).$( 'db', 'd@mysql', 'query', "select freezedate,(select max(i.version)from ver i where i.plugin_rowid=v.plugin_rowid and i.freezedate is not NULL)<version k from ver v where ver_rowid=@vr@" );
bs.sql( 'Vfreeze' ).$( 'db', 'd@mysql', 'query', "update ver set freezeDate=CURRENT_TIMESTAMP()where ver_rowid=@vr@" );
bs.sql( 'VfreezeDetail' ).$( 'db', 'd@mysql', 'query',
	"select p.uname,v.version,t.title,v.code "+
	"from ver v,plugin p,plugintype t "+
	"where v.plugin_rowid=p.plugin_rowid and p.plugintype_rowid=t.plugintype_rowid and ver_rowid=@vr@" 
);
bs.WEB.application( 
	'post', function( $isSession ){
		var t0, i, j, k, v;
		if( $isSession && !bs.WEB.session('id') ) return bs.WEB.response( JSON.stringify( {result:'fail',contents:'no session'} ) ), 0;
		if( bs.WEB.method() != 'POST' ) return bs.WEB.response( JSON.stringify( {result:'fail',contents:'invaild try'} ) ), 0;
		t0 = [], i = 1, j = arguments.length;
		while( i < j ){
			k = arguments[i++];
			if( !( v = bs.WEB.post( k ) ) ) return bs.WEB.response( JSON.stringify( {result:'fail',contents:'no data:' + k} ) ), 0;
			switch( arguments[i++] ){
			case'i':t0[k] = parseInt( v, 10 ); break;
			case'f':t0[k] = parseFloat( v );break;
			case's':t0[k] = v; break;
			default: return bs.WEB.response( JSON.stringify( {result:'fail',contents:'invalid type:'+k+','+v} ) ), 0;
			}
			t0[t0.length] = k, t0[t0.length] = t0[k];
		}
		return t0;
	},
	'db', (function(){
		var arg = [], end;
		function END( $rs, $e ){
			var t0 = $rs ? {result:'ok', contents:$rs} : {result:'fail', contents:JSON.stringify($e)}, t1;
			if( end ) t1 = end( t0, $rs, $e );
			if( !t1 ) bs.WEB.response( JSON.stringify( t0 ) ), bs.WEB.next();
		}
		return function( $query, $post, $end ){
			var t0, i, j;
			end = $end, arg.length = 0, arg[0] = END;
			for( i = 0, j = $post.length ; i < j ; i++ ) arg[arg.length] = $post[i];
			t0 = bs.sql( $query ), t0.run.apply( t0, arg );
			bs.WEB.pause();
		};
	})()
);

bs.sql( 'cat' ).run( function( $rs ){
	bs.WEB.application( 'cat', $rs );
	bs.WEB.next();
} );
bs.WEB.pause();