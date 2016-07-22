define("discovery/models",["underscore","backbone","moment","core/analytics/identity","core/time","core/utils/url/serialize"],function(a,b,c,d,e,f){"use strict";var g=function(a){var b=a.prototype;return a.extend({defaults:{redirectUrl:null,signedUrl:null,userId:null,sourceThreadId:null,forumId:null,forum:null,majorVersion:null,requestBin:null},redirectPayload:function(){var a={url:this.get("signedUrl"),imp:d.impression.impId,prev_imp:d.impression.prevImp,forum_id:this.get("forumId"),forum:this.get("forum"),thread_id:this.get("sourceThreadId")};return this.has("requestBin")&&(a.bin=this.get("requestBin")),this.has("userId")&&(a.user_id=this.get("userId")),a},redirectUrl:function(){var a=this.get("redirectUrl"),b=this.redirectPayload();return f(a,b)},toJSON:function(){var a=b.toJSON.call(this);return a.redirectUrl=this.redirectUrl(),a},toString:function(){return this.get("title")+" "+this.get("link")+" (id = "+this.id+")"}})}(b.Model),h=function(b){var d=b.prototype;return b.extend({defaults:a.defaults({createdAgo:!1},d.defaults),initialize:function(a,b){if(b&&b.humanFriendlyTimestamp){var d=e.assureTzOffset(this.get("createdAt"));d=c(d,e.ISO_8601),this.set("createdAgo",d.fromNow())}},redirectPayload:function(){var b=d.redirectPayload.call(this);return a.extend(b,{thread:this.id,zone:"thread",area:this.state?this.state.get("placement"):"",object_type:"thread",object_id:this.id}),b},toJSON:function(){var a=d.toJSON.call(this);return a.thumbnailUrl=a.thumbnail,a.preview&&(a.preview=a.preview.toJSON()),a},toString:function(){return"organic link: "+d.toString.call(this)}})}(g),i={RelatedThread:h};return DISQUS.testing&&(i.BaseContentModel=g),i}),define("discovery/collections",["backbone","underscore","when","loglevel","core/api","core/utils/html","discovery/models"],function(a,b,c,d,e,f,g){"use strict";var h=a.Collection.extend({url:function(a){return e.getURL(a)}}),i=function(a){var b=a.prototype;return a.extend({url:function(){return b.url.call(this,"discovery/listTopPost.json")},parse:function(a){for(var c=b.parse.call(this,a),d=0,e=c.length;e>d;d++)c[d].plaintext=f.stripTags(c[d].message);return c}})}(h),j=h.extend({initialize:function(a,b){this.model=g[this.modelName],this.name=b.name,this.minLength=b.minLength,this.maxLength=b.maxLength},addClickMetadata:function(a){this.invoke("set",a)}}),k=j.extend({modelName:"RelatedThread",initialize:function(a,b){j.prototype.initialize.call(this,a,b),this.previews=new i},url:function(){return j.prototype.url.call(this,"discovery/listRelated.json")},fetch:function(a,b){a.data.limit=2*this.maxLength;var e=c(j.prototype.fetch.call(this,a)),f=this;return b&&(e=e.then(function(){return f.getContentPreviews().otherwise(function(a){d.info("There was a problem getting snippets: ",a)})})),e},getContentPreviews:function(){var a=this.map(function(a){return parseInt(a.get("id"),10)});if(a.length<this.minLength)return c.resolve();a.sort(function(a,b){return a-b});var d=c(this.previews.fetch({data:{thread:a},timeout:k.CONTENT_PREVIEWS_FETCH_TIMEOUT}));return d.then(b.bind(this.attachPreviews,this))},attachPreviews:function(){this.previews.each(function(a){var b=a.get("thread"),c=this.get(b);c&&c.set("preview",a)},this)}},{CONTENT_PREVIEWS_FETCH_TIMEOUT:5e3}),l={PostCollection:i,RelatedThreadCollection:k};return window.DISQUS.testing&&(l.BaseCollection=h,l.BaseContentCollection=j),l}),define("discovery/helpers",["underscore","jquery","loglevel","raven"],function(a,b,c,d){"use strict";var e=function(d,e){function f(){return j.scrollHeight-j.offsetHeight>.2*k}function g(){i.lastChild&&!a.contains(["...","…"],i.lastChild.nodeValue)&&(l=i.appendChild(window.document.createTextNode(" "+o)),f()&&(i.removeChild(l),i.removeChild(i.lastChild),g()))}if(!d.closest("body").length)return void c.info("lineTruncate called on el not on DOM");if(d.text().length<1)return void c.info("lineTruncated called on empty el");var h=function(a){return 3!==a.nodeType};if(a.any(d.children(),h))return void c.info("lineTruncate called on non-flat el");var i=d[0],j=i;if("block"!==d.css("display"))for(;j.parentNode&&(j=j.parentNode,"block"!==b(j).css("display")););var k=parseFloat(d.css("font-size"),10);if(f()){e=e||{};var l,m,n=e.lines||1,o=e.ellipsis,p=d.text();if(p.length){var q=d.width()/k,r=parseInt(q*n,10),s=p.split(/\s/),t=0;d.empty();var u=s.length;for(m=0;u>m&&(t+=s[m].length+1,!(t>=r));m++)i.appendChild(window.document.createTextNode(" "+s[m]));if(f())for(;i.lastChild&&f();)l=i.removeChild(i.lastChild);else{do l=i.appendChild(window.document.createTextNode(" "+s[m])),m+=1;while(!f()&&u>m);i.removeChild(l)}o&&(a.isString(o)||(o="…"),g())}}},f=function(b){function c(a,b){return a+b}var d,e,f,g,h,i=a.keys(b),j=Math.floor(a.reduce(b,c,0)/2),k=i.length+1,l=j+1,m=new Array(k);for(d=0;k>d;d++)m[d]=new Array(l),m[d][0]={};for(e=1;l>e;e++)m[0][e]=!1;var n={};for(e=1;l>e;e++)for(d=1;k>d;d++)f=i[d-1],g=b[f],h=a.clone(m[d-1][e]),!h&&e>=g&&(h=a.clone(m[d-1][e-g]),h&&(h[f]=g,n=h)),m[d][e]=h;return[n,a.omit(b,a.keys(n))]},g=["product","zone","service","experiment","variant"],h=function(b){b=b||"";var c=a.object(g,b.split(":"));return{bin:b,experiment:c.experiment||"",variant:c.variant||""}},i=function(b){b&&(c.debug(b),b.disqusCode||(b instanceof Error?d.captureException(b):b.readyState&&d.captureException(new Error(b.status+" "+b.statusText),{extra:a.compact(a.defaults({requestPath:b.getResponseHeader("url")},b.responseJSON))})))};return{lineTruncate:e,balancedPartition:f,binToEventParams:h,reportError:i}}),define("discovery/exceptions",[],function(){"use strict";var a=function(a,b){var c=function(){var c=Error.apply(this,arguments);return c.name=this.name=a,this.disqusCode=b||"uncaught",this.message=c.message,this.stack=c.stack,this},d=function(){};return d.prototype=Error.prototype,c.prototype=new d,c};return{NoAds:a("NoAds","no_ads"),NoBinError:a("NoBinError","no_bin"),AdsExhaustedError:a("AdsExhaustedError","ads_exhausted"),RenderError:a("RenderError","render_error"),FetchError:a("FetchError","fetch_error"),TimeoutError:a("TimeoutError","timeout"),ValidationError:a("ValidationError","validation_error"),AdBlockError:a("AdBlockError","ad_block")}}),define("discovery/views/links/TwoColumn",["jquery","underscore","discovery/helpers"],function(a,b,c){"use strict";var d=function(b,c){this.modelIds=b||[],this.$elements=a(c||[])};b.extend(d.prototype,{height:function(){var c=this;c.heights=[];var d=a(c.$elements),e=d.first().offset().top,f=function(){var a=d.last();return a.offset().top+a.height()}(),g=f-e,h=0;return b.each(d,function(b){var d=a(b).height();c.heights.push(d),h+=d}),this.interstice=(g-h)/(d.length-1),g}});var e=function(){this.divideIntoColumns=function(){var a=this,b=a.subviews[0];a.left=new d,a.right=new d;var c=0;b.collection.each(function(d,e){var f=c%2===0?"left":"right";c+=1,a[f].modelIds.push(d.id),Array.prototype.push.call(a[f].$elements,b.$elements[e])})},this.removeOneFromColumn=function(a,c){var d,e=b.chain(a.modelIds).map(function(b,c){return[b,a.heights[c]]}).sortBy(function(a){return-1*a[1]}).find(function(a){return a[1]<=c}).value()[0],f=this.subviews[0].collection,g=f.models,h=f.get(e),i=g.indexOf(h),j=[],k=[],l=[k,j],m=g.length;for(d=0;m>d;d++)l[d%2].push(g[d]);var n=l[i%2];n.splice(b.indexOf(n,h),1),g=[];var o=(i+1)%2;for(d=0;m-1>d;d++)g.push(l[(d+o)%2].shift());f.reset(g)},this.balanceColumns=function(){var a=this.subviews[0],d=a.collection,e={};d.each(function(b,c){e[c]=a.$elements.eq(c).height()});var f=c.balancedPartition(e);f=b.sortBy(f,"length");var g=f[1],h=f[0],i=d.models,j=new Array(i.length);b.each(g,function(a,b){j[2*b]=i[b]}),b.each(h,function(a,b){j[2*b+1]=i[b]}),d.reset(i)},this.shortenColumn=function(a,b){var c=this.subviews[0].collection;c.length%2!==0&&a===this.left?this.removeOneFromColumn(a,this.fudge*b):this.balanceColumns()}},f=function(){this.divideIntoColumns=function(){var a=this,b=a.subviews,c=b[0],e=b[1],f=c.collection.model.prototype.idAttribute;a.left=new d(c.collection.pluck(f),c.$elements);var g=e.collection.model.prototype.idAttribute;a.right=new d(e.collection.pluck(g),e.$elements)},this.shortenColumn=function(a,c){for(var d=a===this.left?this.subviews[0]:this.subviews[1],e=a===this.left?this.right:this.left,f=c/e.$elements.length,g=d.collection,h=b.chain(a.modelIds).map(function(b,c){return[b,a.heights[c]]}).sortBy(function(a){return a[1]}).value(),i=[],j=0,k=c,l=f;h.length;){var m=h.pop(),n=m[0],o=m[1],p=o+a.interstice;if(j+p>c&&(e=a),k=Math.abs(c-(j+p)),l=k/e.$elements.length,!(l>=f)){f=l;var q=a.modelIds.indexOf(n);a.modelIds.splice(q,1),Array.prototype.splice.call(a.$elements,q,1),j+=p,i.push(n)}}g.remove(i)}},g=function(a){this.fudge=a.fudge,this.subviews=a.views.slice(0,2),1===this.subviews.length?e.call(this):f.call(this)};return b.extend(g.prototype,{ascendingByHeight:function(){var a=this.left,c=this.right,d=[[a,a.height()],[c,c.height()]];return b.sortBy(d,function(a){return a[1]})},evenColumns:function(a){var c=this.ascendingByHeight(),d=c[0][0],e=c[0][1],f=c[1][0],g=c[1][1];if(e!==g){var h=g-e,i=this.fudge*h,j=b.find(f.heights,function(a){return a+f.interstice<i});return!a&&j?(this.shortenColumn(f,h),this.divideIntoColumns(),this.evenColumns("do not recurse again")):void this.increaseMargins(d,h)}},increaseMargins:function(c,d){var e=c.$elements.length;if(!(2>e)){var f=d/e;b.each(c.$elements,function(b){var c=a(b),d=parseInt(c.css("margin-bottom"),10),e=d+f;c.css("margin-bottom",e+"px")})}},render:function(){return this.divideIntoColumns(),this.evenColumns(),this}}),g}),define("discovery/views/links/BaseView",["backbone","when","common/templates"],function(a,b,c){"use strict";return a.View.extend({initialize:function(){this._isReady=b.defer()},isReady:function(){return this._isReady.promise},getTemplateContext:function(){return this.appContext||(this.appContext=this.model.app.toJSON()),{variant:this.appContext}},template:function(a,b){return b=b||this.templateName,c.render(b,a)},_rejectReadyPromise:function(a){this._isReady.reject(a)},handleReady:function(){this._isReady.resolve()}})}),define("discovery/views/links/BaseCollectionView",["underscore","jquery","discovery/helpers","discovery/views/links/BaseView"],function(a,b,c,d){"use strict";var e=d.extend({events:{"click [data-redirect]":"handleClick"},templateName:"discoveryCollection",handleClick:function(a){this.swapHref(a.currentTarget)},swapHref:function(b){b.setAttribute("data-href",b.getAttribute("href")),b.setAttribute("href",b.getAttribute("data-redirect")),a.delay(function(){b.setAttribute("href",b.getAttribute("data-href"))},100)},initialize:function(a){this.elementsSelector="li.discovery-post",this.$elements=this.$el.find(this.elementsSelector),this.initContext=a.context;var b=this.collection;this.listenTo(b,{remove:this.remove,reset:this.render})},truncate:function(){var d=this.$el.find(".line-truncate");a.each(d,function(a){var d=b(a);c.lineTruncate(d,{lines:parseInt(d.attr("data-line-truncate"),10),ellipsis:!0})})},getTemplateContext:function(){var b=d.prototype.getTemplateContext.call(this);a.extend(b,this.initContext),b.collection=this.collection.toJSON();var c=this.collection.at(0);if(c){var e=c.has("id")?"organic-":"promoted-",f=c.idAttribute;a.each(b.collection,function(a){a.advertisement_id=a[f],a.domIdSuffix=a[f],a.domIdSuffix=e+a.domIdSuffix})}return b},render:function(){var a=this.getTemplateContext();return this.$el.html(this.template(a)),this.$elements=this.$el.find(this.elementsSelector),this.truncate(),this},remove:function(c,e,f){if(0===arguments.length)return d.prototype.remove.call(this);var g=a.toArray(this.$elements),h=g.splice(f.index,1)[0];return b(h).remove(),this.$elements=b(g),this}});return e}),define("discovery/views/links/MainView",["jquery","underscore","discovery/views/links/TwoColumn","discovery/views/links/BaseView","discovery/views/links/BaseCollectionView"],function(a,b,c,d,e){"use strict";var f=440,g=d.extend({templateName:"discoveryMain",topEdgeOffset:0,bottomEdgeOffset:1/0,initialize:function(){d.prototype.initialize.apply(this,arguments),this.$el.css({display:"block",width:"100%"})},createSections:function(){var a=this.model,c=a.get("sectionNames"),d=a.get("sectionIds");return b.map(a.collections,function(a,b){return{id:d[b],className:c[b],collection:a}})},getTemplateContext:function(){var a=this.model.app,b=this.createSections();return{id:a.get("innerContainerId"),sections:b,forum:a.get("sourceForum")}},render:function(){var c=this;c.model.validateData(),c.renderViews(),c.resizeHandler=b.debounce(function(){c.views&&b.invoke(c.views,"render")},100),a(window).on("resize",c.resizeHandler),c.handleReady()},renderViews:function(){var c=this.getTemplateContext(),d=this;this.$el.html(this.template(c));var f=!d.isTwoColumnLayout(),g=1===d.model.collections.length;(f||g)&&d.model.trimOrganic();var h=b.map(c.sections,function(b){return new e({model:d.model,collection:b.collection,el:a("#"+b.id+"> [data-role=discovery-posts]"),context:{}})}),i=this.$el.width();this.$el.width(i-20),b.invoke(h,"render"),this.$el.width("100%"),this.views=h,this.evenColumns()},remove:function(){d.prototype.remove.call(this),this.resizeHandler&&a(window).off("resize",this.resizeHandler)},getWidth:function(){return this.$el.width()},isTwoColumnLayout:function(){return this.getWidth()>=f},evenColumns:function(){if(this.isTwoColumnLayout()){var a=new c({views:this.views,fudge:1.2});a.render()}}});return g}),define("discovery/views/Placement",["underscore","backbone","when","discovery/exceptions","discovery/views/links/MainView"],function(a,b,c,d,e){"use strict";var f=b.View.extend({className:"post-list",LAYOUT_TO_CLASS:{links:e},initialize:function(a){a=a||{},this.placement=a.placement,this.sourceThreadUrl=a.sourceThreadUrl,this.redirectUrl=a.redirectUrl,this._enabled=!0,this._collapse()},setRequestBin:function(a){this._bin=a},tryAd:function(b){this._unsetAd();var e=b.get("layout"),f=this.LAYOUT_TO_CLASS[e];return f?(b.state.set("placement",this.placement),this._adView=new f({model:b,sourceThreadUrl:this.sourceThreadUrl,redirectUrl:this.redirectUrl}),this.$el.html(this._adView.el),this._adView.render(),this._adView.isReady().then(a.bind(this._expand,this)),this._adView.isReady()):c.reject(new d.ValidationError('Specified ad layout "'+e+'" was not found.'))},getCurrentUnit:function(){return this._adView},disable:function(){this._enabled=!1,this._collapse()},enable:function(){this._enabled=!0,this._expand()},remove:function(){return this._unsetAd(),b.View.prototype.remove.apply(this,arguments)},_unsetAd:function(){this._adView&&(this._adView.model.state.unset("placement"),this._adView.remove(),this._adView=null)},_expand:function(){this._enabled&&this.$el.css({height:"auto",visibility:"visible"})},_collapse:function(){this.$el.css({height:0,visibility:"hidden"})}});return f}),define("discovery/models/State",["backbone"],function(a){"use strict";var b={UNTOUCHED:1,PROCESSING:2,DONE:4};return a.Model.extend({defaults:{status:b.UNTOUCHED,placement:null,error:null},isResolved:function(){return this.isDone()&&!this.get("error")},isRejected:function(){return this.isDone()&&this.get("error")},isDone:function(){return this.get("status")===b.DONE}},{STATUS:b})}),define("discovery/models/SponsoredLinkAd",["underscore","backbone","core/analytics/jester","discovery/helpers","discovery/exceptions","discovery/models/State"],function(a,b,c,d,e,f){"use strict";return b.Model.extend({idAttribute:"layout",initialize:function(b,c){var d=this;d.threads=c.threads,d.collections=[],d.app=c.app,a.bindAll(d,"validateCollectionMin","prepareData"),d.set("sectionNames",["col-organic"]),d.set("sectionIds",a.map(d.get("sectionNames"),function(a){return a+"-"+d.cid})),d.collections.push(this.threads),this.state=new f,d.threads&&d.threads.each(function(a){a.state=d.state})},hasData:function(){return a.some(this.collections,function(a){return a.length})},validateCollectionMin:function(){for(var b,c,d=this.collections,e=this.get("sectionNames").slice(0),f=this.get("sectionIds").slice(0),g=d.length;g>0;)g-=1,b=d[g],c=b.minLength,b.length<c&&(d.splice(g,1),e.splice(g,1),f.splice(g,1),g=d.length);if(a.isNumber(this.app.get("numColumns"))&&a.isNumber(this.app.get("minPerColumn"))){var h=this.app.get("numColumns")*this.app.get("minPerColumn"),i=a.reduce(d,function(a,b){return a+b.length},0);h>i&&(d.splice(0,d.length),e.splice(0,e.length),f.splice(0,f.length))}this.set("sectionNames",e),this.set("sectionIds",f)},prepareData:function(){var a=this.commonClickMetadata();this.threads.addClickMetadata(a)},trimOrganic:function(){var a=this.threads;a.length>a.maxLength&&a.reset(a.slice(0,a.maxLength))},validateData:function(){var a=this;if(a.threads.maxLength=a.app.getCollectionMax("Organic"),this.validateCollectionMin(),this.prepareData(),!a.hasData())throw new e.ValidationError("Not enough data")},commonClickMetadata:function(){var a=this.app,b=a.get("sourceForum"),c={redirectUrl:a.get("redirectUrl"),sourceThreadId:a.get("sourceThread").id,forumId:b.pk,forum:b.id,requestBin:a.get("requestBin")};return a.session.isKnownToBeLoggedOut()||(c.userId=a.session.fromCookie().id),c},report:function(b){a.isEmpty(b)||c.client.emit(a.extend(this.snapshot(),b))},snapshot:function(){var b=this.threads,c=this.app,e=d.binToEventParams(c.get("requestBin")),f=c.session,g=f&&!f.isKnownToBeLoggedOut()?{userId:f.fromCookie().id}:{},h=a.extend({internal_organic:b&&b.length,external_organic:0,promoted:0,display:!0,placement:this.state.get("placement"),zone:"thread",area:this.state.get("placement"),thread_id:c.get("sourceThread").id,forum_id:c.get("sourceForum").pk},g,e,{object_type:"link"});return h}})}),define("templates/discovery",["handlebars"],function(a){return a.template({1:function(a,b,c,d,e){var f;return'<div class="follow-btn-wrap">\n'+(null!=(f=c["if"].call(null!=b?b:{},null!=(f=null!=b?b.user:b)?f.isSession:f,{name:"if",hash:{},fn:a.program(2,e,0),inverse:a.program(5,e,0),data:e}))?f:"")+"</div>\n"},2:function(a,b,c,d,e){var f;return(null!=(f=c["if"].call(null!=b?b:{},null!=(f=null!=b?b.user:b)?f.isEditable:f,{name:"if",hash:{},fn:a.program(3,e,0),inverse:a.noop,data:e}))?f:"")+"\n"},3:function(a,b,c,d,e){var f,g=a.escapeExpression;return'<a href="'+g(a.lambda(null!=(f=null!=b?b.user:b)?f.profileUrl:f,b))+'" data-action="edit-profile" target="_blank" class="btn follow-btn edit-profile">'+g(c.gettext.call(null!=b?b:{},"Edit profile",{name:"gettext",hash:{},data:e}))+"</a>\n"},5:function(a,b,c,d,e){var f;return null!=(f=c["if"].call(null!=b?b:{},null!=(f=null!=b?b.user:b)?f.isPrivate:f,{name:"if",hash:{},fn:a.program(6,e,0),inverse:a.program(8,e,0),data:e}))?f:""},6:function(a,b,c,d,e){return'<span class="btn follow-btn private">\n<i aria-hidden="true" class="icon-lock"></i>\n<span class="btn-text">'+a.escapeExpression(c.gettext.call(null!=b?b:{},"Private",{name:"gettext",hash:{},data:e}))+"</span>\n</span>\n"},8:function(a,b,c,d,e){var f,g=a.lambda,h=a.escapeExpression,i=null!=b?b:{};return'<a href="'+h(g(null!=(f=null!=b?b.user:b)?f.profileUrl:f,b))+'" class="btn follow-btn '+(null!=(f=c["if"].call(i,null!=(f=null!=b?b.user:b)?f.isFollowing:f,{name:"if",hash:{},fn:a.program(9,e,0),inverse:a.noop,data:e}))?f:"")+'" data-action="follow-user" data-user="'+h(g(null!=(f=null!=b?b.user:b)?f.id:f,b))+'">\n<span class="btn-text following-text">'+h(c.gettext.call(i,"Following",{name:"gettext",hash:{},data:e}))+'</span>\n<span class="btn-text follow-text">'+h(c.gettext.call(i,"Follow",{name:"gettext",hash:{},data:e}))+'</span>\n<i aria-hidden="true" class="icon-plus"></i> \n<i aria-hidden="true" class="icon-checkmark"></i>\n</a>\n'},9:function(a,b,c,d,e){return"following"},11:function(a,b,c,d,e,f,g){var h;return null!=(h=c.each.call(null!=b?b:{},null!=b?b.collection:b,{name:"each",hash:{},fn:a.program(12,e,0,f,g),inverse:a.noop,data:e}))?h:""},12:function(a,b,c,d,e,f,g){var h,i=a.lambda,j=a.escapeExpression,k=null!=b?b:{};return'<li class="discovery-post post-'+j(i(e&&e.index,b))+'" id="discovery-link-'+j(i(null!=b?b.domIdSuffix:b,b))+'">\n<a '+(null!=(h=a.invokePartial(d.linkAttributes,b,{name:"linkAttributes",data:e,helpers:c,partials:d,decorators:a.decorators}))?h:"")+' class="publisher-anchor-color">\n\n<header class="discovery-post-header">\n<h3 title="'+j(i(null!=b?b.title:b,b))+'">\n<span data-role="discovery-thread-title" class="title line-truncate" data-line-truncate="'+j(i(null!=(h=null!=g[1]?g[1].variant:g[1])?h.numLinesHeadline:h,b))+'">\n'+j(c.html.call(k,null!=b?b.title:b,{name:"html",hash:{},data:e}))+'\n</span>\n</h3>\n\n<ul class="meta">\n'+(null!=(h=c["if"].call(k,c.gt.call(k,null!=b?b.posts:b,0,{name:"gt",hash:{},data:e}),{name:"if",hash:{},fn:a.program(13,e,0,f,g),inverse:a.noop,data:e}))?h:"")+(null!=(h=c["if"].call(k,null!=b?b.createdAgo:b,{name:"if",hash:{},fn:a.program(15,e,0,f,g),inverse:a.noop,data:e}))?h:"")+"</ul>\n</header>\n\n"+(null!=(h=c.if_all.call(k,null!=(h=null!=g[1]?g[1].variant:g[1])?h.contentPreviews:h,null!=b?b.preview:b,{name:"if_all",hash:{},fn:a.program(17,e,0,f,g),inverse:a.noop,data:e}))?h:"")+"</a>\n</li>\n"},13:function(a,b,c,d,e){var f;return'<li class="comments">\n'+(null!=(f=a.invokePartial(d.discoveryPostCount,b,{name:"discoveryPostCount",data:e,helpers:c,partials:d,decorators:a.decorators}))?f:"")+"</li>\n"},15:function(a,b,c,d,e){return'<li class="time">'+a.escapeExpression(a.lambda(null!=b?b.createdAgo:b,b))+"</li>\n"},17:function(a,b,c,d,e){var f;return null!=(f=a.invokePartial(d.discoveryContentPreview,b,{name:"discoveryContentPreview",data:e,helpers:c,partials:d,decorators:a.decorators}))?f:""},19:function(a,b,c,d,e){var f;return'href="'+a.escapeExpression(a.lambda(null!=b?b.redirectUrl:b,b))+'" '+(null!=(f=c["if"].call(null!=b?b:{},null!=b?b.brand:b,{name:"if",hash:{},fn:a.program(20,e,0),inverse:a.noop,data:e}))?f:"")+"\n"},20:function(a,b,c,d,e){return'target="_blank" rel="nofollow norewrite"'},22:function(a,b,c,d,e){var f,g=a.lambda,h=a.escapeExpression;return"<a "+(null!=(f=a.invokePartial(d.linkAttributes,b,{name:"linkAttributes",data:e,helpers:c,partials:d,decorators:a.decorators}))?f:"")+' class="top-comment" data-role="discovery-top-comment">\n<img data-src="'+h(g(null!=(f=null!=(f=null!=(f=null!=b?b.preview:b)?f.author:f)?f.avatar:f)?f.cache:f,b))+'" alt="'+h(c.gettext.call(null!=b?b:{},"Avatar",{name:"gettext",hash:{},data:e}))+'" data-role="discovery-avatar">\n<p><span class="user" data-role="discovery-top-comment-author">'+h(g(null!=(f=null!=(f=null!=b?b.preview:b)?f.author:f)?f.name:f,b))+'</span> &#8212; <span data-role="discovery-top-comment-snippet" class="line-truncate" data-line-truncate="3">'+h(g(null!=(f=null!=b?b.preview:b)?f.plaintext:f,b))+"</span></p>\n</a>\n"},24:function(a,b,c,d,e){var f,g=null!=b?b:{};return null!=(f=c["if"].call(g,c.eq.call(g,null!=b?b.posts:b,1,{name:"eq",hash:{},data:e}),{name:"if",hash:{},fn:a.program(25,e,0),inverse:a.program(27,e,0),data:e}))?f:""},25:function(a,b,c,d,e){return a.escapeExpression(c.gettext.call(null!=b?b:{},"1 comment",{name:"gettext",hash:{},data:e}))+"\n"},27:function(a,b,c,d,e){return a.escapeExpression(c.gettext.call(null!=b?b:{},"%(numPosts)s comments",{name:"gettext",hash:{numPosts:null!=b?b.posts:b},data:e}))+"\n"},29:function(a,b,c,d,e,f,g){var h;return'<div id="'+a.escapeExpression(a.lambda(null!=b?b.id:b,b))+'" class="discovery-main">\n\n'+(null!=(h=c.each.call(null!=b?b:{},null!=b?b.sections:b,{name:"each",hash:{},fn:a.program(30,e,0,f,g),inverse:a.noop,data:e}))?h:"")+"\n</div>\n"},30:function(a,b,c,d,e,f,g){var h=a.lambda,i=a.escapeExpression,j=null!=b?b:{};return'<section id="'+i(h(null!=b?b.id:b,b))+'" class="'+i(h(null!=b?b.className:b,b))+'" >\n<header class="discovery-col-header">\n<h2>'+i(c.gettext.call(j,"Also on %(forumName)s",{name:"gettext",hash:{forumName:c.getPartial.call(j,"forumName",null!=g[1]?g[1].forum:g[1],{name:"getPartial",hash:{},data:e})},data:e}))+'</h2>\n</header>\n<ul class="discovery-posts" data-role="discovery-posts">\n</ul>\n</section>\n'},32:function(a,b,c,d,e){return"<strong>"+a.escapeExpression(a.lambda(null!=b?b.name:b,b))+"</strong>\n"},compiler:[7,">= 4.0.0"],main:function(a,b,c,d,e,f,g){var h,i=null!=b?b:{};return(null!=(h=c.partial.call(i,"followButton",{name:"partial",hash:{},fn:a.program(1,e,0,f,g),inverse:a.noop,data:e}))?h:"")+"\n"+(null!=(h=c.partial.call(i,"discoveryCollection",{name:"partial",hash:{},fn:a.program(11,e,0,f,g),inverse:a.noop,data:e}))?h:"")+"\n"+(null!=(h=c.partial.call(i,"linkAttributes",{name:"partial",hash:{},fn:a.program(19,e,0,f,g),inverse:a.noop,data:e}))?h:"")+"\n"+(null!=(h=c.partial.call(i,"discoveryContentPreview",{name:"partial",hash:{},fn:a.program(22,e,0,f,g),inverse:a.noop,data:e}))?h:"")+"\n"+(null!=(h=c.partial.call(i,"discoveryPostCount",{name:"partial",hash:{},fn:a.program(24,e,0,f,g),inverse:a.noop,data:e}))?h:"")+"\n"+(null!=(h=c.partial.call(i,"discoveryMain",{name:"partial",hash:{},fn:a.program(29,e,0,f,g),inverse:a.noop,data:e}))?h:"")+"\n"+(null!=(h=c.partial.call(i,"forumName",{name:"partial",hash:{},fn:a.program(32,e,0,f,g),inverse:a.noop,data:e}))?h:"")},usePartial:!0,useData:!0,useDepths:!0})}),define("discovery/main",["backbone","underscore","jquery","loglevel","when","common/Session","discovery/collections","discovery/helpers","discovery/views/Placement","discovery/models/SponsoredLinkAd","templates/discovery"],function(a,b,c,d,e,f,g,h,i,j,k){"use strict";k();var l={},m=1e4;return l.DiscoveryApp=a.Model.extend({defaults:{name:"default",contentPreviews:!0,organicEnabled:!0,redirectUrl:"http://disq.us/url",sourceThread:null,sourceForum:null,sourceThreadUrl:null,numColumns:2,maxPerColumn:2,maxOrganicTextLinks:4,innerContainerName:"discovery-main",lineTruncationEnabled:!0,numLinesHeadline:2},initialize:function(){var a=this;a.session=f.get(),a.bottomPlacement=new i({placement:"bottom",redirectUrl:this.get("redirectUrl")}),c("#placement-bottom").html(a.bottomPlacement.$el),a.set("innerContainerId",a.get("innerContainerName")+"-"+a.cid),a.createDataCollections()},createDataCollections:function(){var a="Organic";this.threads=new g.RelatedThreadCollection([],{name:a,minLength:2,maxLength:this.getCollectionMax(a)})},getViewportWidth:function(){return c(window.document).width()},getCollectionMax:function(a){return this.get("max"+a+"TextLinks")},run:function(){var a=this,b=e(a.get("organicEnabled")&&a.getDataOrganic());return b.then(function(){return a.threads.length?a.renderOrganicLinks():void d.debug("No organic links, bailing out")}).otherwise(function(a){d.debug("Organic-only Discovery failed"),h.reportError(a)})},renderOrganicLinks:function(){var a=new j({layout:"links"},{threads:this.threads,app:this});this.bottomPlacement.tryAd(a)},getDataOrganic:function(){var a={timeout:m,data:{thread:this.get("sourceThread").id},reset:!0,humanFriendlyTimestamp:!0};return this.threads.fetch(a,this.get("contentPreviews"))}}),l.init=function(a,c){var d=a.forum.get("settings"),e=b.extend({},{sourceThread:a.toJSON(),sourceForum:a.forum.toJSON(),sourceThreadUrl:a.currentUrl||window.document.referrer,organicEnabled:d.organicDiscoveryEnabled,service:c.service,experiment:c.experiment,variant:c.variant}),f=new l.DiscoveryApp(e);return f.run(),f},l}),define("discovery.bundle",function(){});