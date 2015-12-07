(function () {
	// webkit prefix helper
    var prefix = 'WebkitAppearance' in document.documentElement.style ? '-webkit-' : ''

	var overlay = document.createElement('div'),
		wrapper = document.createElement('div'),
		target,
		parent,
		placeholder;
		overlay.setAttribute("id", "overlay");
		wrapper.setAttribute("id", "wrapper");

	var shown = false,
		lock = false,
		originalStyles;

	var options = {
		showTime: '.5s',
		transitionTimingFunction: 'cubic-bezier(.4,0,0,1)',
		bgColor: '#fff',
		bgOpacity: .5,
		scale: '3'
	}
	

	//检索浏览器中的动画属性.start
	function sniffTransition () {
        var ret   = {},
            trans = ['webkitTransition', 'transition', 'mozTransition'],
            tform = ['webkitTransform', 'transform', 'mozTransform'],
            end   = {
                'transition'       : 'transitionend',
                'mozTransition'    : 'transitionend',
                'webkitTransition' : 'webkitTransitionEnd'
            }
        trans.some(function (prop) {
            if (overlay.style[prop] !== undefined) {
                ret.transition = prop
                ret.transEnd = end[prop]
                return true
            }
        })
        tform.some(function (prop) {
            if (overlay.style[prop] !== undefined) {
                ret.transform = prop
                return true
            }
        })
        return ret
    }
    var trans = sniffTransition(),
        transitionProp = trans.transition,
        transformProp = trans.transform,
        transformCssProp = transformProp.replace(/(.*)Transform/, '-$1-transform'),
        transEndEvent = trans.transEnd
	//检索浏览器中的动画属性.end

    function setStyle (elem, styles, rem) {
		var s = elem.style,
			origin = {};
		for (var key in styles) {
			if (rem) {
				origin[key] = s[key] || '';
			}
			s[key] = styles[key];
		}
		return origin;
	}
	setStyle(overlay, {
	        position: 'fixed',
	        display: 'none',
	        zIndex: 99998,
	        top: 0,
	        left: 0,
	        right: 0,
	        bottom: 0,
	        opacity: 0,
	        backgroundColor: options.bgColor,
	        cursor: prefix + 'zoom-out',
	        transition: 'opacity ' +
	            options.showTime + ' ' +
	            options.transitionTimingFunction
	    })

	function getElementLeft(element){
　　　　var actualLeft = element.offsetLeft;
　　　　var current = element.offsetParent;

　　　　while (current !== null){
　　　　　　actualLeft += current.offsetLeft;
　　　　　　current = current.offsetParent;
　　　　}

　　　　return actualLeft;
　　}

	function getElementTop(element){
	　　　　var actualTop = element.offsetTop;
	　　　　var current = element.offsetParent;

	　　　　while (current !== null){
	　　　　　　actualTop += current.offsetTop;
	　　　　　　current = current.offsetParent;
	　　　　}

	　　　　return actualTop;
	　　}

	function copy(el) {
    	var ph;
    	ph = el.cloneNode(true);
    	ph.setAttribute("id","placeholder");
    	ph.style.position = 'absolute';
    	ph.style.top = getElementTop(el) + 'px';
    	ph.style.left = getElementLeft(el) + 'px';
    	return ph;
    }

	var api = {

		config: function (opts) {
			if (!opts) return options
			for(var key in opts) {
				options[key] = opts[key];
			
				setStyle(overlay, {
					backgroundColor: options.bgColor
				})
			}
		},

		zoomIn: function (elem) {
			if(shown || lock) return
			target = typeof elem === 'string'
				? document.querySelector(elem)
				: elem;

			shown = true
            lock = true

			placeholder = copy(target);
			document.body.appendChild(placeholder);
			var target_left = getElementLeft(target),
				target_top = getElementTop(target);
			var	dx = document.body.clientWidth/2 - target_left,
				dy = document.body.clientHeight/2 - target_top;
				

			setStyle(target,{
				position: 'relative',
				transition: 'transform '+ options.showTime +' linear',
				transform: 'translate(' + dx + 'px, ' + dy + 'px) scale('+options.scale+')',
				zIndex: '99999',
				cursor: prefix + 'zoom-out'
			})
			target.setAttribute("id","zoomed");
			setStyle(overlay, {
				display: 'block',
				opacity: '.5'
			})
		    document.body.appendChild(overlay);
		    target.addEventListener(transEndEvent, function onEnd () {
                target.removeEventListener(transEndEvent, onEnd)
                lock = false;
            })
		},
		zoomOut: function () {
			if (!shown || lock) return
            lock = true
			var _placeholder = document.getElementById('placeholder');
			var _overlay = document.getElementById('overlay');
			var _zoomed = document.getElementById('zoomed');
			setStyle(_zoomed,{
				transform: 'scale(1)'
			})
			//监听动画结束.start
			_zoomed.addEventListener(transEndEvent, function onEnd () {
				_zoomed.removeEventListener(transEndEvent, onEnd);
				_zoomed.removeAttribute('id');
				setStyle(_zoomed,{
				position: '',
				transition: '',
				transform: '',
				zIndex: '',
				cursor: prefix + 'zoom-in'
				})
				document.body.removeChild(_overlay);
				document.body.removeChild(_placeholder);
				shown = false;
                lock = false;
			});
			//监听动画结束.end
			},
		listen: function listen(elem) {
			if (typeof elem === 'string') {
				var elems = document.querySelectorAll(elem),
					i = elems.length;
				while (i--) {
					listen(elems[i]);
				}
				return
			}

			setStyle(elem, {
				cursor: prefix + 'zoom-in'
			}, false);

			elem.addEventListener('click', function (e) {
				e.stopPropagation();
				if(shown) {
					api.zoomOut();
				}
				else {
					api.zoomIn(elem);
				}
				
			})
		}
	};
	overlay.addEventListener('click', api.zoomOut)
    wrapper.addEventListener('click', api.zoomOut)
	this.domzoom = api;
})();