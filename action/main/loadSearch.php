<?php
require_once("../../php/global.php");
require_once("../../php/TimeUtil.php");
//參數檢查
if(!isset($_REQUEST["key"])){
    die_json(["msg"=>"缺少参数"]);
}
$key=preg_replace("/\s/","",$_REQUEST["key"]);
$key_len=mb_strlen($key);
if($key_len<=0||$key_len>20){
    die_json("查询字太长或太短");
}
//search查詢
$conn = new mysqli($mysql["host"], $mysql["user"], $mysql["password"], $mysql["database"]);
$conn->set_charset("utf8");
//title和categery查詢
$vs=[];
for($l=$key_len;$l>0;$l--){
    for($s=0;$s<=$key_len-$l;$s++){
        $stmt=$conn->prepare("select video.*,units.domain from video join units on video.unit=units.id where title like ? or categery like ?");
        $preg="%".mb_substr($key,$s,$l)."%";
        $stmt->bind_param("ss",$preg,$preg);
        $stmt->execute();
        $result=$stmt->get_result();
        $raw_res=$result->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        //合併去重
        $arr=array_merge($vs,$raw_res);
        $tmp_arr=[];
        foreach($arr as $k => $v){
            if(in_array($v["id"],$tmp_arr)){
                unset($arr[$k]);
            }else{
                $tmp_arr[] = $v["id"];
            }
        }
        $vs=$arr;
    }
}
//time格式
foreach($vs as $k=>$v){
    $vs[$k]["time_str"]=time_tran($vs[$k]["time"]);
    $vs[$k]["poster"]=generateResourceUrl($vs[$k]["id"].".png",$vs[$k]["domain"]);
}
die_json(["ok"=>"ok","data"=>$vs]);