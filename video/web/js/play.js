/**
 * play.js
 * --------------------------------------------------------------------------------------------------------------------
 */
var bgSpeed=3;
var player = videojs("v1",{}, function(){
    this.on("durationchange",function(){
        var duration=this.duration();
        ajaxForm.action(null,{
            url:"action/loadBarrage.php",
            data:{vid:vid},
            success:function(data){
                if(data.ok){
                    var html=$("<div class='barg-div'></div>");
                    var path=$("<div class='path'></div>").css("width",duration*bgSpeed*16+"px");
                    html.append(path.clone());
                    html.append(path.clone());
                    html.append(path.clone());
                    html.append(path.clone());
                    html.append(path.clone());
                    for(var i=0;i<data.data.length;i++){
                        var span=$("<span></span>").css("left",data.data[i].pos*bgSpeed*16+"px").html(data.data[i].msg);
                        html.find(".path").eq(i%5).append(span);
                    }
                    $(".video-js").append(html);
                }
            }
        });
    });
    this.on("timeupdate",function(){
        $(".barg-div") && $(".barg-div>.path").css("left",-this.currentTime()*bgSpeed*16+"px");
    });
});

/**
 * barrage Manager
 * --------------------------------------------------------------------------------------------------------------------
 */
var barrage={};
barrage.sendBtn=$("#bg-submit")[0];
barrage.sendInput=$("#bg-text")[0];
barrage.init=function(){
    var _this=this;
    switchEvent("#bg-toggle",
        function(){
            $(".barg-div").show();
        },function(){
            $(".barg-div").hide();
        });
    $(_this.sendBtn).click(function(){_this.send()});
};
barrage.log=function(msg){
    alert(msg);
};
barrage.send=function(){
    var _this=this;
    var msg=$(_this.sendInput).val();
    var pos=player.currentTime();
    var duration=player.duration();
    if(!isLogin){
        _this.log("您還未登錄");
        return;
    }
    if(pos<=0||pos>=duration){
        _this.log("無效時間");
        return;
    }
    if(/^\s*$/.test(msg)){
        _this.log("無效文本");
        return;
    }
    if(msg.length<=0||msg.length>15){
        _this.log("文本超過字符數限制");
        return;
    }
    ajaxForm.action(_this.sendBtn,{
        type:"post",
        url:"action/sendBarrage.php",
        data:{vid:vid,msg:msg,pos:pos,duration:duration},
        success:function(data){
            if(data.ok){
                _this.sendOk(msg,pos);
            }else if(data.msg){
                _this.log(data.msg);
            }else{
                _this.log("查詢失敗");
            }
        }
    });
};
barrage.sendOk=function(msg,pos){
    var _this=this;
    $(_this.sendInput).val(null);
    setTimeout(bgTimeout,0,60);
    var span=$("<span style='color:blue'></span>").css("left",pos*bgSpeed*16+"px").html(msg);
    var i = Math.floor(Math.random()*5);
    $(".barg-div").find(".path").eq(i%5).append(span);
};
var bgTimeout=function(sec){
    if(sec==0){
        $(barrage.sendBtn).attr("disabled",false).text("推送彈幕");
    }else{
        $(barrage.sendBtn).attr("disabled",true).text(sec);
        setTimeout(bgTimeout,1000,sec-1);
    }
};

//init
$(function(){
    barrage.init();
    comment.init();
    cmpage.init();
});

/*
 * comment Manager
 * ------------------------------------------------------------------------------------------------------------------
 */
