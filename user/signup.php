<!DOCTYPE html>
<html>
<head>
    <meta charset=utf-8 />
    <title>signup</title>
    <style>
        body{font-size:14px;}
        .page{width:96%;margin:10px auto;min-width:1000px;}
        .sec{border:1px solid #A6CBE7;}
        .sec>h3{margin:0;font-size:14px;background: #B1D3E0;padding:0 3px;line-height: 22px;}
        .ip-sec>.info{padding:10px;}
        .login-sec{margin-top:10px;}
        .login-sec>.info{padding:10px;}
        input[type=text],input[type=password]{width:170px;}
    </style>
</head>
<body>
    <?php include("../nav.php") ?>
    <div class="page">
        <div class="sec ip-sec">
            <h3>網路信息</h3>
            <div class="info">
                <table>
                    <tbody>
                        <tr><td style="width:100px;">ip:</td><td><span id="ip"></span</td></tr>
                        <tr><td style="width:100px;">country:</td><td><span id="country"></span</td></tr>
                        <tr><td style="width:100px;">city:</td><td><span id="city"></span</td></tr>
                        <tr><td style="width:100px;">loc:</td><td><span id="loc"></span</td></tr>
                        <tr><td style="width:100px;">org:</td><td><span id="org"></span</td></tr>
                        <tr><td style="width:100px;">region:</td><td><span id="region"></span</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="sec login-sec">
            <h3>註冊信息</h3>
            <div class="info">
                <input type="hidden" name="ip" id="ip-signup">
                <input type="hidden" name="country" id="country-signup">
                <input type="hidden" name="city" id="city-signup">
                <table>
                    <tbody>
                        <tr><td style="width:100px;">用戶名:</td><td style="width:180px"><input type="text" name="user"></td><td>限制(0-9,a-z,A-Z,_,-)組合,5至15個字符</td></tr>
                        <tr><td style="width:100px;">會員名:</td><td style="width:180px"><input type="text" name="nick"></td><td>非空字符</td></tr>
                        <tr><td style="width:100px;">密碼:</td><td style="width:180px"><input type="password" name="pass"></td><td>限制(0-9,a-z,A-Z,_,-)組合,8至15個字符</td></tr>
                        <tr><td style="width:100px;">重複密碼:</td style="width:180px"><td><input type="password" name="pass1"><td></td></tr>
                        <tr><td style="width:100px;"></td><td colspan="2"><span class="err"></span></td></tr>
                        <tr><td style="width:100px;"></td><td colspan="2"><input type="submit" class="btn btn1" value="提交"></td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    <script>
        $.get("http://ipinfo.io", function(response) {
            $("#ip").html(response.ip);
            $("#country").html(response.country);
            $("#city").html(response.city);
            $("#loc").html(response.loc);
            $("#org").html(response.org);
            $("#region").html(response.region);
            $("#ip-signup").val(response.ip);
            $("#country-signup").val(response.country);
            $("#city-signup").val(response.city);
        }, "jsonp");
        function log(msg){
            $(".err").html(msg);
        }
        $("[input[type=submit]").click(function(){
            var user=$("[name=user]").val();
            var nick=$("[name=nick]").val();
            var pass=$("[name=pass]").val();
            var pass1=$("[name=pass1]").val();
            var ip=$("[name=ip]").val();
            var country=$("[name=country]").val();
            var city=$("[name=city]").val();
            $.post("action/signup.php",{user:user,nick:nick,pass:pass,pass1:pass1,ip:ip,country:country,city:city},function(data){
                if(data.ok){
                    location.href="signin.php";
                }else if(data.msg){
                    log(data.msg);
                }else{
                    log("查詢出錯");
                }
            });
        });
    </script>
</body>
</html>

