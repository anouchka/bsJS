bs.$register( 'method', 'jpage', (function(){
	var jp, jpage, r0, r1, r2, s, e;
	jp = function( $v ){this.v = $v},
	r0 = /["]/g, r1 = /\\/g, r2 = /\r\n|\r|\n/g, s = '<%', e = '%>',
	jpage = function( $str, $data, $render, $end ){
		var t0, t1, i, j, k, v;
		if( $str instanceof jp ) v = $str.v
		else{
			$str = ( $str.substr(0,2) == '#T' ? bs.dom( $str ).$('@text') : $str.substr($str.length-5) == '.html' ? bs.$get( null, $str ) : $str ).split( s );
			i = 0, j = $str.length, v = '';
			while( i < j ){
				t0 = $str[i++];
				if( ( k = t0.indexOf( e ) ) > -1 ) t1 = t0.substring( 0, k ), t0 = t0.substr( k + 2 ), v += t1.charAt(0) == '=' ? '$$R( ' + t1.substr(1) + ' );' : t1;
				v += '$$R( "' + t0.replace( r0, '\\"' ).replace( r1, '\\\\' ).replace( r2, '\\n' ) + '");';
			}
		}
		if( $render ) new Function( '$$R, $data', v )( $render, $data );
		if( $end ) $end( v );
		return new jp(v);
	};
	return jpage;
})(), 1.0 );