var comment={};
comment.sendBtn=$("#cm-submit")[0];
comment.sendInput=$("#cm-text")[0];
comment.log=function(msg){
    alert(msg);
};
comment.init=function(){
    var _this=this;
    $(_this.sendBtn).click(function(){_this.send();});
};
comment.send=function(){
    var _this=this;
    var text = $(_this.sendInput).val();
    if (!isLogin) {
        _this.log("您還為登錄");
        return;
    }
    if (/^\s*$/.test(text)) {
        _this.log("文本為空");
        return;
    }
    ajaxForm.action(_this.sendBtn,{
        type: "post",
        url: "action/sendComment.php",
        data: {vid: vid, text: text},
        success: function (data) {
            if (data.ok) {
                _this.sendOk(data.data,text);
            } else if (data.msg) {
                _this.log(data.msg);
            } else {
                _this.log("查詢失敗");
            }
        }
    });
};
comment.sendOk=function(data,text){
    var _this=this;
    $(_this.sendInput).val(null);
    setTimeout(cmTimeout,0,300);
    //
    var html=template("cm-li",{cm:
        {
            id:data.id,
            nick:data.nick,
            text:text,
            count:data.count,
            time:data.time,
            suport:0,
            object:0,
            reply:[]
        }
    });
    $(".cm-div").prepend(html);
};
comment.getReplyBtn=function(){
    return $(".re_sd").find("button");
};
var cmTimeout=function(sec){
    if(sec==0){
        $(comment.sendBtn).attr("disabled",false).text("提交");
    }else{
        $(comment.sendBtn).attr("disabled",true).text(sec);
        setTimeout(cmTimeout,1000,sec-1);
    }
};

/**
 * comment page manager
 * ------------------------------------------------------------------------------------------------------------------
 */
cmpage={};
cmpage.div=function(){
    return $(".li-page")[0];
};
cmpage.pDiv=$(".cm-div")[0];
cmpage.limit=10;
cmpage.totalPage=1;
cmpage.curPage=1;
cmpage.buffer=[];
cmpage.init=function(){
    var _this=this;
    ajaxForm.action(null,{
        type:"post",
        url:"action/loadCommentInfo.php",
        data:{vid:vid},
        success:function(data) {
            if(data.ok){
                _this.totalPage=Math.ceil(data.data.count/_this.limit);
                _this.load(1);
            }
        }
    })
};
cmpage.disabled=function(bool){
    $(this.div()).find("a").prop("onclick",null);
};
cmpage.lastPage=function(){
    this.load(this.totalPage);
};
cmpage.load=function(page){
    var _this=this;
    _this.curPage=page;
    _this.disabled();
    if(_this.buffer[page]){
        _this.loadOk(_this.buffer[page]);
        return;
    }
    ajaxForm.action(null,{
        type:"get",
        url:"action/loadComment.php",
        data:{vid:vid,limit:_this.limit,offset:(page-1)*_this.limit},
        success:function(data){
            if(data.ok){
                if(!_this.buffer[page]){
                    _this.buffer[page]=data.data;
                }
                _this.loadOk(data.data);
            }
        }
    });
};
cmpage.loadOk=function(d){
    var _this=this;
    $(_this.pDiv).empty();
    for(var i=0;i<d.length;i++){
        var html=template("cm-li",{cm:d[i]});
        $(_this.pDiv).append(html);
    }
    html=template("cm-pg",{curPage:_this.curPage,totalPage:_this.totalPage});
    $(_this.pDiv).append(html);
};
/**
 * Reply Manager
 * --------------------------------------------------------------------------------------------------------------------
 */
