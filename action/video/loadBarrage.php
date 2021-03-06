<?php
require_once("../../php/global.php");

/**
 *  成功返回:{ok:"ok",data:data}
 *  錯誤返回:{msg:msg_text}
 *  異常:其他
 */

//參數檢查
if(!isset($_REQUEST["vid"])){
    die_json(["msg"=>"缺少参数"]);
}
$vid=$_REQUEST["vid"];
$limit=2147483648;
$offset=0;
if(isset($_REQUEST["limit"])){
    $limit=$_REQUEST["limit"];
}
if(isset($_REQUEST["offset"])){
    $offset=$_REQUEST["offset"];
}
//數據庫操作
$conn = new mysqli($mysql["host"], $mysql["user"], $mysql["password"], $mysql["database"]);
$conn->set_charset("utf8");
//查詢
$stmt=$conn->prepare("select msg,pos from video_barrage where vid = ? order by pos asc limit ? offset ?");
$stmt->bind_param("iii",$vid,$limit,$offset);
$stmt->execute();
$result=$stmt->get_result();
$data=$result->fetch_all(MYSQLI_ASSOC);
$stmt->close();
die_json(["ok"=>"ok","data"=>$data]);