function Reply(div){
    this.html=div;
}
Reply.prototype.getCid=function(){
    return $(this.html).data("cid");
};
Reply.prototype.sendBtn=function(){
    return $(this.html).find(".re_sd button");
};
Reply.prototype.getReplyCountSpan=function(){
    return $(this.html).parents(".li").find("[field=reply]");
};
Reply.prototype.sendInput=function(){
    return $(this.html).find(".re_sd input");
};
Reply.prototype.send=function(){
    var _this=this;
    var text=_this.sendInput().val();
    if(!isLogin){
        comment.log("用戶未登錄");
        return;
    }
    if(/^\s*$/.test(text)){
        comment.log("無效文本");
        return;
    }
    ajaxForm.action(_this.sendBtn(),{
        type:"post",
        url:"action/sendReply.php",
        data:{vid:vid,cid:_this.getCid(),text:text},
        success:function(data){
            if(data.ok){
                _this.sendOk(data.data);
            }else if(data.msg){
                comment.log(data.msg);
            }else{
                comment.log("查詢失敗");
            }
        }
    });
};
Reply.prototype.sendOk=function(data){
    $(this.sendInput()).val(null);
    setTimeout(reTimeout,0,120);
    //append
    var html=template("re-li",{reply:data});
    $(this.html).find(".re-insert").before(html);
    var span=this.getReplyCountSpan();
    span.text(parseInt(span.text())+1);
};
Reply.prototype.toggle=function(){
    $(this.html).toggleClass("hide");
};
Reply.prototype.moreRe=function(){
    $(this.html).find(".re_li").show();
    $(this.html).find(".re_ctrl [more]").hide();
    $(this.html).find(".re_ctrl [less]").show();
};
Reply.prototype.lessRe=function(){
    $(this.html).find(".re_li:gt(2)").hide();
    $(this.html).find(".re_ctrl [more]").show();
    $(this.html).find(".re_ctrl [less]").hide();
};
var reTimeout=function(sec){
    if(sec==0){
        $(comment.getReplyBtn()).attr("disabled",false).text("回復");
    }else{
        $(comment.getReplyBtn()).attr("disabled",true).text(sec);
        setTimeout(reTimeout,1000,sec-1);
    }
};
//element event
function onSendRe(btn){
    var div=$(btn).parents(".r_re");
    var reply=new Reply(div);
    reply.send();
}
function onToggleRe(a){
    var div=$(a).parents(".li").find(".r_re");
    var reply=new Reply(div);
    reply.toggle();
}
function onMoreRe(a){
    var div=$(a).parents(".li").find(".r_re");
    var reply=new Reply(div);
    reply.moreRe();
}
function onLessRe(a){
    var div=$(a).parents(".li").find(".r_re");
    var reply=new Reply(div);
    reply.lessRe();
}

/**
 * Suport Manager
 */
 function Suport(div){
    this.html=div;
}
Suport.prototype.getCid=function(){
    return $(this.html).data("cid");
};
Suport.prototype.sendSup=function(){
    var _this=this;
    var cid=_this.getCid();
    if(!isLogin){
        comment.log("用戶未登錄");
        return;
    }
    if(getCookie("vsup10_"+vid+"#"+cid)){
        comment.log("已經頂過了，24小時之後再試");
        return;
    }
    if(matchCookie("vsup10_")>=10){
        comment.log("操作已到達上限，24小時之後再試");
        return;
    }
    ajaxForm.action(null,{
        type:"post",
        url:"action/sendSuport.php",
        data:{vid:vid,cid:cid},
        success:function(data){
            if(data.ok){
                _this.sendSupOk(vid,cid);
            }else if(data.msg){
                comment.log(data.msg);
            }else{
                comment.log("查詢失敗");
            }
        }
    });
};
Suport.prototype.sendSupOk=function(vid,cid){
    var span=$(this.html).find("[field=suport]");
    span.text(parseInt(span.text())+1);
    setCookie("vsup10_"+vid+"#"+cid,1,1);
};
Suport.prototype.sendObj=function(){
    var _this=this;
    var cid=_this.getCid();
    if(!isLogin){
        comment.log("用戶未登錄");
        return;
    }
    if(getCookie("vobj10_"+vid+"#"+cid)){
        comment.log("已經踩過了，24小時之後再試");
        return;
    }
    if(matchCookie("vobj10_")>=10){
        comment.log("操作已到達上限，24小時之後再試");
        return;
    }
    ajaxForm.action(null,{
        type:"post",
        url:"action/sendObject.php",
        data:{vid:vid,cid:cid},
        success:function(data){
            if(data.ok){
                _this.sendObjOk(vid,cid);
            }else if(data.msg){
                comment.log(data.msg);
            }else{
                comment.log("查詢失敗");
            }
        }
    });
};
Suport.prototype.sendObjOk=function(vid,cid){
    var span=$(this.html).find("[field=object]");
    span.text(parseInt(span.text())+1);
    setCookie("vobj10_"+vid+"#"+cid,1,1);
};
//
function onSendObj(a){
    var div=$(a).parents(".r_b");
    var suport=new Suport(div);
    suport.sendObj();
}
function onSendSup(a){
    var div=$(a).parents(".r_b");
    var suport=new Suport(div);
    suport.sendSup();
}